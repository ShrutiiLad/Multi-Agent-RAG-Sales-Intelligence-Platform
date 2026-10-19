# Read Me Document for Refactoring Vector Pipeline

## Introduction

Currently, the vector pipeline is spread across 'dumper.py', 'cases\interview\processor.py', 'processor.py' and 'vector_handler.py'. This document outlines the changes being made to refactor the vector pipeline into a modular and more maintainable structure.

## Plan

In 'dumper.py' we have 3 main functions:
1. vectorize_doc
2. vectorize_interview_doc
3. vectorize_mega_doc

To prevent code from breaking, the main functions will be same, but the internal structure will be changed. The main functions will be moved to 'DocumentVectorizer' class in 'dumper.py'. The 'DocumentVectorizer' class will have the following functions:

1. vectorize_doc
2. vectorize_interview_doc
3. vectorize_mega_doc

But the internal processe will be made more modular and maintainable.

Feedinator class structure can be more optimized. A common practice should be established that once a file/document is received, it should be converted to LangChain doc object after basic cleaning and reading. This will make the code more modular and will make it plug and play with other modules.

Feedinator is being refactored to have dedicated entry methods for taking document as input and returning a List of LangChain doc objects. This will make the code more modular and maintainable.

Dedicated entry methods will be for:
1. Read PDF Doc
2. Read Mega Doc (Markdown)
3. Read Interiview Doc (XLSX or CSV)
4. ... any new method which will be added in future

Once the document is passed to Feedinator and we get the LangChain doc object, We pass it to 'insert_langchain_docs_to_chroma' method in dumper_new.py to vectorize and store the document in the chroma database.
