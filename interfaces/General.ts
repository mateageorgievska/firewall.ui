export interface SubMenuItem {
	name: string
	slug?: string
	active?: boolean
	dropdown?: boolean
	dropdownItems?: { name: string; slug: string }[]
}

export interface UserTaskDTO {
  instanceId: string;
  userTaskFlowNodeId: string;
  loopCounter: number;
  name: string;
  formKey: string | null;
  assignedTo: string | null;
  isStandardLoopCharacteristics: boolean;
  status: string;
  userTaskAction: string;
  created: string;      
  changed: string;         
  dueDate: string | null;
  followUpDate: string | null;
  data: any;
  id: string;
}

export interface WorkflowDataField<T = any> {
  ElementId: string | null;
  data: T;
}

export interface WorkflowData {
  requestId?: any
  duration: WorkflowDataField<string>;
  publicIp: WorkflowDataField<string>;
  firewallId: WorkflowDataField<number>;
  requestedBy: WorkflowDataField<string>;
  firewall: WorkflowDataField<{
    id: string;
    pStatusId: any;
    firewallId: number;
    publicIp: string;
    duration: string;
    createdAt: string;
    requestedBy: string;
    status: string;
  }>;
}

export interface ProcessInstanceDTO {
  userTasksArray: UserTaskDTO[];
  instanceId: string;
  parentInstanceId: string | null;
  definitionId: string;
  name: string;
  status: number;
  businessKey: string | null;
  parentBusinessKey: string | null;
  currentFlowNodeId: string;
  previousFlowNodeId: string;
  sequenceFlowIds: string[];
  activityErrors: any[];
  workflowData: WorkflowData;
  childProcesses: Record<string, any>;
  changed: string;
  executionStatusInfo: any | null;
  messages: any[];
  userTasks: UserTaskDTO[];
  httpStatusCode: number;
}

export interface HetznerRule {
  direction: "in" | "out";
  protocol: string;
  port?: string | number | null;
  description?: string;
  source_ips: string[];
  destination_ips?: string[];
}



