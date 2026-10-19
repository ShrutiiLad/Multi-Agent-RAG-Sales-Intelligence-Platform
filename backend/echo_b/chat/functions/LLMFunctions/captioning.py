import base64
import aiohttp
from PIL import Image
from io import BytesIO
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from core.functions.globalFunctions import EchoLogging, ErrorHandler
from langchain_core.messages import HumanMessage
from channels.db import database_sync_to_async
from chat.models import Message
from chat.models import MessageFile
from chat.functions.LLMFunctions.llm_settings import DEF_MODEL_FOR_NON_USER_TASK
#handler to init the captioning class and handle the query through list of image urls/files
load_dotenv()

#TODO: create an multi-threaded handler to handle the captioning of images
@ErrorHandler.logAndHandleErrors
async def handleCaptioning(imageUrls, messageObj):
    captions = ""
    try:
        captionsFromUrls = ""
        if imageUrls:
            captionsFromUrls = await getCaptions(imageUrls, messageObj)
            if captionsFromUrls:
                captions ="""\n You need to pretend that you can see. Here are the descriptions for the images uploaded:\n'"""+ captionsFromUrls + "\nDon't mention 'the description provided', say 'based on the image uploaded.\n"
                return captions
        else:
            return captions
    except Exception as e:
        EchoLogging().log(f"An error occurred while processing your query: {e}", exc_info=True)
        return captions


#class to caption images
@ErrorHandler.logAndHandleErrors
async def getCaptions(images, messageObj):
    try:
        handler = ImageCaptioner(messageObj=messageObj)
        EchoLogging().log("Processing image captions.")
        return await handler.handle_captioning(images)
    except Exception as e:
        EchoLogging().log(f"An error occurred while processing your query: {e}", exc_info=True)
        return f"An error occurred while processing your query: {e}"

class DataBaseOperations():
    def __init__(self):
        self.logger = EchoLogging()
        self.logger.log("Initializing DatabaseOperations.")
    
    @ErrorHandler.logAndHandleErrors
    @database_sync_to_async
    def getMessageFileObject(self, id):
        """
        Fetches a MessageFile object from the database by its ID.
        """
        try:
            return MessageFile.objects.get(id=id)
        except MessageFile.DoesNotExist:
            self.logger.log(f"MessageFile with ID: {id} does not exist.", exc_info=True)
            return None

    @ErrorHandler.logAndHandleErrors
    @database_sync_to_async
    def updateMessageFileObject(self, messageFile):
        """
        Updates a MessageFile object in the database.
        """
        try:
            self.logger.log(f"Updating MessageFile object with ID: {messageFile.id}")

            messageFile.save()
            self.logger.log(f"Updated MessageFile object with ID: {messageFile.id}")
            return messageFile
        except Exception as e:
            self.logger.log(f"An error occurred while updating the MessageFile object: {e}", exc_info=True)
            return None

    @ErrorHandler.logAndHandleErrors
    @database_sync_to_async
    def createMessageFileObject(self, *args, **kwargs):
        """
        Function to create a messageFile object in the database.
        """
        try:
            self.logger.log("Creating messageFile object.")
            return MessageFile.objects.create(**kwargs)
        except Exception as e:
            self.logger.log(f"An error occurred while creating the messageFile object: {e}", exc_info=True)
            return None
    
class ImageCaptioner():
# we create imagefiles
    @ErrorHandler.logAndHandleErrors 
    def __init__(self, messageObj:Message = None):
        self.logger = EchoLogging()
        self.dbo = DataBaseOperations()
        self.messageObj = messageObj
        self.agent = ChatOpenAI(model=DEF_MODEL_FOR_NON_USER_TASK, max_tokens=250)
        self.logger.log("Initializing ImageCaptioner.")
        self.content = [{"type": "text", "text": """You are AI assistant that enables other large language models to see images. 
                         Describe visual components of the image to assist the large language models to help users with any of their queries."""}]

    @ErrorHandler.logAndHandleErrors
    async def encodeImage(self, imageUrl, max_image=512):
        try:
            self.logger.log("Encoding image.")
            async with aiohttp.ClientSession() as session:
                async with session.get(imageUrl) as response:
                    if response.status != 200:
                        self.logger.log(f"Failed to retrieve image, status code: {response.status}", exc_info=True)
                        return None
                    image_data = await response.read()
                    img = Image.open(BytesIO(image_data))
            width, height = img.size
            max_dim = max(width, height)
            if max_dim > max_image:
                scale_factor = max_image / max_dim
                new_width = int(width * scale_factor)
                new_height = int(height * scale_factor)
                img = img.resize((new_width, new_height))
            buffered = BytesIO()
            img.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
            self.logger.log("Image encoded.")
            return img_str
        except Exception as e:
            self.logger.log(f"An error occurred while encoding the image: {e}", exc_info=True)
            return None


    @ErrorHandler.logAndHandleErrors
    async def createImageFile(self,message,caption,link=None,file=None):
        """
        Function to create a messageFile object in the database.
        """
        try:
            self.logger.log("Creating messageFile object.")
            return await self.dbo.createMessageFileObject(message=message, link=link, file=file, caption=caption)
        except Exception as e:
            self.logger.log(f"An error occurred while creating the messageFile object: {e}", exc_info=True)
            return None

    @staticmethod
    def getContentPrompt(image):
        return [{"type": "text", "text": "What's in this image? Describe visual components."}, {"type": "image_url", "image_url": {"url":
                        f"data:image/jpeg;base64,{image}"},}]

    @ErrorHandler.logAndHandleErrors
    async def getImageCaptions(self, image):
        """
        Function to invoke the captioning model and get the caption for the image
        """
        try:
            self.logger.log(f"Getting caption for image. {self.content}")
            content = ImageCaptioner.getContentPrompt(await self.encodeImage(image))
            message = HumanMessage(content=content)
            response = self.agent.invoke([message])
            self.logger.log(f"Response from OpenAI: {response}")
            result = response.content
            self.logger.log(f"Caption for image: {result}")
            return result.strip()
        except Exception as e:
            self.logger.log(f"An error occurred while processing the image: {e}", exc_info=True)
            
            return "Couldn't process the image. Please tell the user to try later."
    
    async def captionSingleImageUrl(self, imageUrl):
        """
        Function to caption a single image URL.
        """
        try:
            caption = await self.getImageCaptions(imageUrl)
            if self.messageObj and caption:
                image = await self.createImageFile(message=self.messageObj, link=imageUrl, caption=caption)
                self.logger.log(f"Image <{image}> processed.")
                return image
        except Exception as e:
            self.logger.log(f"An error occurred while processing the image: {e}", exc_info=True)
            return None

    @ErrorHandler.logAndHandleErrors
    async def imagesAreUrls(self, imageUrls):
        """
        Handles the captioning of images from URLs.
        """
        images = []
        self.logger.log("Processing image URLs.")
        try:
            for index, imageUrl in enumerate(imageUrls):
                image =await self.captionSingleImageUrl(imageUrl)
                images.append(image)
            return images
        except Exception as e:
            self.logger.log(f"An error occurred while processing the image: {e}", exc_info=True)
            return None
    
    @ErrorHandler.logAndHandleErrors
    async def imagesAreFiles(self, imageFiles):
        """
        Handles the captioning of images from files and updates their captions.
        """
        images = []
        self.logger.log("Processing image files.")
        try:
            for index, imageFile in enumerate(imageFiles):
                if imageFile.file:
                    imageUrl = imageFile.file
                    caption = await self.getImageCaptions(imageUrl)
                    self.logger.log(f"Caption for image: {caption}")
                    if self.messageObj and caption:
                        messageFile = await self.dbo.getMessageFileObject(id=imageFile.id)
                        if messageFile:
                            messageFile.caption = caption
                            await self.dbo.updateMessageFileObject(messageFile)
                            self.logger.log(f"Updated caption for MessageFile with ID: {messageFile.id}")
                            images.append(messageFile)
                        else:
                            self.logger.log(f"MessageFile with ID: {imageFile.id} not found.")
        except Exception as e:
            self.logger.log(f"An error occurred while processing the image: {e}", exc_info=True)
            return None
        return images
        
    
    @ErrorHandler.logAndHandleErrors
    async def validateList(self, images):
        """
        Validates the input images.
        """
        if not images or not isinstance(images, list):
            self.logger.log("Invalid input. Please provide a list of image URLs or files.")
            return False
        self.logger.log("Valid input.")
        return True
    
    @ErrorHandler.logAndHandleErrors
    async def chooseCaptioningMethod(self, images):
        """
        Chooses the captioning method based on the input.
        """
        if all(isinstance(image, str) for image in images):
            return await self.imagesAreUrls(images)
        elif all(isinstance(image, MessageFile) for image in images):
            return await self.imagesAreFiles(images)
        else:
            self.logger.log("Invalid input. Please provide a list of image URLs or files.")
            return None


    @ErrorHandler.logAndHandleErrors
    async def handle_captioning(self, images):
        """
        Handles the captioning of images. 
        Flow:
        1. Validate the input images.
            - Input should always be a list.
            - Each element in the list should be a valid image URL or file.
        2. If input is a list of imageUrls send the list to imageUrls call imagesAreUrls method.
        3. If input is a list of imageFiles send the list to imageFiles call imagesAreFiles method.
        4. Return the captions for the images.
        """
        if not await self.validateList(images):
            return None
        else:
            images = await self.chooseCaptioningMethod(images)
            self.logger.log(f"ALL THE IMAGES: {images}")
            self.logger.log(f"ALL THE IMAGES TYPES: {type(images)}")
            try:
                imageCaption = ""
                if images:
                    for index, image in enumerate(images):
                        self.logger.log(f"Image: {image.caption}")
                        imageCaption += f"Image {index+1}:\n{image.caption}\n\n"
                    self.logger.log(f"Total Caption: {imageCaption}")
                return imageCaption
            except Exception as e:
                self.logger.log(f"An error occurred while processing the image: {e}", exc_info=True)
                return None
