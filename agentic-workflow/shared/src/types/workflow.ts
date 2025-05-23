/**
 * Workflow Types
 * 
 * These types are shared between the frontend and backend
 */

export interface Position {
  x: number;
  y: number;
}

export interface Node {
  id: string;
  type: string;
  position: Position;
  data: Record<string, any>;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  result?: any;
  error?: string;
  userId: string;
}

export interface WorkflowExecutionState {
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: Record<string, any>;
  currentNode: string | null;
  result: Record<string, any>;
  error?: string;
}

export interface WorkflowExecutionWithState extends WorkflowExecution {
  state?: WorkflowExecutionState;
}

export interface WorkflowInput {
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  isActive?: boolean;
}

export interface WorkflowUpdateInput extends Partial<WorkflowInput> {}

export interface WorkflowExecutionInput {
  input?: Record<string, any>;
}

// Node Types

export enum NodeType {
  TRIGGER = 'trigger',
  AGENT = 'agent',
  CONDITION = 'condition',
  INTEGRATION = 'integration',
  ZAPIER = 'zapier',
  TRANSFORM = 'transform',
  OUTPUT = 'output',
}

export interface TriggerNodeData {
  type: 'manual' | 'scheduled' | 'webhook';
  schedule?: string; // Cron expression for scheduled triggers
  webhookId?: string; // ID of the webhook for webhook triggers
}

export interface AgentNodeData {
  agentId: string;
  prompt: string;
  parameters?: Record<string, any>;
}

export interface ConditionNodeData {
  condition: string;
  parameters?: Record<string, any>;
}

export interface IntegrationNodeData {
  integrationId: string;
  action: string;
  parameters?: Record<string, any>;
}

export interface ZapierNodeData {
  actionId: string;
  parameters?: Record<string, any>;
}

export interface TransformNodeData {
  transformType: 'map' | 'filter' | 'reduce';
  code: string;
}

export interface OutputNodeData {
  format: 'json' | 'text' | 'html';
  template?: string;
}

// Node Definitions (for UI)

export interface NodeDefinition {
  type: NodeType;
  label: string;
  description: string;
  color: string;
  icon: string;
  category: 'trigger' | 'process' | 'output' | 'integration';
  inputs: number;
  outputs: number;
  configSchema: Record<string, any>;
}

export const NODE_DEFINITIONS: Record<NodeType, NodeDefinition> = {
  [NodeType.TRIGGER]: {
    type: NodeType.TRIGGER,
    label: 'Trigger',
    description: 'Starts the workflow',
    color: '#4CAF50',
    icon: 'play_arrow',
    category: 'trigger',
    inputs: 0,
    outputs: 1,
    configSchema: {
      type: {
        type: 'select',
        options: ['manual', 'scheduled', 'webhook'],
        default: 'manual',
        label: 'Trigger Type',
      },
      schedule: {
        type: 'string',
        label: 'Schedule (Cron)',
        showIf: { type: 'scheduled' },
      },
    },
  },
  [NodeType.AGENT]: {
    type: NodeType.AGENT,
    label: 'Agent',
    description: 'AI agent that performs a task',
    color: '#2196F3',
    icon: 'smart_toy',
    category: 'process',
    inputs: 1,
    outputs: 1,
    configSchema: {
      agentId: {
        type: 'select',
        options: [], // Populated dynamically
        label: 'Agent',
      },
      prompt: {
        type: 'textarea',
        label: 'Prompt',
      },
      parameters: {
        type: 'json',
        label: 'Parameters',
      },
    },
  },
  [NodeType.CONDITION]: {
    type: NodeType.CONDITION,
    label: 'Condition',
    description: 'Branches the workflow based on a condition',
    color: '#FFC107',
    icon: 'call_split',
    category: 'process',
    inputs: 1,
    outputs: 2,
    configSchema: {
      condition: {
        type: 'code',
        language: 'javascript',
        label: 'Condition',
      },
    },
  },
  [NodeType.INTEGRATION]: {
    type: NodeType.INTEGRATION,
    label: 'Integration',
    description: 'Connects to an external service',
    color: '#9C27B0',
    icon: 'extension',
    category: 'integration',
    inputs: 1,
    outputs: 1,
    configSchema: {
      integrationId: {
        type: 'select',
        options: [], // Populated dynamically
        label: 'Integration',
      },
      action: {
        type: 'select',
        options: [], // Populated dynamically based on selected integration
        label: 'Action',
      },
      parameters: {
        type: 'json',
        label: 'Parameters',
      },
    },
  },
  [NodeType.ZAPIER]: {
    type: NodeType.ZAPIER,
    label: 'Zapier',
    description: 'Connects to Zapier',
    color: '#FF5722',
    icon: 'bolt',
    category: 'integration',
    inputs: 1,
    outputs: 1,
    configSchema: {
      actionId: {
        type: 'select',
        options: [], // Populated dynamically
        label: 'Action',
      },
      parameters: {
        type: 'json',
        label: 'Parameters',
      },
    },
  },
  [NodeType.TRANSFORM]: {
    type: NodeType.TRANSFORM,
    label: 'Transform',
    description: 'Transforms the data',
    color: '#607D8B',
    icon: 'transform',
    category: 'process',
    inputs: 1,
    outputs: 1,
    configSchema: {
      transformType: {
        type: 'select',
        options: ['map', 'filter', 'reduce'],
        default: 'map',
        label: 'Transform Type',
      },
      code: {
        type: 'code',
        language: 'javascript',
        label: 'Code',
      },
    },
  },
  [NodeType.OUTPUT]: {
    type: NodeType.OUTPUT,
    label: 'Output',
    description: 'Outputs the result',
    color: '#E91E63',
    icon: 'output',
    category: 'output',
    inputs: 1,
    outputs: 0,
    configSchema: {
      format: {
        type: 'select',
        options: ['json', 'text', 'html'],
        default: 'json',
        label: 'Format',
      },
      template: {
        type: 'textarea',
        label: 'Template',
        showIf: { format: ['text', 'html'] },
      },
    },
  },
};
