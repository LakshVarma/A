# Agentic Workflow Integration Project

## Project Overview

This document outlines the complete specifications, architecture, and tech stack for building a modern, efficient agentic workflow system that integrates functionalities similar to Flowith AI, Manus AI, and DeepAgent, with Zapier for app integration. The project leverages only free or generous free-tier resources that don't require credit cards, ensuring cost-effective development and deployment.

## Core Requirements

- Create an agentic workflow system with multi-agent orchestration
- Integrate with Upstash Redis for performance and state management
- Use Supabase for data storage and authentication
- Incorporate Microsoft AutoGen for agentic workflows
- Implement Google AI Studio APIs for AI capabilities
- Deploy frontend on Vercel and backend on Render
- Use only free or generous free-tier resources (no credit card required)
- Implement modern, responsive UI with efficient user experience
- Ensure the system remains active without traditional cron jobs

## Project Structure

The project follows a monorepo structure with clear separation of concerns:

```
agentic-workflow/
├── .github/                    # GitHub workflows and configuration
├── frontend/                   # Next.js frontend application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── app/                # App router pages and layouts
│   │   ├── components/         # Reusable UI components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utility functions and shared code
│   │   ├── services/           # API service integrations
│   │   ├── store/              # State management
│   │   └── types/              # TypeScript type definitions
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   └── package.json            # Frontend dependencies
├── backend/                    # Node.js/Express backend
│   ├── src/
│   │   ├── api/                # API routes and controllers
│   │   ├── config/             # Configuration files
│   │   ├── middleware/         # Express middleware
│   │   ├── models/             # Data models
│   │   ├── services/           # Business logic services
│   │   ├── utils/              # Utility functions
│   │   └── index.ts            # Entry point
│   └── package.json            # Backend dependencies
├── agents/                     # Python-based AutoGen agents
│   ├── src/
│   │   ├── agents/             # Agent definitions
│   │   ├── workflows/          # Workflow definitions
│   │   ├── tools/              # Custom tools for agents
│   │   ├── config/             # Agent configuration
│   │   └── main.py             # Entry point
│   ├── requirements.txt        # Python dependencies
│   └── Dockerfile              # For containerization
├── shared/                     # Shared code and types
│   ├── src/
│   │   ├── types/              # Shared TypeScript types
│   │   └── constants/          # Shared constants
│   └── package.json            # Shared dependencies
└── package.json                # Root package.json for workspace management
```

## Tech Stack Specifications

### Frontend

- **Framework**: Next.js 14.1.0+ (App Router)
- **Language**: TypeScript 5.4.0+
- **UI Library**: React 19.0.0+
- **Styling**: 
  - Tailwind CSS 3.4.0+
  - Shadcn UI (component collection)
  - Radix UI (accessible primitives)
- **State Management**: 
  - React Context API for local state
  - Zustand 4.5.0+ for global state (lightweight alternative to Redux)
- **Data Fetching**: 
  - TanStack Query 5.0.0+ (formerly React Query)
  - SWR 2.2.0+ for specific real-time data needs
- **Form Handling**: React Hook Form 7.50.0+ with Zod 3.22.0+ for validation
- **Animation**: Framer Motion 11.0.0+ for smooth UI transitions
- **Charts/Visualization**: 
  - Recharts 2.10.0+ for data visualization
  - ReactFlow 11.10.0+ for workflow visualization
- **Date/Time**: date-fns 3.3.0+ for date manipulation
- **Icons**: Lucide React 0.300.0+ (lightweight icon library)

### Backend (Node.js)

- **Framework**: Express 4.18.0+
- **Language**: TypeScript 5.4.0+
- **Runtime**: Node.js 20.10.0+ (LTS)
- **API Documentation**: Swagger/OpenAPI 3.0
- **Validation**: Zod 3.22.0+ for schema validation
- **Logging**: Pino 8.16.0+ for structured logging
- **Error Handling**: Custom middleware with standardized error responses
- **Security**:
  - Helmet 7.1.0+ for HTTP headers
  - CORS 2.8.5+ for cross-origin resource sharing
  - Rate limiting with express-rate-limit 7.1.0+
- **Testing**: 
  - Jest 29.7.0+ for unit testing
  - Supertest 6.3.0+ for API testing

### Agents (Python)

- **Language**: Python 3.10+ (required for AutoGen)
- **Framework**: Microsoft AutoGen 0.2.0+
- **AI Integration**: 
  - Google AI Studio API (Gemini models)
  - Hugging Face Inference API (free tier)
- **HTTP Client**: httpx 0.26.0+ (async HTTP client)
- **Async Runtime**: asyncio for concurrent operations
- **Serialization**: Pydantic 2.5.0+ for data validation and serialization
- **Testing**: pytest 7.4.0+ for unit testing

### Data Storage

- **Primary Database**: Supabase (PostgreSQL)
  - Free tier: 500MB database, unlimited API requests
  - Authentication, storage, and realtime subscriptions
- **Caching/State**: Upstash Redis
  - Free tier: 10 databases, 10,000 daily commands
  - Used for workflow state, caching, and rate limiting
- **File Storage**: Supabase Storage
  - Free tier: 1GB storage
  - For document storage and file uploads

### Authentication & Authorization

- **Provider**: Supabase Auth
  - Email/password authentication
  - OAuth providers (Google, GitHub)
  - JWT-based session management
- **Authorization**: Role-based access control (RBAC)
  - Custom roles and permissions stored in Supabase
  - Row-level security (RLS) for data access control

### Integration

- **Zapier Integration**: 
  - Webhook-based integration
  - REST API endpoints for Zapier triggers and actions
- **OAuth Management**: 
  - Custom OAuth client implementation
  - Secure token storage in Supabase

### Deployment & Infrastructure

- **Frontend Hosting**: Vercel
  - Free tier: Unlimited websites, serverless functions
  - Continuous deployment from GitHub
  - Edge functions for low-latency operations
- **Backend Hosting**: Render
  - Free tier: Web services with sleep after inactivity
  - Keep-alive solution implemented (see below)
- **Agent Hosting**: Render
  - Free tier: Web services for Python agents
  - Containerized deployment with Docker
- **CI/CD**: GitHub Actions
  - Automated testing and deployment
  - Code quality checks and linting

### Keep-Alive Solution (Alternative to Cron Jobs)

Since traditional cron jobs are not available, we'll implement these alternatives:

1. **External Ping Service**:
   - Use free services like UptimeRobot or cron-job.org to ping the backend every 5 minutes
   - No credit card required, generous free tier

2. **Client-Side Pinging**:
   - Implement a "heartbeat" mechanism in the frontend that pings the backend periodically when users are active
   - Use service workers for background pinging even when the tab is closed

3. **Render's Built-in Cron Jobs**:
   - For paid plans (future option)
   - Can be used if upgrading becomes necessary

4. **Serverless Function Chaining**:
   - Use Vercel Edge Functions to ping the backend
   - Implement a self-perpetuating chain of serverless function calls

## Database Schema

### Supabase Tables

1. **users**
   - id (UUID, primary key)
   - email (string, unique)
   - created_at (timestamp)
   - updated_at (timestamp)
   - metadata (JSON)

2. **workflows**
   - id (UUID, primary key)
   - user_id (UUID, foreign key)
   - name (string)
   - description (text)
   - definition (JSON)
   - created_at (timestamp)
   - updated_at (timestamp)
   - is_active (boolean)

3. **workflow_executions**
   - id (UUID, primary key)
   - workflow_id (UUID, foreign key)
   - status (string)
   - started_at (timestamp)
   - completed_at (timestamp)
   - result (JSON)
   - error (text)

4. **agents**
   - id (UUID, primary key)
   - name (string)
   - description (text)
   - capabilities (JSON array)
   - configuration (JSON)
   - created_at (timestamp)
   - updated_at (timestamp)

5. **integrations**
   - id (UUID, primary key)
   - user_id (UUID, foreign key)
   - provider (string)
   - credentials (JSON, encrypted)
   - created_at (timestamp)
   - updated_at (timestamp)
   - last_used_at (timestamp)

6. **oauth_tokens**
   - id (UUID, primary key)
   - user_id (UUID, foreign key)
   - provider (string)
   - access_token (text, encrypted)
   - refresh_token (text, encrypted)
   - expires_at (timestamp)
   - created_at (timestamp)
   - updated_at (timestamp)

### Redis Data Structures

1. **Workflow State**
   - Key: `workflow:{workflow_id}:state`
   - Value: JSON string of current workflow state

2. **Agent Tasks**
   - Key: `agent:{agent_id}:tasks`
   - Value: Sorted set of tasks with priority scores

3. **Rate Limiting**
   - Key: `ratelimit:{user_id}:{endpoint}`
   - Value: Counter with TTL

4. **Caching**
   - Key: `cache:{resource_type}:{resource_id}`
   - Value: JSON string of cached data with TTL

## API Endpoints

### Authentication API

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/logout` - Logout a user
- `GET /api/auth/user` - Get current user information
- `POST /api/auth/refresh` - Refresh authentication token

### Workflow API

- `GET /api/workflows` - List all workflows for current user
- `GET /api/workflows/:id` - Get a specific workflow
- `POST /api/workflows` - Create a new workflow
- `PUT /api/workflows/:id` - Update a workflow
- `DELETE /api/workflows/:id` - Delete a workflow
- `POST /api/workflows/:id/execute` - Execute a workflow
- `GET /api/workflows/:id/executions` - List executions of a workflow
- `GET /api/workflows/:id/executions/:executionId` - Get execution details

### Agent API

- `GET /api/agents` - List all available agents
- `GET /api/agents/:id` - Get a specific agent
- `POST /api/agents/:id/execute` - Execute a specific agent task
- `GET /api/agents/capabilities` - List all agent capabilities

### Integration API

- `GET /api/integrations` - List all integrations for current user
- `POST /api/integrations` - Add a new integration
- `DELETE /api/integrations/:id` - Remove an integration
- `GET /api/integrations/:provider/auth` - Start OAuth flow
- `GET /api/integrations/:provider/callback` - OAuth callback endpoint

### Zapier API

- `POST /api/zapier/hooks` - Register a Zapier webhook
- `DELETE /api/zapier/hooks/:id` - Remove a Zapier webhook
- `POST /api/zapier/trigger/:triggerId` - Endpoint for Zapier triggers
- `POST /api/zapier/action/:actionId` - Endpoint for Zapier actions

## Frontend Pages and Components

### Pages

1. **Authentication**
   - Login
   - Registration
   - Password Reset

2. **Dashboard**
   - Overview of workflows
   - Recent executions
   - Performance metrics

3. **Workflow Management**
   - Workflow listing
   - Workflow creation/editing
   - Workflow visualization

4. **Workflow Execution**
   - Execution monitoring
   - Results visualization
   - Error handling

5. **Agent Management**
   - Agent listing
   - Agent configuration
   - Agent testing

6. **Integration Management**
   - Integration listing
   - OAuth connection
   - Zapier integration setup

7. **Settings**
   - User profile
   - Preferences
   - API keys

### Key Components

1. **WorkflowCanvas**
   - Interactive canvas for workflow creation
   - Drag-and-drop interface
   - Node and edge management

2. **AgentSelector**
   - Component for selecting and configuring agents
   - Capability filtering
   - Parameter configuration

3. **ExecutionMonitor**
   - Real-time execution monitoring
   - Progress visualization
   - Step-by-step results

4. **IntegrationConnector**
   - OAuth connection interface
   - Credential management
   - Connection testing

5. **DataVisualizer**
   - Result visualization
   - Chart and graph generation
   - Data export

## AutoGen Integration

Microsoft AutoGen will be integrated as follows:

1. **Agent Definition**
   - Custom agents defined using AutoGen's framework
   - Specialized agents for different tasks (research, code generation, data analysis)
   - Agent communication patterns defined in YAML configuration

2. **Workflow Orchestration**
   - AutoGen's GroupChat for multi-agent orchestration
   - Custom message routing and filtering
   - Dynamic agent selection based on task requirements

3. **Tool Integration**
   - Custom tools implemented as Python functions
   - Tool registration with AutoGen agents
   - Result parsing and formatting

4. **State Management**
   - Conversation history stored in Supabase
   - Intermediate results cached in Redis
   - Long-term memory implemented with vector storage

## Google AI Studio Integration

The project will leverage Google AI Studio's free tier:

1. **Models**
   - Gemini 1.5 Flash for general tasks
   - Gemini 1.0 Pro for specialized tasks
   - Free tier limits: 15 requests per minute

2. **API Integration**
   - Direct integration with Google AI API
   - Prompt templating and optimization
   - Result parsing and formatting

3. **Capabilities**
   - Text generation and summarization
   - Code generation and explanation
   - Data analysis and visualization
   - Multimodal understanding (text + images)

## Performance Optimization

1. **Caching Strategy**
   - Multi-level caching (browser, API, database)
   - Redis for high-speed caching
   - Cache invalidation based on dependencies

2. **Lazy Loading**
   - Component-level code splitting
   - Dynamic imports for large dependencies
   - Progressive loading of workflow data

3. **Optimistic Updates**
   - Immediate UI updates before API confirmation
   - Background synchronization
   - Conflict resolution

4. **Efficient Data Fetching**
   - Pagination for large datasets
   - Cursor-based pagination for efficiency
   - Selective field retrieval

5. **Resource Management**
   - Efficient use of free tier resources
   - Graceful degradation when limits are approached
   - User-configurable resource allocation

## Security Measures

1. **Authentication**
   - JWT-based authentication
   - Secure token storage
   - Regular token rotation

2. **Authorization**
   - Role-based access control
   - Resource-level permissions
   - Row-level security in Supabase

3. **Data Protection**
   - Encryption of sensitive data
   - Secure credential storage
   - Minimal data collection

4. **API Security**
   - Rate limiting
   - Input validation
   - CORS configuration
   - Security headers

5. **Dependency Management**
   - Regular security updates
   - Dependency scanning
   - Minimal dependency footprint

## Testing Strategy

1. **Unit Testing**
   - Component-level tests
   - Service-level tests
   - Utility function tests

2. **Integration Testing**
   - API endpoint tests
   - Workflow execution tests
   - Agent interaction tests

3. **End-to-End Testing**
   - User flow testing
   - Cross-browser compatibility
   - Mobile responsiveness

4. **Performance Testing**
   - Load testing within free tier limits
   - Response time benchmarking
   - Resource usage monitoring

## Deployment Process

1. **Frontend (Vercel)**
   - GitHub integration for continuous deployment
   - Preview deployments for pull requests
   - Environment variable management
   - Edge function deployment

2. **Backend (Render)**
   - GitHub integration for continuous deployment
   - Docker-based deployment
   - Environment variable management
   - Keep-alive mechanism implementation

3. **Database (Supabase)**
   - Schema migrations
   - Seed data management
   - Backup strategy within free tier limits

4. **Monitoring**
   - Error tracking with Sentry (free tier)
   - Performance monitoring with Vercel Analytics
   - Custom logging and alerting

## Development Workflow

1. **Local Development**
   - Docker Compose for local environment
   - Environment variable management
   - Hot reloading for frontend and backend

2. **Version Control**
   - GitHub for source control
   - Branch protection rules
   - Conventional commits

3. **Code Quality**
   - ESLint for JavaScript/TypeScript
   - Prettier for code formatting
   - Husky for pre-commit hooks

4. **Documentation**
   - Inline code documentation
   - API documentation with Swagger
   - User documentation with MDX

## Conclusion

This project specification outlines a comprehensive, modern, and efficient agentic workflow system that leverages free and generous free-tier resources. By following this specification, developers can build a sophisticated system that integrates the best features of leading agentic workflow platforms while maintaining cost-effectiveness and performance.

The architecture is designed to be scalable, maintainable, and extensible, with clear separation of concerns and modular components. The use of modern technologies and best practices ensures a high-quality user experience and developer experience.
