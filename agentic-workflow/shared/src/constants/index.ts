export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/api/auth/register',
    USER: '/api/auth/user'
  },
  WORKFLOWS: {
    BASE: '/api/workflows',
    EXECUTE: (id: string) => `/api/workflows/${id}/execute`,
    EXECUTIONS: (id: string) => `/api/workflows/${id}/executions`
  },
  AGENTS: {
    BASE: '/api/agents',
    EXECUTE: (id: string) => `/api/agents/${id}/execute`,
    CAPABILITIES: '/api/agents/capabilities'
  },
  INTEGRATIONS: {
    BASE: '/api/integrations',
    AUTH: (provider: string) => `/api/integrations/${provider}/auth`,
    CALLBACK: (provider: string) => `/api/integrations/${provider}/callback`
  },
  ZAPIER: {
    HOOKS: '/api/zapier/hooks',
    TRIGGER: (id: string) => `/api/zapier/trigger/${id}`,
    ACTION: (id: string) => `/api/zapier/action/${id}`
  }
};

export const NODE_TYPES = {
  INPUT: 'input',
  OUTPUT: 'output',
  AGENT_TASK: 'agent_task',
  CONDITION: 'condition',
  LOOP: 'loop',
  TRANSFORM: 'transform',
  INTEGRATION: 'integration'
};

export const AGENT_TYPES = {
  RESEARCH: 'research',
  CODE: 'code',
  WRITING: 'writing',
  DATA_ANALYSIS: 'data_analysis',
  PLANNING: 'planning'
};

export const INTEGRATION_PROVIDERS = {
  GOOGLE: 'google',
  GITHUB: 'github',
  SLACK: 'slack',
  NOTION: 'notion'
};
