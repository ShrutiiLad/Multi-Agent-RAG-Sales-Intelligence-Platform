# Echo AI - Document Feeder Plan

## Introduction

For a RAG application, we need 2 main components: a document feeder and a retrieval engine. The document feeder is responsible for ingesting data from source and indexing it. The retrieval engine is responsible for querying the indexed data, and returning the relevant data to the model, where the model will generate a response based on the data.

## Sequence

1. Feeder: The document feeder will ingest data from the source. The expectation here is, the application or document feeder will be triggered by an event which will pass the file/document to the document feeder. For more info about the document feeder refer: https://python.langchain.com/docs/modules/data_connection/document_loaders

2. Ninja: Ninja will be responsible for splitting the document into smaller chunks. This needs some more discussion whether we need to split the document into parts or not? If yes, then what should be the ideal way? Refer to below link for more info: https://python.langchain.com/docs/modules/data_connection/document_transformers

3. Dump (ChromaDB): This is where the indexing will be stored. We will be using ChromaDB for storing and the retrieval of the indexed data. For more info about the VectorDump refer: https://python.langchain.com/docs/modules/data_connection/vectorstores/
Imp: https://python.langchain.com/docs/integrations/vectorstores/chroma

4. Retriever: The retriever will be take user input and retrieve the relevant data (We have multiple ways to look for the relevant data like vector similarity, MMR, etc. More analysis is needed to decide the best apporach). The retriever design should be modular so that we can easily switch between different retrieval methods. For more info about the retriever refer: https://python.langchain.com/docs/modules/data_connection/retrievers

5. Popat: This will produce an answer using the prompt and the retrieved data. For more info refer: https://python.langchain.com/docs/modules/model_io/chat

## Components

1. Document Feeder
2. Ninja
3. Dump (ChromaDB)
4. Retriever
5. Popat

## Other Things to Look For

1. Adding chat history back to the application (This is not a part of the document feeder plan, LangChain has a separate way to handle this) check this out: https://python.langchain.com/docs/use_cases/question_answering/chat_history

2. Agent Creation: How each thread or agent will be created and managed. For more info refer: https://python.langchain.com/docs/use_cases/question_answering/conversational_retrieval_agents


## To Do's Right Now (Before Thursday)

1. Create a separate modular application which takes the documents, splits them into smaller chunks, and indexes them into ChromaDB. This will be the first step towards the document feeder.

2. Once the document feeder is ready, we can think how to integrate it with the rest of the Django application.

