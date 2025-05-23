-- Supabase SQL Schema for Agentic Workflow

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (managed by Clerk, but we need a reference)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::JSONB
);

-- Workflows Table
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  nodes JSONB NOT NULL DEFAULT '[]'::JSONB,
  edges JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  
  CONSTRAINT workflows_name_user_id_key UNIQUE (name, user_id)
);

-- Workflow Executions Table
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  result JSONB,
  error TEXT
);

-- Agents Table (predefined agents)
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  capabilities JSONB NOT NULL DEFAULT '[]'::JSONB,
  configuration JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integrations Table
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  credentials JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT integrations_provider_user_id_key UNIQUE (provider, user_id)
);

-- OAuth Tokens Table
CREATE TABLE IF NOT EXISTS oauth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT oauth_tokens_provider_user_id_key UNIQUE (provider, user_id)
);

-- Zapier Webhooks Table
CREATE TABLE IF NOT EXISTS zapier_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT zapier_webhooks_workflow_id_event_key UNIQUE (workflow_id, event)
);

-- Row Level Security Policies

-- Workflows: Users can only access their own workflows
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY workflows_select_policy ON workflows
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY workflows_insert_policy ON workflows
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY workflows_update_policy ON workflows
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY workflows_delete_policy ON workflows
  FOR DELETE USING (user_id = auth.uid());

-- Workflow Executions: Users can only access their own workflow executions
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY workflow_executions_select_policy ON workflow_executions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY workflow_executions_insert_policy ON workflow_executions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY workflow_executions_update_policy ON workflow_executions
  FOR UPDATE USING (user_id = auth.uid());

-- Integrations: Users can only access their own integrations
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY integrations_select_policy ON integrations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY integrations_insert_policy ON integrations
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY integrations_update_policy ON integrations
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY integrations_delete_policy ON integrations
  FOR DELETE USING (user_id = auth.uid());

-- OAuth Tokens: Users can only access their own OAuth tokens
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY oauth_tokens_select_policy ON oauth_tokens
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY oauth_tokens_insert_policy ON oauth_tokens
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY oauth_tokens_update_policy ON oauth_tokens
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY oauth_tokens_delete_policy ON oauth_tokens
  FOR DELETE USING (user_id = auth.uid());

-- Zapier Webhooks: Users can only access their own webhooks
ALTER TABLE zapier_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY zapier_webhooks_select_policy ON zapier_webhooks
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY zapier_webhooks_insert_policy ON zapier_webhooks
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY zapier_webhooks_delete_policy ON zapier_webhooks
  FOR DELETE USING (user_id = auth.uid());

-- Agents: Everyone can read agents, but no one can modify them
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY agents_select_policy ON agents
  FOR SELECT USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS workflows_user_id_idx ON workflows (user_id);
CREATE INDEX IF NOT EXISTS workflow_executions_workflow_id_idx ON workflow_executions (workflow_id);
CREATE INDEX IF NOT EXISTS workflow_executions_user_id_idx ON workflow_executions (user_id);
CREATE INDEX IF NOT EXISTS integrations_user_id_idx ON integrations (user_id);
CREATE INDEX IF NOT EXISTS oauth_tokens_user_id_idx ON oauth_tokens (user_id);
CREATE INDEX IF NOT EXISTS zapier_webhooks_workflow_id_idx ON zapier_webhooks (workflow_id);
CREATE INDEX IF NOT EXISTS zapier_webhooks_user_id_idx ON zapier_webhooks (user_id);
