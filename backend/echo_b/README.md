file_path: echo_b/README.md
# EchoB Chat Application Documentation

This document provides an overview of the EchoB chat application, detailing the available endpoints, their functionalities, and how to interact with them. The application is built using Django, Django Channels for WebSocket communication, and Django REST Framework for API endpoints.

## Table of Contents

For all the following `localhost:8000/auth/`
- [Authentication](#authentication)

For all the following `localhost:8000/api/`
- [Chat API](#chat-api)
- [Core API](#core-api)
- [Thread API](#thread-api)
- [Message API](#message-api)

For the following `ws://localhost:8000/c/<:thread_id:>/`
- [WebSocket API](#websocket-api)

## Authentication

The application uses Django's built-in authentication system. To interact with the protected endpoints, you need to authenticate using a token-based authentication system.

### Endpoints

- Login: `/auth/login/`
- Logout: `/auth/logout/`
- Password Change: `/auth/password/change/`
- Password Reset: `/auth/password/reset/`

## Chat API

The chat API provides endpoints for creating messages and managing chat threads.

### Endpoints

- Create Message: `/api/chat/message/create/`
  - Method: POST
  - Description: Creates a new message in a chat thread. Requires a `bot_id` and `content` in the request body.
  - Request Body:
    ```json
    {
      "bot_id": "UUID of the bot",
      "content": "Message content"
    }
    ```
  - Response:
    - On success:
      ```json
      {
        "success": true,
        "response": "Response from the bot",
        "thread_id": "UUID of the thread"
      }
      ```
    - On error:
      ```json
      {
        "error": "Error message"
      }
      ```

## Core API

The core API provides endpoints for managing assistants (bots).

### Endpoints

- List Assistants: `/api/core/assistants/`
  - Method: GET
  - Description: Lists all available assistants.
  - Response:
    ```json
    [
      {
        "id": "UUID of the assistant",
        "name": "Name of the assistant"
      },
      ...
    ]
    ```
- Create Assistant: `/api/core/assistants/create/`
  - Method: POST
  - Description: Creates a new assistant. Requires `name`, `instructions`, `model`, and optionally `tools` in the request body.
  - Request Body:
    ```json
    {
      "name": "Name of the assistant",
      "instructions": "Instructions for the assistant",
      "model": "Model identifier",
      "tools": "Optional tools"
    }
    ```
  - Response:
    - On success:
      ```json
      {
        "message": "Assistant created successfully."
      }
      ```
    - On error:
      ```json
      {
        "error": "Failed to create assistant."
      }
      ```
- Delete Assistant: `/api/core/assistants/delete/<int:assistant_id>/`
  - Method: DELETE
  - Description: Deletes an assistant by ID.
  - Response:
    - On success:
      ```json
      {
        "message": "Assistant deleted successfully."
      }
      ```
    - On error:
      ```json
      {
        "error": "Failed to delete assistant."
      }
      ```
- Edit Assistant: `/api/core/assistants/edit/<int:assistant_id>/`
  - Method: PUT
  - Description: Updates an assistant by ID. Requires `name`, `instructions`, `model`, and optionally `tools` in the request body.
  - Request Body:
    ```json
    {
      "name": "New name of the assistant",
      "instructions": "New instructions for the assistant",
      "model": "New model identifier",
      "tools": "New optional tools"
    }
    ```
  - Response:
    - On success:
      ```json
      {
        "message": "Assistant updated successfully."
      }
      ```
    - On error:
      ```json
      {
        "error": "Failed to update assistant."
      }
      ```

- List Questions: `/api/core/assistants/<uuid:bot_id>/questions`
  - Method: GET
  - Description: Lists all questions associated with a specific assistant identified by `bot_id`.
  - Response:
    ```json
    [
      {
        "id": "UUID of the question",
        "content": "Question content",
        "created_at": "Creation timestamp",
        "category": "Question category",
        "assistant": "UUID of the assistant",
        "user": "UUID of the user"
      },
      ...
    ]
    ```


## Thread API

The Thread API provides endpoints for managing chat threads.

### Endpoints

- List Threads: `/threads/`
  - Method: GET
  - Description: Lists all threads for the authenticated user.
  - Response:
    ```json
    [
      {
        "id": "UUID of the thread",
        "thread_id": "Thread identifier",
        "created_at": "Creation timestamp",
        "category": "Thread category",
        "assistant": "UUID of the assistant",
        "user": "UUID of the user"
      },
      ...
    ]
    ```

## Message API

The Message API provides endpoints for managing messages within a chat thread.

### Endpoints

- List Messages: `/threads/<uuid:thread_id>/messages/`
  - Method: GET
  - Description: Lists all messages for a specific thread, accessible only by the user who owns the thread.
  - Response:
    ```json
    [
      {
        "id": "UUID of the message",
        "thread": "UUID of the thread",
        "content": "Message content",
        "created_at": "Creation timestamp",
        "category": "Message category",
        "tokens": "Number of tokens",
        "feedback": "UUID of the feedback",
        "by": "Message sender (user or bot)"
      },
      ...
    ]
    ```

## WebSocket API

The WebSocket API provides real-time communication for chat threads. It uses Django Channels to handle WebSocket connections and allows for asynchronous communication between the server and clients.

### Endpoints

- Chat WebSocket: `/c/<thread_id>/`
  - Description: Connects to a WebSocket for a specific chat thread. Requires the `thread_id` in the URL.
  - Messages:
    - Send Message: Send a message to the server by sending a JSON object with a `content` field. The server will respond with a message from the bot.
    - Receive Message: Receive messages from the server as JSON objects with a `content` field. Messages can be sent by the user or the bot.

### Example Usage

To use the WebSocket API, a client must first establish a WebSocket connection to the endpoint `/c/<thread_id>/`. Replace `<thread_id>` with the actual UUID of the thread you want to access. Once connected, the client can send messages to the server and receive responses in real-time.

Here's a simple example using TypeScript and React:

```typescript

import React, { useEffect, useRef } from 'react';

const WebSocketExample: React.FC<{ threadId: string }> = ({ threadId }) => {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Establish WebSocket connection
    socketRef.current = new WebSocket(`ws://localhost:8000/c/${threadId}`);

    // Connection opened
    socketRef.current.addEventListener('open', () => {
      console.log('WebSocket is open now.');
    });

    // Listen for messages
    socketRef.current.addEventListener('message', (event) => {
      console.log('Message from server: ', event.data);
    });

    // Connection closed
    socketRef.current.addEventListener('close', () => {
      console.log('WebSocket is closed now.');
    });

    // Error handling
    socketRef.current.addEventListener('error', (event) => {
      console.error('WebSocket error observed:', event);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [threadId]);

  // Function to send a message to the server
  const sendMessage = (content: string) => {
    if (socketRef.current) {
      const message = { content: content };
      socketRef.current.send(JSON.stringify(message));
    }
  };

  // Example usage
  useEffect(() => {
    sendMessage('Hello, bot!');
  }, []);

  return <div>WebSocket Example</div>;
};

export default WebSocketExample;

```

Replace `<thread_id>` with the actual UUID of the thread you want to connect to.

## Conclusion

This documentation provides a comprehensive overview of the EchoB chat application's API endpoints. For more detailed information, refer to the Django REST Framework documentation and Django Channels documentation.


