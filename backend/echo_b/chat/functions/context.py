import json
from django.http import JsonResponse
from core.functions.documents.functions.vector_handler import ChromaDumper
from core.models import Bot, Document, InterviewAnswer, InterviewQuestion
import uuid
import logging
from channels.db import database_sync_to_async


from core.functions.globalFunctions import EchoLogging, ErrorHandler


# ADD SUMMARIZER FOR THREAD OPTIMIZATION

class ContextEmbedder:
    def __init__(self):
        self.chroma_dumper = ChromaDumper()
        self.logger = EchoLogging()


    @database_sync_to_async
    def get_content(self, bot_id: uuid, query: str, collection: str = "summaries", in_depth: bool = False):
        """
        Get content for a given query

        Args:
            bot_id (uuid): Bot ID
            query (str): Query
            collection (str): Collection to search in
            in_depth (bool): Whether to search in-depth

        Returns:
            dict: Content for the query
        """
        try:
            botObj = Bot.objects.get(id=bot_id)
            documents = botObj.documents.all()
            docs = []
            for doc in documents:
                docs.append(str(doc.id))

            if not in_depth:
                if collection == "summaries":
                    content = self._getSummary_(query, docs)
                elif collection == "content":
                    content = self.chroma_dumper.find_content(query=query, docIds=docs)
                    content = self.processJsonResponse(inDepthDocs=content)
                elif collection == "mega":
                    content = self.chroma_dumper.find_content(query=query, docIds=docs, num_results=2)
                    content = self.processJsonResponse(inDepthDocs=content)
                elif collection == "interviews":
                    answers = self.get_relevant_answers(
                        bot_id=bot_id,
                        question=query
                        )
                    content = answers
                    return content
                else:
                    content = None
                    return None
            else:
                #TODO: figure out data structure for more in-depth search in the "file/s"
                content,deep_content = self.chroma_dumper.find_in_depth_answer(query=query, ids=docs)
                content = self.processJsonResponse(inDepthDocs=content)
                deep_content = self.processJsonResponse(inDepthDocs=deep_content)
                return content, deep_content
            # TODO: is in-depth
            return content
        except Exception as e:
            import traceback
            logging.error(traceback.print_exc())
            logging.error(f"An error occurred while getting summaries: {str(e)}")
            return None


    def _getSummary_(self, query, documents):
        """
        Get summary for a given query

        Args:
            query (str): Query
            documents (QuerySet): Documents
        
        Returns:
            dict: Summary for the query
        """
        content = {"content": "", "id": ""}
        if documents:
            if len(documents) > 1: 
                content = self.chroma_dumper.find_summary(query=query, ids=documents)
                content = self.processJsonResponse(summaryDocs=content)
            else:
                doc = documents[0]
                doc = Document.objects.get(id=doc)
                context = f"1. <Document>\n"
                context += f"1. Title: {doc.title}\n"
                context += f"1.2. Summary:\n"
                for line in doc.summary.split('\n'):
                    context += f" - {line}\n"
                content["id"] = [str(doc.id)]
                content["content"] = context
            return content
        return {"content": "No relevant context found. Please use your knowledge", "id": ""}
        
    def getRelevantQuestions(self, bot_id: uuid, query: str):
        try:
            docs_ids, question_ids = [], []
            botObj = Bot.objects.get(id=bot_id)
            for doc in botObj.documents.all():
                docs_ids.append(str(doc.id))
            relevant_question = self.chroma_dumper.find_relevant_question(docs_ids, query)
            relevant_question_id = relevant_question[0].metadata['question_id']
            relevant_question_uuid = uuid.UUID(relevant_question_id)
            question_ids.append(relevant_question_uuid)
            return question_ids
        except Exception as e:
            logging.error(f"An error occurred while getting answers: {str(e)}")
            return None
        

    def get_relevant_answers(self, bot_id: uuid, question: str):
        try:
            docs_ids = []
            questions = []
            botObj = Bot.objects.get(id=bot_id)
            for doc in botObj.documents.all():
                docs_ids.append(str(doc.id))
            relevant_question = self.chroma_dumper.find_relevant_question(docs_ids, question)
            relevant_question_id = relevant_question[0].metadata['question_id']
            relevant_question_uuid = uuid.UUID(relevant_question_id)
            questions.append(relevant_question_uuid)
            answer = self.getInterviewDocumentAndAnswers(questions)
            #answers = InterviewAnswer.objects.filter(question=relevant_question_uuid)
            return answer
        except Exception as e:
            logging.error(f"An error occurred while getting answers: {str(e)}")
            return None

    def getInterviewDocumentAndAnswers(self, question_ids):
        try:
            questions = InterviewQuestion.objects.filter(id__in=question_ids).select_related('document').prefetch_related('answers')
            documents_dict = {}
            ids = []
            for question in questions:
                doc_title = str(question.document.title)
                if doc_title not in documents_dict:
                    documents_dict[doc_title] = {
                        'document_id': doc_title,
                        'questions': []
                    }
                    ids.append(question.document.id)
                question_info = {
                    'question_text': question.question,
                    'answers': [{'answer_text': answer.answer} for answer in question.answers.all()]
                }

                documents_dict[doc_title]['questions'].append(question_info)
            
            formatted_summaries = self.formatDocumentSummariesForInterview(documents_dict)
            return {"content":formatted_summaries, 'id': ids}
        except Exception as e:
            return None

    def formatDocumentSummariesForInterview(self, documents_dict):
        alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        output = []
        try:
            for doc_index, (doc_title, doc_info) in enumerate(documents_dict.items(), start=1):
                doc_label = alphabet[(doc_index - 1) % len(alphabet)]
                document_summary = f"{doc_label}. Document {doc_title}\n"
                for question_index, question_info in enumerate(doc_info['questions'], start=1):
                    question_label = f"{doc_label}.{question_index}"
                    document_summary += f"  {question_label}. Question: {question_info['question_text']}\n"
                    
                    for answer_index, answer in enumerate(question_info['answers'], start=1):
                        answer_label = f"{question_label}.USER-{answer_index}"
                        document_summary += f"<>    {answer_label}. User: {answer['answer_text']}\n <>"
                
                output.append(document_summary)
            
            formatted_output = "---\n" + "\n".join(output) + "---"
        except Exception as e:
            formatted_output = documents_dict
        return formatted_output

    def processJsonResponse(self, inDepthDocs: list = None, summaryDocs: dict = None, interviewDocs = None):
        """
        Process the JSON response from the ChromaDumper
        
        Args:
            inDepthDocs (list): List of in-depth documents
            summaryDocs (dict): Dictionary of summary documents
            interviewDocs (list): List of interview documents

        Returns:
            dict: Processed JSON response
        """
        response = {
            "id": [],
            "content": ""
        }
        if summaryDocs:
            response["id"] = [doc[0].metadata['id'] for doc in summaryDocs]
            response["content"] = self._curateContent_(summaryDocs)
        elif interviewDocs:
            response["id"] = [str(doc.id) for doc in interviewDocs]
            response["content"] = "\n\n".join([doc.answer for doc in interviewDocs])
        elif inDepthDocs:
            response["id"] = [doc[0].metadata["id"] for doc in inDepthDocs]
            response["content"] = "\n\n".join([doc[0].page_content for doc in inDepthDocs])
        return response


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
