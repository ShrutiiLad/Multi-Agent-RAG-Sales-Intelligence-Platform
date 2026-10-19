import uuid
from core.functions.globalFunctions import EchoLogging, ErrorHandler
from core.functions.documents.functions.vector_handler import ChromaDumper
from core.models import InterviewQuestion


logger = EchoLogging()

@ErrorHandler.logAndHandleErrors
def retrieveContextForInterview(docIds: list, query: str):
    try:
        context = InterviewRetrieval.handleRetrieval(docIds, query)
        return context
    except Exception as e:
        logger.log(f"Error retrieving context for interview: {e}", exc_info=True)


class InterviewRetrieval:
    def __init__(self):
        self.logger = EchoLogging()
        self.chromaDumper = ChromaDumper()
    
    @staticmethod
    @ErrorHandler.logAndHandleErrors
    def handleRetrieval(docIds: list, query: str):
        interviewRetrieval = InterviewRetrieval()
        relevantQuestions = interviewRetrieval.getRelevantQuestions(docIds, query)
        if not relevantQuestions:
            return None
        interviewAnswers = interviewRetrieval._getInterviewDocumentAndAnswers(relevantQuestions)
        return interviewAnswers

    @ErrorHandler.logAndHandleErrors
    def getRelevantQuestions(self, docIds, query: str):
        try:
            question_ids = []
            relevant_question = self.chromaDumper.find_relevant_question(docIds, query)
            relevant_question_id = relevant_question[0].metadata['question_id']
            relevant_question_uuid = uuid.UUID(relevant_question_id)
            question_ids.append(relevant_question_uuid)
            return question_ids
        except Exception as e:
            logger.log(f"An error occurred while getting answers: {str(e)}", exc_info=True)
            return None

    @ErrorHandler.logAndHandleErrors
    def _getInterviewDocumentAndAnswers(self, question_ids):
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
            formatted_summaries = self._formatDocumentSummariesForInterview(documents_dict)
            return formatted_summaries
        except Exception as e:
            return None
        
    @ErrorHandler.logAndHandleErrors
    def _formatDocumentSummariesForInterview(self, documents_dict):
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



