import logging
import sys
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from core.functions.documents.functions.processor_new import Feedinator
from core.functions.documents.functions.vector_handler import ChromaDumper
from core.functions.globalFunctions import EchoLogging, ErrorHandler
import dotenv

dotenv.load_dotenv()



## CONDITIONAL IMPORT ##
import sys


if sys.platform != "win32":
    try:
        __import__('pysqlite3')
        sys.modules['sqlite3'] = sys.modules.pop('pysqlite3')
    except ImportError:
        print("pysqlite3 not found. Using built-in sqlite3.")


logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

logger = EchoLogging()

def chromaCallback():
    return ChromaDumper()


class DocumentVectorizer:

    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=5000, chunk_overlap=0)
        self.my_dumper = ChromaDumper()
        self.my_feedinator = Feedinator()

    @ErrorHandler.logAndHandleErrors
    def vectorize_doc(self, document: Document):
        """
        This function is used for vectorizing a general pdf document. It passes the document to the Feedinator to load the pdf and then processes the document using the text splitter. The processed document is then saved to the chroma database collections using ChromaDumper.

        Args:
            document (Document): The document object to vectorize.

        Raises:
            Exception: An error occurred while vectorizing the document.
        """
        try:
            # if file = document.file
            # file.name.endswith(".html")

            if document.file and (document.file.name.endswith(".html") or document.file.name.endswith(".htm")):
                langchain_docs = self.my_feedinator.load_html(document, metadata=self.my_dumper.add_metadata(document))
                self.insert_langchain_docs_to_chroma('general', langchain_docs, document)
            else:
                langchain_docs = self.my_feedinator.load_pdf(document, metadata=self.my_dumper.add_metadata(document), split_by_pages=True)
                self.insert_langchain_docs_to_chroma('general', langchain_docs, document)
        except Exception as e:
            logger.log(f"An error occurred while vectorizing the document: {e}", exc_info=True)

    @ErrorHandler.logAndHandleErrors
    def vectorize_interview_doc(self, document: Document):
        """
        This function is used for vectorizing an interview document. It passes the document to the Feedinator to load the interview document and then processes the document using the certain required process. The processed document is then saved to the chroma database collections using ChromaDumper.

        Args:
            document (Document): The document object to vectorize.

        Raises:
            Exception: An error occurred while vectorizing the interview document.
        """
        try:
            langchain_docs = self.my_feedinator.load_interview_doc(document, metadata=self.my_dumper.add_metadata(document))
            self.insert_langchain_docs_to_chroma('interview', langchain_docs, document)
        except Exception as e:
            logger.log(f"An error occurred while vectorizing the interview document: {e}", exc_info=True)

    @ErrorHandler.logAndHandleErrors
    def vectorize_mega_doc(self, document: Document):
        """
        This function is used for vectorizing a mega document. It passes the document to the Feedinator to load the mega document and then processes the document using the text splitter. The processed document is then saved to the chroma database collections using ChromaDumper.

        Args:
            document (Document): The document object to vectorize.

        Raises:
            Exception: An error occurred while vectorizing the mega document.
        """
        try:
            langchain_docs = self.my_feedinator.load_mega_doc(document, metadata=self.my_dumper.add_metadata(document))
            self.insert_langchain_docs_to_chroma('mega', langchain_docs, document)
        except Exception as e:
            logger.log(f"An error occurred while vectorizing the mega document: {e}", exc_info=True)

    @ErrorHandler.logAndHandleErrors
    def insert_langchain_docs_to_chroma(self, collection_name, langchain_docs, document):
        """
        This function inserts the langchain documents to the chroma database collections. The collection name is used to determine which collection to insert the documents to.
        """
        try:
            if collection_name.lower() == "general":
                all_splits = self.text_splitter.split_documents(langchain_docs)
                # self.my_dumper.add_to_summaries_collection(document)
                self.my_dumper.add_to_summaries_collection_v2(document)
                if document.file:
                    self.my_dumper.add_to_file_content_collection(document, all_splits)
                self.save_document(document)
            elif collection_name.lower() == "interview":
                for doc in langchain_docs:
                    self.my_dumper.add_interview_to_collections(document, [doc])
                self.save_document(document)
            elif collection_name.lower() == "mega":
                for doc in langchain_docs:
                    self.my_dumper.add_mega_document_to_collections(document, doc)
                self.save_document(document)
        except Exception as e:
            logger.log(f"An error occurred while adding the document to the chroma collections: {e}", exc_info=True)


    @ErrorHandler.logAndHandleErrors
    def save_document(self, document):
        """
        Save the document to the database and set the summaries_id and file_content_id to the document id.
        """
        try:
            document.summaries_id = document.id
            document.file_content_id = document.id
            document.save()
        except Exception as e:
            logger.log(f"An error occurred while saving the document: {e}", exc_info=True)


# --> ECHO (VIEWS OR SIGNAL) || DUMPER (file-type --> FUNCTIONS --> document-type) || FEEDINATOR (PROCESS & CALL FOR STORAGE) (No matter the kind of doc convert document to langchain doc) --> ] # CHROMAHANDLER (CRUD for CHROMA) --> DBO(CRUD FOR ECHODB) --> MODELOBJs)
#                                      |                                                                                                                                                                                                                              |
#                                      |------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
