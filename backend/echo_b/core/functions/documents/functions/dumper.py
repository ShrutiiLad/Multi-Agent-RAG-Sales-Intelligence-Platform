# file_path: echo_b/core/functions/documents/functions/processor.py
import logging
import sys
import os
import re
import traceback
from django.conf import settings
from langchain_core.documents import Document
from langchain.docstore.document import Document as langDoc
from langchain_text_splitters import RecursiveCharacterTextSplitter
import pandas as pd
from core.functions.documents.functions.processor import Feedinator
from core.functions.documents.functions.vector_handler import ChromaDumper
from core.functions.documents.cases.interviews.processor import extract_qa_pairs, read_excel_file
from core.models import InterviewAnswer, InterviewQuestion
import dotenv
import os

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


def chromaCallback():
    return ChromaDumper()


def vectorize_doc(document: Document):
    try:
        docs = []
        feed = Feedinator()
        my_dumper =chromaCallback()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)
        file = document.file
        print(f"FILE:  {file.name}")
        target_dir = os.path.join(settings.MEDIA_ROOT)
        os.makedirs(target_dir, exist_ok=True) # Ensure the directory exists
        logging.info(f"{file}")
        logging.info(type(file))
        if not file.name:
            logging.error("No file attached to the document")
        else:
            logging.info(f"Starting with File:  {file.name}")
            if file.name.endswith(".pdf"):
                target_file_path = os.path.join(target_dir, file.name)
                logging.info(f"FILE_PATH:  {target_file_path}")
                # Check if the file exists before attempting to load it
                if os.path.exists(target_file_path):
                    docs.append(feed.load_pdf(target_file_path, metadata=my_dumper.add_metadata(document), split_by_pages=True))
                else:
                    logging.error(f"File does not exist at path: {target_file_path}") 
        # Add the documents to the ChromaDumper
        for doc in docs:
            logging.debug("Adding Document to the ChromaDumper")
            #logging.info(f"SPLITING DOC: {doc}")
            all_splits = text_splitter.split_documents(doc)
            
            #logging.info(f"ALL SPLITS: {all_splits}")
            try:
                logging.info("Adding DocumentOBJ to the ChromaDumper")
                my_dumper.add_to_summaries_collection(document)
            except Exception as e:
                logging.error(f"An error occurred while adding the documentOBJ to the ChromaDumper: {e}")
            try:
                logging.info("Document Obj Added to the ChromaDumper")
                if file:
                    my_dumper.add_to_file_content_collection(document, all_splits)
            except Exception as e:
                logging.error(f"An error occurred while adding the documentFILE to the ChromaDumper: {e}") 
            logging.info("File Added to the ChromaDumper")
        logging.info("Documents Added to the ChromaDumper")
        document.summaries_id = document.id
        logging.info(f"Document vector created with ID: {document.summaries_id}")
        document.file_content_id = document.id
        logging.info(f"Document vector created with ID: {document.file_content_id}")
        document.save()
        logging.info("Document Saved")
    except Exception as e:
        logging.error(traceback.print_exc())
        logging.error(f"An error occurred while vectorizing the document: {e}")



def vectorize_interview_doc(document: Document):
    # processor.py
    try:
        logging.info("Starting to vectorize the interview document")
        docs = []
        my_dumper =chromaCallback()        
        qna_df = pd.DataFrame(columns=['Question', 'Answer', 'FileName'])
        file = document.file
        target_dir = os.path.join(settings.MEDIA_ROOT)
        os.makedirs(target_dir, exist_ok=True) # Ensure the directory exists

        if file.name.endswith(".csv") or file.name.endswith(".xlsx"):
            logging.info(f"Starting with File:  {file.name}")
            target_file_path = os.path.join(target_dir, file.name)

            if file.name.endswith(".csv"):
                df = pd.read_csv(target_file_path)
            elif file.name.endswith(".xlsx"):
                df = pd.read_excel(target_file_path)

            grouped_df = df.groupby('Question')

            docs = []

            # Insert Questions and Answers into the Database
            for question, group in grouped_df:
                try:
                    # Insert Into Database
                    questionObj = InterviewQuestion.objects.create(question=question, document=document)
                    for index, row in group.iterrows():
                        answerObj = InterviewAnswer.objects.create(answer=row['Answer'], question=questionObj)
                    
                    # Insert into ChromaDB
                    metadata = my_dumper.add_metadata(document)
                    metadata["question_id"] = str(questionObj.id)
                    metadata["document_id"] = str(document.id)
                    doc = Document(
                        page_content=str(question),
                        metadata=metadata
                    )
                    docs.append([doc])
                except Exception as e:
                    logging.error(f"An error occurred while creating the InterviewQuestion object: {e}")

            logging.info(f"Chroma DOCS: {docs}")
            for doc in docs:
                my_dumper.add_interview_to_collections(document, doc)

        logging.info("Interview Document Added to the ChromaDumper")
        document.summaries_id = document.id
        logging.info(f"Document vector created with ID: {document.summaries_id}")
        document.file_content_id = document.id
        logging.info(f"Document vector created with ID: {document.file_content_id}")
        document.save()
        logging.info("Interview Document Saved")
    except Exception as e:
        logging.error(f"An error occurred while vectorizing the interview document: {e}")



def vectorize_mega_doc(document: Document):
    try:
        logging.info("Starting to vectorize the interview document")
        docs = []
        my_dumper =chromaCallback()
        file = document.file
        target_dir = os.path.join(settings.MEDIA_ROOT)
        os.makedirs(target_dir, exist_ok=True) # Ensure the directory exists

        if file.name.endswith(".md"):
            logging.info(f"Starting with File:  {file.name}")
            target_file_path = os.path.join(target_dir, file.name)

            with open(target_file_path, "r", encoding="utf-8") as f:
                content = f.read()

            sections = content.split("### ")

        for index, section in enumerate(sections):
            lines = section.split("\n")
            section_title = lines[0]
            section_content = "\n".join(lines[1:])

            if section_title:
                if len(section_content) < 10:
                    continue

                # Write the section title to a new file
                section_title = remove_special_characters_and_numbers(section_title)
                section_title = section_title.strip().replace(" ", "_")

                # section_title = str(index) + "_" + section_title

                section_content = "### " + section

                try:

                    # If Section_content size is big then split it into smaller chunks
                    if len(section_content) > 10000:
                        text_splitter = RecursiveCharacterTextSplitter(chunk_size=5000, chunk_overlap=0)
                        all_splits = text_splitter.split_documents(langDoc(page_content=section_content))
                        for index, split in enumerate(all_splits):
                            metadata = my_dumper.add_metadata(document)
                            metadata["document_id"] = str(document.id)
                            metadata["section_title"] = section_title
                            metadata["section_sub_title"] = str(index) + "_" + section_title
                            logging.info("Splitting the section content")
                            logging.info(split)
                            doc = Document(
                                page_content=str(split),
                                metadata=metadata
                            )
                            docs.append([doc])
                    else:
                        # Insert into ChromaDB
                        metadata = my_dumper.add_metadata(document)
                        metadata["document_id"] = str(document.id)
                        metadata["section_title"] = section_title
                        metadata["section_sub_title"] = section_title
                        doc = Document(
                            page_content=str(section_content),
                            metadata=metadata
                        )
                        docs.append([doc])
                except Exception as e:
                    logging.error(f"An error occurred while creating the Mega Document object: {e}")

        # logging.info(f"Chroma DOCS: {docs}")
        for doc in docs:
            my_dumper.add_mega_document_to_collections(document, doc)

        logging.info("Mega Document Added to the ChromaDumper")
        document.summaries_id = document.id
        logging.info(f"Document vector created with ID: {document.summaries_id}")
        document.file_content_id = document.id
        logging.info(f"Document vector created with ID: {document.file_content_id}")
        document.save()
        logging.info("Mega Document Saved")

    except Exception as e:
        logging.error(f"An error occurred while vectorizing the mega document: {e}")



def remove_special_characters_and_numbers(text):
    cleaned_text = re.sub(r'[^a-zA-Z\s]', '', text)
    return cleaned_text