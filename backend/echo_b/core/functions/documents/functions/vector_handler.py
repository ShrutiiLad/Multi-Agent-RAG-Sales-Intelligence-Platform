# file_path: echo_b/core/functions/documents/functions/vector_handler.py
import os
from django.conf import settings
from langchain_community.vectorstores.chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from typing import List
from core.models import Document
from langchain.docstore.document import Document as langDoc
from langchain_core.documents import Document as LangchainDocument

from core.functions.globalFunctions import EchoLogging
# Configure logger

## CONDITIONAL IMPORT ##
import sys
if sys.platform != "win32":
    try:
        __import__('pysqlite3')
        sys.modules['sqlite3'] = sys.modules.pop('pysqlite3')
    except ImportError:
        print("pysqlite3 not found. Using built-in sqlite3.")


persist_location = os.path.join(settings.VECTORSTORE, 'openai_embeds')

logger= EchoLogging()
class ChromaDumper:
    def __init__(self, persist_loc:str = persist_location):
        self.embeddings = OpenAIEmbeddings()
        self.persist_directory = persist_loc
        
        self.summaries_collection = Chroma(
            persist_directory=self.persist_directory,
            embedding_function=self.embeddings,
            collection_name="summaries"
        )

        self.file_content_collection = Chroma(
            persist_directory=self.persist_directory,
            embedding_function=self.embeddings,
            collection_name="file_content"
        )

        self.inverview_collection = Chroma(
            persist_directory=self.persist_directory,
            embedding_function=self.embeddings,
            collection_name="interviews"
        )


    def add_metadata(self, document: Document):
        try:
            metadata = {
                'title': document.title,
                'summary': document.summary if document.summary else '',
                'description': document.description if document.description else '',
                'published_date': document.created_at.strftime('%Y-%m-%d'), # Include the date
                'source': document.source if document.source else '',
                'url': document.url if document.url else '',
                'author': document.author if document.author else '',
                'category': document.category if document.category else '',
                'type': document.type if document.type else '',
                'project': document.project if document.project else '',
                'id': str(document.id)
            }
            logger.log(f"Metadata created for document with ID")
            return metadata
        except Exception as e:
            logger.log(f"An error occurred while creating metadata for the document: {e}", exc_info=True)
            return None

    def fetch_document(self, document_id: str, collection: str = "summaries"):
        self.chroma_vector_store = self.summaries_collection if collection == "summaries" else self.file_content_collection
        try:
            document = self.chroma_vector_store.get(ids=[document_id])
            if document:
                logger.log(f"Fetched document with ID {document_id}")
                return document
            else:
                logger.log(f"Document with ID {document_id} not found")
                return None
        except Exception as e:
            logger.log(f"An error occurred while fetching the document: {e}", exc_info=True)
            return None

    def add_to_summaries_collection(self, document: Document):
        metadata = self.add_metadata(document)
        title_metadata = metadata.copy()
        title_metadata['text_type'] = 'title'
        title_id = self.summaries_collection.add_texts(
            texts=[document.title],
            metadatas=[title_metadata],
            id=str(document.id)
        )
      
        content_metadata = metadata.copy()
        content_metadata['text_type'] = 'content'
        content_id = self.summaries_collection.add_texts(
            texts=[document.summary],
            metadatas=[content_metadata],
            id=str(document.id) 
        )
        return title_id, content_id


    def add_to_summaries_collection_v2(self, document: Document):
        # This is a new version of the add_to_summaries_collection function. It uses 'RecursiveCharacterTextSplitter' to split the document content into smaller parts before adding them to the collection.
        metadata = self.add_metadata(document)
        title_metadata = metadata.copy()
        title_metadata['text_type'] = 'title'
        title_id = self.summaries_collection.add_texts(
            texts=[document.title],
            metadatas=[title_metadata],
            id=str(document.id)
        )
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)
        all_splits = text_splitter.split_text(str(document.summary))
        content_metadata = metadata.copy()
        content_metadata['text_type'] = 'content'
        for index, split in enumerate(all_splits):
            content_metadata["summary_sub_section"] = str(document.title) + "_" + str(index)
            content_id = self.summaries_collection.add_texts(
                texts=[str(split)],
                metadatas=[content_metadata],
                id=str(document.id)
            )

        return title_id, document.id



    def add_to_file_content_collection(self, document: Document, doc):
        metadata = self.add_metadata(document)
        logger.log(f"TYPE OF DOC: {type(doc)}")
        logger.log(f"TYPE OF DOC_INDEX: {type(doc[0])}")
        try:
            for d in doc:
                self.file_content_collection.add_texts(
                    texts=[d.page_content],
                    metadatas=[metadata],
                    id=str(document.id)
                )
            return str(document.id)
        except Exception as e:
            logger.log(f"An error occurred while adding the document to the file content collection: {e}", exc_info=True)
            return None
    

    def add_document_to_collections(self, document: Document):
        # summaries_id = self.add_to_summaries_collection(document)
        summaries_id, document_id = self.add_to_summaries_collection_v2(document)
        file_content_id = self.add_to_file_content_collection(document)
        document.summaries_id = summaries_id
        document.file_content_id = file_content_id
        document.save()

    def delete_document(self, document_id: str):
        try:
            self.summaries_collection.delete(ids=[document_id])
            self.file_content_collection.delete(ids=[document_id])
            logger.log(f"Document with ID {document_id} deleted from the Chroma vector store")
        except Exception as e:
            logger.log(f"An error occurred while deleting the document: {e}")

    def update_metadata(self, document_id: str, metadata: dict, collection: str = "summaries"):
        self.chroma_vector_store = self.summaries_collection if collection == "summaries" else self.file_content_collection
        self.chroma_vector_store.update_document(document_id, metadata)

    def add_interview_to_collections(self, document: Document, docs):
        try:
            logger.log("-"*50)
            logger.log(type(docs))
            logger.log(docs)
            logger.log("-"*50)
            for d in docs:
                content_id = self.inverview_collection.add_texts(
                    texts=[d.page_content],
                    metadatas=[d.metadata],
                    id=str(document.id)
                )
            return content_id
        except Exception as e:
            logger.log(f"An error occurred while adding the document to the file content collection: {e}", exc_info=True)
            return None

    def add_mega_document_to_collections(self, document: Document, docs):
        try:
            logger.log(f"Adding Mega Document to the ChromaDumper")
            for d in docs:
                content_id = self.file_content_collection.add_texts(
                    texts=[d.page_content],
                    metadatas=[d.metadata],
                    id=str(document.id)
                )
            return str(document.id)
        except Exception as e:
            logger.log(f"An error occurred while adding the document to the file content collection: {e}", exc_info=True)
            return None

    def find_relevant_question(self, ids: List[str], query: str, num_results: int = 1):
        try:
            logger.log(f"Finding questions for ids: {ids}")
            relevant_question = self.inverview_collection.similarity_search_with_score(
                query,
                k=num_results,
                filter={
                    "document_id": {"$in": ids}
                }
            )
            logger.log("-=-"*50)
            logger.log(relevant_question)
            logger.log("-=-"*50)
            relevant_question = relevant_question[0]
            logger.log(f"Relevant question found for document with ID {relevant_question}")
            return relevant_question
        except Exception as e:
            logger.log(f"An error occurred while finding the relevant question: {e}", exc_info=True)
            return None

    def find_summary(self, query: str, num_results: int = 4, ids: list = []):
        try:
            logger.log(f"Finding sumarries for ids: {ids}")
            summary = self.summaries_collection.similarity_search_with_score(
                query,
                k=num_results,
                filter={
                    "id": {"$in": ids}
                }
            )
            logger.log(f"Summary found for query: {query} - {summary}")
            return summary
        except Exception as e:
            logger.log(f"An error occurred while finding the summary: {e}", exc_info=True)
            return None
        
    def find_content(self, query: str, num_results: int = 3, docIds: list = []):
        try:
            logger.log(f"Finding content for ids: {docIds}")
            content = self.file_content_collection.similarity_search_with_score(
                query=query,
                k=num_results,
                filter={"id": {"$in": docIds}}
            )
            
            logger.log(f"CONTENT:{content}")
            return content
        except Exception as e:
            logger.log(f"An error occurred while finding the content: {e}", exc_info=True)
            return ""
        
    def find_in_depth_answer(self, query: str):
        try:
            summary = self.find_summary(query)
            content = self.find_content(query)
            return summary, content
        except Exception as e:
            logger.log(f"An error occurred while finding the answer: {e}", exc_info=True)
            return None