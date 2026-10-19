import logging
from langchain_community.document_loaders import PyPDFLoader
from core.functions.globalFunctions import EchoLogging
from langchain_core.documents import Document as LangchainDocument
from langchain_community.document_loaders import UnstructuredHTMLLoader
from core.models import InterviewAnswer, InterviewQuestion
from langchain_text_splitters import RecursiveCharacterTextSplitter
from django.conf import settings
import os
import pandas as pd
import re
import dotenv
import os

dotenv.load_dotenv()

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

logger = EchoLogging()

class Feedinator:
    def clean_text(self, text: str) -> str:
        text = text.replace('\n', ' ')
        return text


    def load_pdf(self, document, metadata:dict, split_by_pages: bool = False):
        """
        Load the PDF file from the document and return a List of LangchainDocument objects.

        Args:
            document (Document): The document object to load the PDF from.
            metadata (dict): The metadata to attach to the document.
            split_by_pages (bool, optional): Whether to split the PDF by pages. Defaults to False.

        Returns:
            List[LangchainDocument]: A list of LangchainDocument objects.
        """

        try:
            target_dir = os.path.join(settings.MEDIA_ROOT)
            os.makedirs(target_dir, exist_ok=True)
            file = document.file

            if not file.name:
                logger.log("No file attached to the document")
                return
            elif not file.name.endswith(".pdf"):
                logger.log("File is not a PDF")
                return
            else:
                target_file_path = os.path.join(target_dir, file.name)
                if os.path.exists(target_file_path):
                    logger.log(f"Loading PDF from {target_file_path}")
                    pdf_loader = PyPDFLoader(target_file_path)

                    if split_by_pages:
                        langchain_documents = pdf_loader.load_and_split()
                    else:
                        langchain_documents = pdf_loader.load()

                    logging.info(f"PDF loaded successfully from {target_file_path}")
                    for page in langchain_documents:
                        page.page_content = self.clean_text(page.page_content)
                        page.metadata = metadata.copy()

                    return langchain_documents

                else:
                    logger.log(f"File does not exist at path: {target_file_path}")

        except Exception as e:
            logger.log(f"An error occurred while loading the PDF: {e}", exc_info=True)
            return None
        
    def load_html(self, document, metadata:dict):
        """
        Load the HTML file from the document and return a List of LangchainDocument objects.

        Args:
            document (Document): The document object to load the HTML from.
            metadata (dict): The metadata to attach to the document.

        Returns:
            List[LangchainDocument]: A list of LangchainDocument objects.
        """
        try:
            os.environ['NLTK_DATA'] = r"C:\Users\Nikhil\Desktop\My Stuff\Echo AI\Echo-Back-Front\echo_b\echo_b"
            import nltk
            nltk.data.find(os.path.join(os.environ['NLTK_DATA'], 'tokenizers/punkt'))
            nltk.data.find(os.path.join(os.environ['NLTK_DATA'], 'taggers/averaged_perceptron_tagger'))
            # nltk.load('averaged_perceptron_tagger',download_dir=os.environ['NLTK_DATA'])


            # nltk.download('punkt', download_dir=os.environ['NLTK_DATA'], halt_on_error=False)
            # nltk.download('averaged_perceptron_tagger',download_dir=os.environ['NLTK_DATA'], halt_on_error=False)
            target_dir = os.path.join(settings.MEDIA_ROOT)
            os.makedirs(target_dir, exist_ok=True)
            file = document.file

            if not file.name:
                logger.log("No file attached to the document")
                return
            elif not file.name.endswith(".html") and not file.name.endswith(".htm"):
                logger.log("File is not an HTML file")
                return
            else:
                target_file_path = os.path.join(target_dir, file.name)
                if os.path.exists(target_file_path):
                    logger.log(f"Loading HTML from {target_file_path}")
                    html_loader = UnstructuredHTMLLoader(target_file_path)
                    langchain_documents = html_loader.load()

                    logging.info(f"HTML loaded successfully from {target_file_path}")
                    for page in langchain_documents:
                        page.page_content = self.clean_text(page.page_content)
                        page.metadata = metadata.copy()

                    return langchain_documents

                else:
                    logger.log(f"File does not exist at path: {target_file_path}")

        except Exception as e:
            logger.log(f"An error occurred while loading the HTML: {e}", exc_info=True)
            return None


    def read_dataframe(self, file, target_dir):
        target_file_path = os.path.join(target_dir, file.name)
        if file.name.endswith(".csv"):
            return pd.read_csv(target_file_path)
        elif file.name.endswith(".xlsx"):
            return pd.read_excel(target_file_path)


    def process_interview_dataframe(self, df, document, metadata:dict):
        grouped_df = df.groupby('Question')
        langchain_docs = []
        for question, group in grouped_df:
            try:
                questionObj = InterviewQuestion.objects.create(question=question, document=document)
                for index, row in group.iterrows():
                    InterviewAnswer.objects.create(answer=row['Answer'], question=questionObj)
                lang_doc = self.add_interview_to_collections(questionObj, document, metadata)
                langchain_docs.append(lang_doc)
            except Exception as e:
                logger.log(f"An error occurred while creating the InterviewQuestion object: {e}", exc_info=True)
        return langchain_docs


    def add_interview_to_collections(self, question, document, metadata:dict):
        metadata["question_id"] = str(question.id)
        metadata["document_id"] = str(document.id)
        doc = LangchainDocument(page_content=str(question), metadata=metadata)
        return doc


    def load_interview_doc(self, document, metadata:dict):
        """
        Load the interview document from the document and return a List of LangchainDocument objects.

        Args:
            document (Document): The document object to load the interview from.
            metadata (dict): The metadata to attach to the document.
        
        Returns:
            List[LangchainDocument]: A list of LangchainDocument objects.
        """
        try:
            target_dir = os.path.join(settings.MEDIA_ROOT)
            os.makedirs(target_dir, exist_ok=True)
            file = document.file
            if file.name.endswith((".csv", ".xlsx")):
                df = self.read_dataframe(file, target_dir)
                langchain_docs = self.process_interview_dataframe(df, document, metadata)
                return langchain_docs
        except Exception as e:
            logger.log(f"An error occurred while loading the interview document: {e}", exc_info=True)


    def read_sections(self, file, target_dir):
        target_file_path = os.path.join(target_dir, file.name)
        with open(target_file_path, "r", encoding="utf-8") as f:
            content = f.read()
        return content.split("### ")


    def process_sections(self, sections, document, metadata:dict):
        for index, section in enumerate(sections):
            if isinstance(section, tuple):  # Check if section is a tuple
                section = section[0]  # If it's a tuple, extract the first element
            lines = section.split("\n")
            section_title = lines[0]
            section_content = "\n".join(lines[1:])
            if section_title and len(section_content) >= 10:
                self.process_section(section_title, section_content, document, metadata)


    def process_section(self, section_title, section_content, document, metadata:dict):
        section_title = self.remove_special_characters_and_numbers(section_title).strip().replace(" ", "_")
        metadata["document_id"] = str(document.id)
        metadata["section_title"] = section_title
        metadata["section_sub_title"] = section_title
        if len(section_content) > 10000:
            self.split_and_process_section(section_content, metadata, document)
        else:
            doc = LangchainDocument(page_content=str(section_content), metadata=metadata)
            self.langchain_mega_docs.append([doc])


    def split_and_process_section(self, section_content, metadata, document):
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=5000, chunk_overlap=0)
        all_splits = text_splitter.split_documents([LangchainDocument(page_content=section_content)])
        for index, split in enumerate(all_splits):
            metadata["section_sub_title"] = str(index) + "_" + metadata["section_sub_title"]
            doc = LangchainDocument(page_content=str(split), metadata=metadata)
            self.langchain_mega_docs.append([doc])


    def remove_special_characters_and_numbers(self, text):
        return re.sub(r'[^a-zA-Z\s]', '', text)


    def load_mega_doc(self, document, metadata:dict):
        """
        Load the mega document from the document and return a List of LangchainDocument objects.

        Args:
            document (Document): The document object to load the mega document from.
            metadata (dict): The metadata to attach to the document.

        Returns:
            List[LangchainDocument]: A list of LangchainDocument objects.
        """
        target_dir = os.path.join(settings.MEDIA_ROOT)
        os.makedirs(target_dir, exist_ok=True)
        file = document.file
        if file.name.endswith(".md"):
            sections = self.read_sections(file, target_dir)
            self.langchain_mega_docs = []
            self.process_sections(sections, document, metadata)
            return self.langchain_mega_docs