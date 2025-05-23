# Agentic Workflow Setup Guide

This guide will help you set up and run the Agentic Workflow project.

## Prerequisites

Before you begin, make sure you have the following:

1. **Node.js** (v18 or later) and npm installed
2. **Supabase** account (for database)
3. **Upstash Redis** account (for state management)
4. **Clerk** account (for authentication)
5. **Google AI Studio** API key (for AI capabilities)

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/LakshVarma/general-agent.git
cd general-agent/agentic-workflow
```

### 2. Set Up Environment Variables

The project requires several environment variables to be set up. These are already configured in the `.env` files, but you'll need to replace the placeholder values with your actual API keys.

#### Backend Environment Variables

Edit `backend/.env` and update the following values:

```
# Authentication (Clerk)
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# Database (Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret

# Caching (Upstash Redis)
UPSTASH_REDIS_URL=your_upstash_redis_url
UPSTASH_REDIS_TOKEN=your_upstash_redis_token

# AI Models
GOOGLE_AI_API_KEY=your_google_ai_key
```

#### Frontend Environment Variables

Edit `frontend/.env.local` and update the following values:

```
# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Supabase (for direct client access if needed)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install Dependencies

Install dependencies for all packages:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install shared dependencies
cd ../shared
npm install
```

### 4. Set Up Supabase Database

The database schema will be automatically initialized when the backend server starts. However, you can also run it manually:

```bash
cd backend
npm run db:init
```

### 5. Set Up Clerk Webhooks

To keep user data in sync between Clerk and Supabase:

1. Go to your Clerk dashboard
2. Navigate to Webhooks
3. Create a new webhook with the endpoint: `https://your-backend-url.com/api/auth/webhook`
4. Select the following events: `user.created`, `user.updated`, `user.deleted`
5. Copy the signing secret and add it to your backend `.env` file as `CLERK_WEBHOOK_SECRET`

## Running the Project

### Development Mode

Start the backend server:

```bash
cd backend
npm run dev
```

In a separate terminal, start the frontend server:

```bash
cd frontend
npm run dev
```

The backend will be available at http://localhost:3001 and the frontend at http://localhost:3000.

### Production Mode

Build and start the backend:

```bash
cd backend
npm run build
npm start
```

Build and start the frontend:

```bash
cd frontend
npm run build
npm start
```

## Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## API Documentation

The main API endpoints are:

### Workflows

- `GET /api/workflows`: Get all workflows
- `GET /api/workflows/:id`: Get a specific workflow
- `POST /api/workflows`: Create a new workflow
- `PUT /api/workflows/:id`: Update a workflow
- `DELETE /api/workflows/:id`: Delete a workflow
- `POST /api/workflows/:id/execute`: Execute a workflow
- `GET /api/workflows/:id/executions`: Get all executions for a workflow
- `GET /api/workflows/:id/executions/:executionId`: Get a specific execution

### Agents

- `GET /api/agents`: Get all available agents
- `GET /api/agents/:id`: Get a specific agent
- `POST /api/agents/:id/execute`: Execute an agent task

### Integrations

- `GET /api/integrations`: Get all integrations
- `POST /api/integrations`: Add a new integration
- `DELETE /api/integrations/:id`: Remove an integration

### Zapier

- `POST /api/zapier/hooks`: Register a webhook
- `DELETE /api/zapier/hooks/:id`: Delete a webhook
- `GET /api/zapier/actions`: Get all Zapier actions
- `POST /api/zapier/actions/:id/execute`: Execute a Zapier action

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Make sure your Supabase URL and key are correct
   - Check if your IP is allowed in Supabase

2. **Authentication Issues**
   - Verify your Clerk API keys
   - Make sure the webhook is properly configured

3. **Redis Connection Issues**
   - Check your Upstash Redis URL and token
   - Verify network connectivity to Upstash

4. **AI API Issues**
   - Ensure your Google AI API key is valid
   - Check usage quotas and limits

For any other issues, please check the logs or open an issue on the repository.
