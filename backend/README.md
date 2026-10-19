file_path: echo_b/README.md
# Shruti Lad Personal AI Backend

This project is now a personal AI backend for Shruti Lad. It includes chat, assistant management, authentication, and document-powered AI workflows built with Django, Django Channels, and Django REST Framework.

## Project Identity

- Owner: Shruti Lad
- Project type: Personal AI assistant backend
- Purpose: Custom chat and assistant experiences for personal use and experimentation

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
- Edit Assistant: `/api/core/assistants/edit/<int:assistant_id>/`
  - Method: PUT
  - Description: Updates an assistant by ID.

## Thread API

The Thread API provides endpoints for managing chat threads.

### Endpoints

- List Threads: `/threads/`
  - Method: GET
  - Description: Lists all threads for the authenticated user.

## Message API

The Message API provides endpoints for managing messages within a chat thread.

### Endpoints

- List Messages: `/threads/<uuid:thread_id>/messages/`
  - Method: GET
  - Description: Lists all messages for a specific thread.

## WebSocket API

The WebSocket API provides real-time communication for chat threads through Django Channels.

### Endpoints

- Chat WebSocket: `/c/<thread_id>/`
  - Description: Connects to a WebSocket for a specific chat thread. Requires the `thread_id` in the URL.
  - Messages:
    - Send Message: Send a JSON object with a `content` field.
    - Receive Message: Receive messages from the server as JSON objects with a `content` field.

### Example Usage

```typescript
import React, { useEffect, useRef } from 'react';

const WebSocketExample: React.FC<{ threadId: string }> = ({ threadId }) => {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    socketRef.current = new WebSocket(`ws://localhost:8000/c/${threadId}`);

    socketRef.current.addEventListener('open', () => {
      console.log('WebSocket is open now.');
    });

    socketRef.current.addEventListener('message', (event) => {
      console.log('Message from server: ', event.data);
    });

    socketRef.current.addEventListener('close', () => {
      console.log('WebSocket is closed now.');
    });

    socketRef.current.addEventListener('error', (event) => {
      console.error('WebSocket error observed:', event);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [threadId]);

  const sendMessage = (content: string) => {
    if (socketRef.current) {
      const message = { content: content };
      socketRef.current.send(JSON.stringify(message));
    }
  };

  useEffect(() => {
    sendMessage('Hello!');
  }, []);

  return <div>WebSocket Example</div>;
};

export default WebSocketExample;
```

## Conclusion

This project is now personalized for Shruti Lad and serves as a custom AI backend for chat, assistant generation, and personal experimentation.


