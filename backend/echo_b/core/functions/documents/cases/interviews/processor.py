import re
import pandas as pd
import logging
from core.models import Document
import dotenv
import os

dotenv.load_dotenv()

## SPLIT the procesing of the dumper for interviews.
# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

def read_excel_file(file_path):
    excel_df = pd.read_excel(file_path, header=None)
    transposed_df = excel_df.transpose()
    transposed_df.columns = ["Title", "Date", "Project", "Strength", "Location", "Roles", "Information"]
    return transposed_df


def extract_qa_pairs(raw_text):
    pattern = r'Question: (.*?)\nAnswer: (.*?)(?=\nQuestion:|$)'
    qa_pairs = re.findall(pattern, raw_text, re.DOTALL)
    questions = [pair[0].strip() for pair in qa_pairs]
    answers = [pair[1].strip() for pair in qa_pairs]

    return questions, answers