# documents.py

import logging
from django.core.exceptions import ObjectDoesNotExist
from core.models import Category, Document, Location, Project
from chat.models import ErrorLog
import dotenv
import os

dotenv.load_dotenv()

logging.basicConfig(level=logging.DEBUG)
class DocumentService:

    @classmethod
    def create_document(cls, title, description, source,summary, author, category, url =None, file=None, associated_with=None, type=None, project=None, location=None):
        try:
            logging.info(f"Creating document: {title}")
            logging.info(f"ALL DATA RECIVIED: {title} {description} {source} {summary} {author} {category} {url} {file} {associated_with} {type} {project} {location}")
    
            try:
                document = Document.objects.create(
                    title=title,
                    description=description,
                    source=source,
                    url=url,
                    author=author,
                    category=category,
                    file=file,
                    type=type,
                    summary=summary,
                    project=project,
                    location=location
                )
                logging.info(f"DONE: {title}")
                if associated_with:
                    document.associated_with.set(associated_with)

                return document
            except Exception as e:
                logging.error(f"Failed to create document: {e}")
                return e
        except Exception as e:
            cls.log_error(e)
            return e

    @classmethod
    def list_documents(cls):
        try:
            return Document.objects.all()
        except Exception as e:
            cls.log_error(e)
            return None

    @classmethod
    def edit_document(cls, document_id, title=None, description=None, source=None, url=None, author=None, category=None, file=None, published_at=None, updated_at=None, type=None, summaries_id=None, file_content_id=None, project=None, location=None, associated_with=None):
        try:
            document = Document.objects.get(id=document_id)
            if title is not None:
                document.title = title
            if description is not None:
                document.description = description
            if source is not None:
                document.source = source
            if url is not None:
                document.url = url
            if author is not None:
                document.author = author
            if category is not None:
                document.category = category
            if file is not None:
                document.file = file
            if published_at is not None:
                document.published_at = published_at
            if updated_at is not None:
                document.updated_at = updated_at
            if type is not None:
                document.type = type
            if summaries_id is not None:
                document.summaries_id = summaries_id
            if file_content_id is not None:
                document.file_content_id = file_content_id
            if project is not None:
                document.project = project
            if location is not None:
                document.location = location
            if associated_with is not None:
                document.associated_with.set(associated_with)
            document.save()
            return document
        except Document.DoesNotExist:
            cls.log_error(f"Document with id {document_id} does not exist.")
            return None
        except Exception as e:
            cls.log_error(e)
            return None

    @classmethod
    def delete_document(cls, document_id):
        try:
            document = Document.objects.get(id=document_id)
            document.delete()
            return True
        except Document.DoesNotExist:
            cls.log_error(f"Document with id {document_id} does not exist.")
            return False
        except Exception as e:
            cls.log_error(e)
            return False

    @classmethod
    def log_error(cls, error):
        try:
            ErrorLog.objects.create(message=str(error))
        except Exception as e:
            print(f"Failed to log error: {e}")