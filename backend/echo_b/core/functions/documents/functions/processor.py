#file_path: echo_b/core/functions/documents/functions/processor.py
import logging
from langchain_community.document_loaders import PyPDFLoader
import dotenv
import os

dotenv.load_dotenv()

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# TODO: Add metadata

class Feedinator:
    def load_pdf(self, path: str, metadata:dict, split_by_pages: bool = False):
        try:
            logging.info(f"Loading PDF from {path}")
            pdf_loader = PyPDFLoader(path)
            if split_by_pages:
                content = pdf_loader.load_and_split()
            else:
                content = pdf_loader.load()
            logging.info(f"PDF loaded successfully from {path}")
            for page in content:
                page.page_content = self.clean_text(page.page_content)
                page.metadata = metadata.copy()
            return content
        except Exception as e:
            logging.error(f"An error occurred while loading the PDF: {e}")
            return None

    def clean_text(self, text: str) -> str:
        text = text.replace('\n', ' ')
        return text