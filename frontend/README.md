# Echo: Agent-Driven Knowledge Base

## Overview

Echo is a sophisticated React project aimed at creating dynamic and responsive user interfaces, potentially for applications involving chatbots or conversational interfaces. The project is built with a cutting-edge tech stack, including React, Redux, Tailwind CSS, and a host of other libraries and tools to ensure a robust and scalable foundation.

## Technologies Used

- **Frontend:** React, Redux, Tailwind CSS
- **Build Tool:** Vite
- **State Management:** Redux Toolkit
- **UI Components:** Radix UI components, TanStack React Table, Lucide React icons
- **Styling:** Tailwind CSS
- **Other Libraries:** Framer Motion, React Hook Form, React Router, Zod, Zustand

## Project Structure

The project is organized into several key directories and files, each serving a specific purpose:

- **`src/`**: Contains the main source code of the project.
- **`components/`**: Organized under `src/components/`, with subdirectories for constants, helpers, layout, and UI components.
- **`pages/`**: Different pages of the application are organized under `src/pages/`, such as admin, agents, assistants, auth, chat, homepage, knowledge, etc.
- **`redux/`**: Contains Redux slices for different parts of the application like admin, auth, chat, conversations, documents, messages, models, support, etc.
- **`services/`**: Contains modules for different services like assistants, auth, chat, documents, support, etc.
- **`assets/`**: For static assets like images and SVGs.
- **`fonts/`**: For font files.
- **`lib/`**: For utility functions.
- **`hooks/`**: For custom hooks.

## Key Features

- **Modular Design:** The project is structured to promote modularity, making it easier to maintain and scale.
- **Responsive UI:** Utilizes Tailwind CSS for design optmized for laptop screens.
- **State Management:** Employs Redux Toolkit for efficient state management, facilitating complex state logic.
- **Dynamic Content:** Supports dynamic content loading and rendering, enhancing user experience.
- **Customizable Theme:** Leverages Tailwind CSS for easy theme customization, allowing for a consistent and modern look and feel.

## Pages and Their Functionality

### Login Page (`src/pages/Auth/Login/index.tsx`)

The Login Page is the entry point for users to authenticate themselves into the application. It features:

- **UserAuthForm:** A form component that handles user authentication. It includes fields for entering credentials (username and password) and a submit button.
- **Logo:** A logo image that represents the application.
- **Navigation Link:** A link to the Signup Page for users who do not have an account yet.

### Signup Page (`src/pages/Auth/Signup/index.tsx`)

The Signup Page allows new users to create an account. It features:

- **UserAuthForm:** A form component that handles user registration. It includes fields for entering new user information (username, password, etc.) and a submit button.
- **Logo:** A logo image that represents the application.
- **Navigation Link:** A link to the Login Page for users who already have an account.

### Manage Agents Page (`src/pages/agents/ManageAgents/index.tsx`)

The Manage Agents Page is designed for administrators to manage chatbot agents. It features:

- **DataTable:** Displays a list of chatbot agents with various details such as name, category, project, and status.
- **DataTableRowActionsAgents:** Provides actions for each agent, such as editing or deleting an agent.
- **FetchDocuments:** A Redux action that fetches documents related to the agents, enhancing the functionality of the page.

### Chat Screen (`src/pages/chat/NewChat/index.tsx`)

The Chat Screen is designed for initiating new conversations. It allows users to send messages to a selected bot and displays the bot's responses. Key components include:

- **ChatTopBar:** Displays the title of the chat and the selected bot.
- **MessageModule:** Renders individual messages, including both user and bot messages.
- **ChatBottombar:** Provides an input field for typing messages and a send button to submit them.

### Chat Screen (`src/pages/chat/ChatScreen/index.tsx`)

This Chat Screen is for ongoing conversations. It displays a history of messages exchanged between the user and the bot. Key components include:

- **ChatTopBar:** Shows the title of the chat and the agent involved.
- **MessageModule:** Renders the conversation history, including messages from both the user and the bot.
- **ChatBottombar:** Offers an input field for typing new messages and a send button.

### Admin Prompt Tracking (`src/pages/admin/PromptTracking/index.tsx`)

The Admin Prompt Tracking page provides insights into the performance and usage of chatbots. It features:

- **Date Picker:** Allows administrators to select a specific date for data analysis.
- **Info Cards:** Displays key metrics such as error rate, response time, and active users.
- **Tabs:** Separates content into tabs for easy navigation between different types of data.

### Content Library (`src/pages/Assistants/ContentLibrary/index.tsx`)

The Content Library page is a repository of documents related to the chatbot's knowledge base. It includes:

- **DataTable:** Lists all available documents with options to delete or edit entries.
- **ContentLibraryForm:** A form for adding new documents or editing existing ones.

### Main Application (`src/App.tsx`)

The main application file sets up the Redux store and wraps the application in a Provider component. It also includes the main routing logic to navigate between different pages.

## Getting Started

To get started with the Echo project, follow these steps:

1. **Clone the Repository:**
   ```
   git clone [text](https://github.com/Gem-AI-Studio/echo_f.git)
   ```

2. **Install Dependencies:**
   Navigate to the project directory and run:
   ```
   npm install
   ```
   <!-- This was required -->
   <!-- npm i -save-dev @hookform/resolvers -->

3. **Start the Development Server:**
   ```
   npm run dev
   ```

4. **Build the Project:**
   To create a production build of the project, run:
   ```
   npm run build
   ```

5. **Preview the Build:**
   After building the project, you can preview it by running:
   ```
   npm run preview
   ```

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) for more details.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.