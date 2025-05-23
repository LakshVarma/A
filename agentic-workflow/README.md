# Agentic Workflow System

A modern agentic workflow system that integrates AI capabilities with powerful workflow orchestration.

## Features

- Multi-agent orchestration
- AI integration with Google AI Studio, NVIDIA AI, and more
- Zapier integration for connecting to thousands of apps
- Workflow creation and management
- User authentication with Clerk
- Database storage with Supabase
- Caching with Upstash Redis

## Project Structure

```
agentic-workflow/
├── frontend/           # Next.js frontend
├── backend/            # Node.js/Express backend
├── agents/             # Python agent system
├── shared/             # Shared types and utilities
└── .env                # Environment variables
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Git

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd agentic-workflow
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   ```
   cp .env.example .env
   ```
   Then edit the `.env` file with your API keys and configuration.

4. Start the development servers
   ```
   npm run dev:frontend
   npm run dev:backend
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Development

### Frontend (Next.js)

The frontend is built with Next.js, TypeScript, and Tailwind CSS. It uses Clerk for authentication and Shadcn UI for components.

```
cd frontend
npm run dev
```

### Backend (Node.js/Express)

The backend is built with Node.js, Express, and TypeScript. It uses Supabase for database storage and Upstash Redis for caching.

```
cd backend
npm run dev
```

### Agent System (Python)

The agent system is built with Python and AutoGen. It provides the AI capabilities for the workflow system.

```
cd agents
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
