import uuid
from core.models import Bot, Document
from django.http import JsonResponse
from channels.db import database_sync_to_async
from core.functions.documents.functions.vector_handler import ChromaDumper
from core.functions.globalFunctions import EchoLogging, ErrorHandler
from core.functions.documents.cases.interviews.retrieval import retrieveContextForInterview


def uuidConversion(id:str):
    return uuid.UUID(id)


def retrieveAllAssociatedContext(bot:Bot, query:str):
    try:
        embedder = Embedder()
        logger.log(f"Initiating context retrieval for bot")
        return embedder.getContext(bot, query)
    except Exception as e:
        logger.log(f"An error occurred while getting context: {str(e)}", exc_info=True)
        return Embedder.noRelvantContext(), []

logger = EchoLogging()
class Embedder:
    def __init__(self):
        self.chroma_dumper = ChromaDumper()
        logger.log("Embedder initialized")

    @staticmethod
    def noRelvantContext():
        return JsonResponse({"content": "No relevant context found. Please use your knowledge", "id": ""})

    @staticmethod
    @ErrorHandler.logAndHandleErrors
    def documentBifurcation(bot: Bot):
        try:
            documents = Bot.objects.filter(id=bot.id).prefetch_related('documents').first()
            if not documents:
                logger.log("No documents found for the given bot.")
                return None

            all_doc_ids = [doc.id for doc in documents.documents.all()]
            summary_docs, file_docs, interview_docs = [], [], []

            for doc in documents.documents.all():
                if doc.type == "general":
                    if doc.file:
                        file_docs.append(str(doc.id))
                    else:
                        summary_docs.append(doc.id)
                elif doc.type == "interview":
                    interview_docs.append(str(doc.id))
                elif doc.type == "mega":
                    file_docs.append(str(doc.id))

            logger.log(f"Processed documents. Summary: {len(summary_docs)}, Files: {len(file_docs)}, Interviews: {len(interview_docs)}")
            return summary_docs, file_docs, interview_docs, all_doc_ids
        except Exception as e:
            logger.log(f"An error occurred while bifurcating documents: {str(e)}", exc_info=True)
            return None

    @ErrorHandler.logAndHandleErrors
    def formatAllResponse(self,sumarries, deepContext, interviewAnswers):
        try:
            logger.log(f"Summaries: {sumarries}, Deep context: {deepContext}, Interview answers: {interviewAnswers}")
            return "\n\n".join([sumarries, deepContext, interviewAnswers])        
        except Exception as e:
            logger.log(f"An error occurred while formatting response: {str(e)}", exc_info=True)
            return "No relevant context found. Please use your knowledge"
        
    @ErrorHandler.logAndHandleErrors
    def createSourceIDList(self, summaryDocs, fileDocs, interviewDocs):
        try:
            sourceIDs = []
            if len(summaryDocs) > 0:
                sourceIDs += summaryDocs
            if len(fileDocs) > 0:
                sourceIDs += fileDocs
            if len(interviewDocs) > 0:
                sourceIDs += interviewDocs
            return list(set(sourceIDs))
        except Exception as e:
            logger.log(f"An error occurred while creating source ID list: {str(e)}", exc_info=True)
            return []
        

    @database_sync_to_async
    @ErrorHandler.logAndHandleErrors
    def getContext(self, bot: Bot, query: str):
        try:
            summaries, deepContext, interviewAnswers = "","",""
            summaryDocs, fileDocs, interviewDocs, allDocIds = Embedder.documentBifurcation(bot)
            if len(summaryDocs) > 0:
                try:
                    logger.log("Getting summary")
                    summaries, chromaSummaryIds = self._getSummary_(query, summaryDocs)
                    summaryDocs = chromaSummaryIds
                except Exception as e:
                    logger.log(f"An error occurred while getting summary: {str(e)}", exc_info=True)
            if len(fileDocs) > 0:
                try:
                    deepContextList = self.chroma_dumper.find_content(query=query, docIds=fileDocs)
                    deepContext = "\n\n".join(doc[0].page_content for doc in deepContextList)
                    fileDocs = [uuidConversion(doc[0].metadata['id']) for doc in deepContextList]
                except Exception as e:
                    logger.log(f"An error occurred while getting deep context: {str(e)}", exc_info=True)
            if len(interviewDocs) > 0:
                try:
                    interviewAnswers = retrieveContextForInterview(docIds=interviewDocs, query=query)
                except Exception as e:
                    logger.log(f"An error occurred while getting interview answers: {str(e)}", exc_info=True)
            logger.log("All context retrieved")
            return self.formatAllResponse(summaries, deepContext, interviewAnswers), self.createSourceIDList(summaryDocs, fileDocs, interviewDocs)     
        except Exception as e:
            logger.log(f"An error occurred while getting context: {str(e)}", exc_info=True)
            return Embedder.noRelvantContext()
        
    @ErrorHandler.logAndHandleErrors
    def _getSummary_(self, query, documents):
        try:
            if not documents:
                return "No relevant documents found. Please use your knowledge"
            documents = list(documents)
            if len(documents) > 1:
                document_ids = [str(doc) for doc in documents]
                chromaContent = self.chroma_dumper.find_summary(query=query, ids=document_ids)
                content = self._processJsonResponse(summaryDocs=chromaContent)
                ids = [uuidConversion(doc[0].metadata['id']) for doc in chromaContent]
                logger.log(f"Summary retrieved for {len(ids)} documents: {ids} - {[type(doc) for doc in ids]}")
                
                return content, ids
            else:
                doc = documents[0]
                doc = Document.objects.get(id=doc)
                title = doc.title
                summary_lines = doc.summary.split('\n')
                context = "\n".join(["1. <Document>",f"1. Title: {title}","1.2. Summary:"] + [f" - {line}" for line in summary_lines])
                return context,[doc.id]
        except Exception as e:
            logger.log(f"An error occurred while getting summary: {str(e)}", exc_info=True)
            return "No relevant documents found. Please use your knowledge"
        
    @ErrorHandler.logAndHandleErrors
    def _processJsonResponse(self, inDepthDocs: list = None, summaryDocs: dict = None, interviewDocs = None):
        if summaryDocs:
            response = self._curateContent_(summaryDocs)
        elif inDepthDocs:
            response = "\n\n".join([doc[0].page_content for doc in inDepthDocs])
        return response
    
    @ErrorHandler.logAndHandleErrors
    def _curateContent_(self, content):
        context = ""
        summaryContent = [doc for doc in content if doc[0].metadata['text_type'] == 'content']
        try:
            for doc_index, doc in enumerate(summaryContent, start=1):
                title = doc[0].metadata['title']
                summary = doc[0].page_content
                word_count = len(summary.split())
                context += f"{doc_index}. <Document>\n"
                context += f"{doc_index}.1. Title: {title}\n"
                context += f"{doc_index}.2. Summary:\n"
                for line in summary.split('\n'):
                    context += f" - {line}\n"
                context += f"{doc_index}. </Document>\n"
                context += "\n\n"
        except Exception as e:
            context = "\n\n".join([doc.page_content for doc in content])
        return context
