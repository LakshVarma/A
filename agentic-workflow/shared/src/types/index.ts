export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  isActive: boolean;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  result?: Record<string, any>;
  error?: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  configuration: Record<string, any>;
}

export interface Integration {
  id: string;
  userId: string;
  provider: string;
  credentials: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
