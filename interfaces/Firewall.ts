import { DateTime } from "next-auth/providers/kakao";

export interface FirewallDTO {
  id: number;
  name?: string;
  labels?: string;
  created?: DateTime;
}
export interface FirewallSelection extends FirewallDTO {
  selected: boolean;
  publicIp: string;
  duration: string;
  requestedBy: string;
}

export interface RequestDTO {
  id?: string;
  firewallId?: number;
  publicIp?: string;
  duration?: string;
  createdAt?: DateTime;
  requestedBy?: string;
  status?: RequestStatusDTO | null;
}

export interface RequestStatusDTO {
  requestStatusId: number;
  name: string;
}

export interface UserDTO {
  azureAdId?: string;
  email?: string;
  name?: string;
  roles?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}