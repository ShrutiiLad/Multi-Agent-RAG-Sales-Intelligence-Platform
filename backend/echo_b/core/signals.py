# file_path: echo_b/core/functions/bots/signals/signals.py
import logging
import os
from django.db.models.signals import post_save, m2m_changed
from threading import local
from django.db.models.signals import pre_save, post_save, pre_delete, post_delete
from django.dispatch import receiver
from core.functions.documents.functions.dumper import chromaCallback, vectorize_doc, vectorize_interview_doc, vectorize_mega_doc
from core.functions.documents.functions.dumper_new import DocumentVectorizer
from core.functions.bots.helpers import OpenAIAssistantHandler
from core.functions.globalFunctions import EchoLogging
from .models import Bot, Document

import dotenv
import os

logger = EchoLogging()

_thread_locals = local()


@receiver(pre_save, sender=Document)
def store_previous_state(sender, instance:Document, **kwargs):
    try:
        if instance.id is not None:
            _thread_locals.previous_instance = instance.__class__.objects.get(id=instance.id)
    except Document.DoesNotExist:
        _thread_locals.previous_instance = None


@receiver(m2m_changed, sender=Bot.documents.through)
def update_rag_on_document_change(sender, instance, action, pk_set, **kwargs):
    if action in ["post_add", "post_remove", "post_clear"]:
        if pk_set:  # This is a set of document IDs that were changed
            bots = Bot.objects.filter(documents__id__in=pk_set)
            for bot in bots:
                bot.rag = True
                bot.save(update_fields=['rag'])
                logger.log(f"Updated 'rag' for Bot: {bot.id}")
        
@receiver(post_save, sender=Bot)
def create_bot(sender, instance: Bot, created, **kwargs):
    if instance.documents.count() == 0:
        instance.rag = False
    else:
        instance.rag = True
    if instance.rag!= getattr(instance, 'rag', None):
        instance.save(update_fields=['rag'])
        logger.log(f"Updated 'rag' for Bot: {instance.id}")

@receiver(post_save, sender=Document)
def process_document(sender, instance : Document, created, **kwargs):
    my_dumper = chromaCallback()
    document_vectorizer = DocumentVectorizer()
    logger.log(f"Processing document with sumarries_id: {instance.summaries_id} -- {type(instance.summaries_id)}")
    if created or instance.summaries_id is None:
        if instance.file:
            if instance.type == "interview":
                vectorize_func = document_vectorizer.vectorize_interview_doc
            elif instance.type == "mega":
                vectorize_func = document_vectorizer.vectorize_mega_doc
            else:
                vectorize_func = document_vectorizer.vectorize_doc
            vectorize_func(instance)
            logger.log(f"{instance.type.capitalize()} document vector created")
        else:
            # New summary vectoriser method implemented to rollback use uncomment the below line
            # titleId, contentId = my_dumper.add_to_summaries_collection(instance)
            titleId, contentId = my_dumper.add_to_summaries_collection_v2(instance)
            if titleId is not None and contentId is not None:
                instance.summaries_id = instance.id
                instance.file_content_id =  instance.id
                instance.save(update_fields=['summaries_id', 'file_content_id'])
                logger.log("Document vector created")
            logger.log("No file attached to the document")
    elif instance.summaries_id is not None:
        previous_instance = getattr(_thread_locals, 'previous_instance', None)
        if previous_instance:
            if previous_instance.summary != instance.summary or \
            previous_instance.title != instance.title:
                logger.log("Summary, title, was changed.")
            elif previous_instance.file != instance.file:
                logger.log("file was changed.")
            else:
                logger.log("No changes detected.")
        else:
            logger.log("No previous instance found.")
    else:
        if instance.file is None:
            logger.log("DOCUMENT HAS NO FILE ATTACHED")


@receiver(pre_delete, sender=Document)
def delete_document(sender, instance: Document, **kwargs):
    my_dumper =chromaCallback()
    my_dumper.delete_document(str(instance.id))
    logger.log(f"Deleting {instance.type} document vector")
    associated_bots = instance.bots.all()
    for bot in associated_bots:
        documents_count = bot.documents.exclude(id=instance.id).count()
        if documents_count == 0:
            bot.rag = False
            bot.save(update_fields=['rag'])
            logger.log(f"Updated RAG boolean for bot: {bot.name}")

@receiver(post_delete, sender=Bot)
def delete_bot(sender, instance: Bot, **kwargs):
    try:
        if instance.openAiAssistantId is None:
            logger.log("Bot does not have an assistant.")
            return
        assistantHandler = OpenAIAssistantHandler()
        assistantHandler.deleteOAAssistant(instance.openAiAssistantId)
    except Exception as e:
        logging.error(f"Error deleting bot: {e}", exc_info=True)
