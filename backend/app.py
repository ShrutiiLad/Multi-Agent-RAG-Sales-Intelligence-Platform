from pathlib import Path
import os

import nltk
from langchain_chroma import Chroma
from langchain_community.document_loaders import UnstructuredHTMLLoader
from langchain_openai import OpenAIEmbeddings


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = Path(os.getenv("HTML_DATA_DIR", BASE_DIR / "data")).resolve()
NLTK_DATA_DIR = Path(os.getenv("NLTK_DATA_DIR", BASE_DIR / ".nltk_data")).resolve()
MAIN_FOLDER = Path(os.getenv("HTML_CONTENT_DIR", DATA_DIR / "html_content")).resolve()
CHROMA_DB_LOCATION = Path(os.getenv("CHROMA_DB_DIR", DATA_DIR / "chroma_db")).resolve()

NLTK_DATA_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)
CHROMA_DB_LOCATION.mkdir(parents=True, exist_ok=True)

nltk.data.path.insert(0, str(NLTK_DATA_DIR))

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY is not set. Add it to your environment before running this script.")

nltk.download("punkt", download_dir=str(NLTK_DATA_DIR))
nltk.download("averaged_perceptron_tagger", download_dir=str(NLTK_DATA_DIR))


def load_data(file_path):
    loader = UnstructuredHTMLLoader(file_path)
    return loader.load()


if not MAIN_FOLDER.exists():
    raise FileNotFoundError(
        f"HTML content folder does not exist: {MAIN_FOLDER}. "
        "Set HTML_CONTENT_DIR to the folder containing your HTML files."
    )


docs = []
folders = [
    entry for entry in MAIN_FOLDER.iterdir() if entry.is_dir()
]

for folder in folders:
    print(f"Processing folder: {folder.name}")
    for file in folder.iterdir():
        if file.is_file():
            print(f"Processing file: {file.name}")
            docs.extend(load_data(str(file)))

if not docs:
    raise ValueError(f"No HTML documents were loaded from: {MAIN_FOLDER}")

print(f"Loaded {len(docs)} documents.")
print(type(docs[0]))

model = OpenAIEmbeddings()
db = Chroma(persist_directory=str(CHROMA_DB_LOCATION), embedding_function=model)
db.add_documents(docs)
print(f"Documents saved to Chroma at: {CHROMA_DB_LOCATION}")
