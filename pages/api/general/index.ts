/* eslint-disable @typescript-eslint/no-explicit-any */
import { action, flow, makeObservable, observable } from "mobx";
import {
  FirewallDTO,
  FirewallSelection,
  RequestDTO,
  UserDTO,
} from "@/interfaces/Firewall";
import { AxiosError, AxiosResponse } from "axios";
import { ENV } from "@/env";
import {
  callApiBpmnServiceGet,
  callApiBpmnServicePost,
  callApiGet,
  callApiHetznerServiceGet,
  callApiHetznerServicePost,
  callApiPost,
  callApiPut,
} from "../axiosCalls";
import { signOut } from "next-auth/react";
import {
  HetznerRule,
  ProcessInstanceDTO,
  UserTaskDTO,
} from "@/interfaces/General";
import qs from "qs";

export interface OptionType {
  label: string;
  value: any;
}

const statusMap: Record<number, string> = {
  1: "Pending",
  2: "Approved",
  3: "Rejected",
};
export class GeneralStore {
  activeStep = 1;
  totalSteps = 0;
  user: UserDTO | null = null;
  firewalls: FirewallDTO[] = [];
  request: RequestDTO | null = null;
  requests: { data: RequestDTO[]; totalRecords: number } = {
    data: [],
    totalRecords: 0,
  };
  processInstance: ProcessInstanceDTO | null = null;
  processInstances: any[] = [];
  task: UserTaskDTO | null = null;
  requestStatuses: OptionType[] = [];
  selectedRequestStatus: OptionType | null = null;
  selectedRequests: OptionType | null = null;
  errors: any = null;
  loadingRequests: boolean = false;
  loadingFirewalls: boolean = false;
  loadingUser: boolean = false;
  loadingProcessInstance: boolean = false;
  loadingProcessInstances: boolean = false;
  loadingUserTask: boolean = false;
  isSubmitting: boolean = false;
  approvalTaskId: string | null = null;
  firstUserTaskId: any;
  processInfo: any;

  constructor() {
    makeObservable(this, {
      activeStep: observable,
      totalSteps: observable,
      user: observable,
      firewalls: observable,
      request: observable,
      requests: observable,
      processInstance: observable,
      processInstances: observable,
      task: observable,
      requestStatuses: observable,
      selectedRequestStatus: observable,
      loadingUser: observable,
      loadingProcessInstance: observable,
      loadingProcessInstances: observable,
      loadingUserTask: observable,
      onSetActiveStep: action,
      onSetTotalSteps: action,
      onSetSelectedRequestStatus: action,
      getFirewalls: flow,
      getRequests: flow,
      getUser: flow,
      getProcessInstances: flow,
      getProcessInstanceById: flow,
      completeUserTask: flow,
      startFirewallProcess: flow,
      onSetRequest: action,
      onSetProcessInstance: action,
      onSetUser: action,
      postFirewallRequests: flow,
      updateRequestStatus: flow,
      postFirewallRules: flow,
      removeFirewallRules: flow,
    });
  }

  onSetActiveStep = (data: number) => {
    this.activeStep = data;
  };
  onSetTotalSteps = (data: number) => {
    this.totalSteps = data;
  };
  onSetSelectedRequestStatus = (status: OptionType | null) => {
    this.selectedRequestStatus = status;
  };
  onSetRequest = (data: RequestDTO) => {
    this.request = data;
  };
  onSetErrors = (data: any) => {
    this.errors = data;
  };
  onSetUser = (data: UserDTO) => {
    this.user = data;
  };
  onSetProcessInstance = (data: ProcessInstanceDTO) => {
    this.processInstance = data;
  };

  //schedule removal - duration of firewall rule
  scheduleRuleRemoval(firewallId: number, publicIp: string, duration: string) {
    const ms = this.convertDurationToMs(duration);
    if (ms === null) {
      console.warn("Invalid duration provided:", duration);
      return;
    }

    setTimeout(() => {
      this.removeFirewallRules(firewallId, publicIp);
    }, ms);
  }

  convertDurationToMs(duration: string): number | null {
    const [value, unit] = duration.split("_");

    const num = parseInt(value, 10);
    if (isNaN(num)) return null;

    switch (unit) {
      case "second":
      case "seconds":
        return num * 1000;
      case "minute":
      case "minutes":
        return num * 60 * 1000;
      case "hour":
      case "hours":
        return num * 60 * 60 * 1000;
      case "day":
      case "days":
        return num * 24 * 60 * 60 * 1000;
      case "week":
      case "weeks":
        return num * 7 * 24 * 60 * 60 * 1000;
      default:
        return null;
    }
  }

  *removeFirewallRules(firewallId: number, publicIp: string) {
    try {
      this.onSetErrors(null);
      //get current firewall
      const getResp: AxiosResponse = yield callApiHetznerServiceGet(
        `${firewallId}`
      );
      //get existing rules
      const existingRules = getResp.data.firewall.rules || [];

      const newRules = existingRules
        .map((rule: HetznerRule) => ({
          ...rule,
          source_ips: rule.source_ips.filter((ip) => !ip.startsWith(publicIp)),
        }))
        .filter((rule: HetznerRule) => rule.source_ips.length > 0);

      const response: AxiosResponse = yield callApiHetznerServicePost(
        `${firewallId}/actions/set_rules`,
        { rules: newRules }
      );

      if (response.status === 201 || response.status === 200) {
        console.log("Firewall rules removed successfully:", response.data);
      } else {
        this.onSetErrors("Failed to remove firewall rules");
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as AxiosError;
        this.onSetErrors(axiosErr.response?.data || "Unknown error occurred");
      } else if (err instanceof Error) {
        this.onSetErrors(err.message || "Unknown error occurred");
      }
    }
  }

  *postFirewallRules(firewallId: number, publicIp: string, duration: string, port: string, user: string) {
    try {
      this.onSetErrors(null);
      const getResp: AxiosResponse = yield callApiHetznerServiceGet(
        `${firewallId}`
      );
      const existingRules = getResp.data.firewall.rules || [];

      const normalizedRules = existingRules
        .filter(
          (rule: HetznerRule) => rule.source_ips && rule.source_ips.length > 0
        )
        .map((rule: HetznerRule) => ({
          direction: rule.direction ?? "in",
          protocol: rule.protocol ?? "tcp",
          port: rule.port ? String(rule.port) : "any",
          description: rule.description ?? "",
          source_ips: rule.source_ips,
        }));

      const newRule = {
        direction: "in",
        source_ips: [`${publicIp}/32`],
        protocol: "tcp",
        port: String(port),
        description: "Access for user " + user,
      };

      const updatedRules = [...normalizedRules, newRule];
      console.log("Updated rules:", updatedRules);

      const response: AxiosResponse = yield callApiHetznerServicePost(
        `${firewallId}/actions/set_rules`,
        { rules: updatedRules }
      );

      if (response.status === 201 || response.status === 200) {
        console.log("Firewall rules updated successfully:", response.data);
        if (duration) {
          this.scheduleRuleRemoval(firewallId, publicIp, duration);
        }
      } else {
        this.onSetErrors("Failed to submit firewall rules");
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as AxiosError;
        this.onSetErrors(axiosErr.response?.data || "Unknown error occurred");
      } else if (err instanceof Error) {
        this.onSetErrors(err.message || "Unknown error occurred");
      }
    }
  }

  *startFirewallProcess(selectedFirewalls: FirewallSelection[]) {
    try {
      this.onSetErrors(null);
      const fw = selectedFirewalls[0];

      const payload = {
        firewallId: fw.id,
        publicIp: fw.publicIp,
        duration: fw.duration,
        requestedBy: fw.requestedBy,
        approved: false,
      };

      const response: AxiosResponse = yield callApiBpmnServicePost(
        `${ENV.NEXT_PUBLIC_BPMN_GET_PROCESS_DEFINITION}/key/FirewallRequestStatusUpdate/start`,
        payload
      );

      if (response.status === 201 || response.status === 200) {
        console.log("Requests submitted successfully:", response.data);
        yield this.getRequests({});
      } else {
        this.onSetErrors("Failed to submit firewall requests");
      }
    } catch (err: any) {
      if (err.response?.data) {
        this.onSetErrors(err.response.data);
      } else {
        this.onSetErrors(err.message || "Unknown error occurred");
      }
    }
  }

  *completeUserTask(taskId: string, approved: boolean) {
    try {
      this.loadingUserTask = true;
      this.onSetErrors(null);
      const payload = {
        variables: {
          approved: {
            value: approved,
            type: "Boolean",
          },
        },
      };
      const response: AxiosResponse = yield callApiBpmnServicePost(
        `${ENV.NEXT_PUBLIC_BPMN_GET_TASK}/${taskId}/complete`,
        payload
      );

      if (response.status === 200) {
        console.log("User task completed successfully");
      }

      this.loadingUserTask = false;
    } catch (err: any) {
      this.loadingUserTask = false;
      if (err.response?.status === 401) {
        try {
          yield callApiGet(ENV.NEXT_PUBLIC_LOGOUT);
        } catch {}
      } else if (err.response?.data) {
        this.onSetErrors(err.response.data);
      } else {
        this.onSetErrors(err.message);
      }
    }
  }

  *getProcessInstances(payload: any) {
    try {
      this.onSetErrors(null);
      this.loadingProcessInstances = true;
      const queryString = qs.stringify(payload, { encode: true });

      const response: AxiosResponse = yield callApiBpmnServiceGet(
        `${ENV.NEXT_PUBLIC_BPMN_GET_PROCESS_INSTANCE}/documents/paging?${queryString}`
      );

      // http://localhost:63108/api/process-instance/documents/paging?draw=1&start=0&length=28&
      // collection=WorkflowInstance&columns[0][name]=_id&columns[0][include]=true&columns[1][name]=Name&
      // columns[1][include]=true&columns[2][name]=Status&columns[2][include]=true&columns[3][name]=WorkflowData&
      // columns[3][include]=true&columns[4][name]=Name&columns[4][searchable]=true&columns[4][search][value]=FirewallRequestStatusUpdate&
      // columns[4][search][regex]=false&order[0][column]=0&order[0][dir]=desc

      if (response.status === 200) {
        this.loadingProcessInstances = false;
        this.processInstances = response.data.results || [];
        this.processInfo = response.data.info;
      }
    } catch (err: any) {
      this.loadingProcessInstances = false;
      if (err.response && err.response.data) {
        if (err.response.status === 401) {
          try {
            yield callApiGet(ENV.NEXT_PUBLIC_LOGOUT);
          } catch (error) {}
          // clearStorage();
          // signOut();
        } else {
          this.onSetErrors(err.response.data);
        }
      } else if (err.message) {
        this.onSetErrors(err.message);
      }
    }
  }

  *getProcessInstanceById(id: string) {
    try {
      this.onSetErrors(null);
      this.loadingProcessInstance = true;

      const response: AxiosResponse = yield callApiBpmnServiceGet(
        `${ENV.NEXT_PUBLIC_BPMN_GET_PROCESS_INSTANCE}/${id}`
      );

      if (response.status === 200) {
        this.loadingProcessInstance = false;
        this.processInstance = response.data;
      }
    } catch (err: any) {
      this.loadingProcessInstance = false;
      if (err.response && err.response.data) {
        if (err.response.status === 401) {
          try {
            yield callApiGet(ENV.NEXT_PUBLIC_LOGOUT);
          } catch (error) {}
          // clearStorage();
          // signOut();
        } else {
          this.onSetErrors(err.response.data);
        }
      } else if (err.message) {
        this.onSetErrors(err.message);
      }
    }
  }

  *getRequests(payload: any) {
    try {
      this.onSetErrors(null);
      this.loadingRequests = true;

      const params = new URLSearchParams();

      if (payload.filters?.requestStatusId) {
        const statusString = statusMap[payload.filters.requestStatusId];
        if (statusString) {
          params.append("status", statusString);
        }
      }
      if (payload.page) {
        params.append("pageSize", String(payload.page.pageSize));
        params.append("pageNumber", String(payload.page.pageNumber));
      }

      const url = `${
        ENV.NEXT_PUBLIC_GET_FIREWALL_REQUESTS
      }?${params.toString()}`;

      const response: AxiosResponse = yield callApiGet(url);
      if (response.status === 200) {
        this.loadingRequests = false;
        this.requests = response.data;
      }
    } catch (err: any) {
      this.loadingRequests = false;
      if (err.response && err.response.data) {
        if (err.response.status === 401) {
          try {
            yield callApiGet(ENV.NEXT_PUBLIC_LOGOUT);
          } catch (error) {}
          // clearStorage();
          // signOut();
        } else {
          this.onSetErrors(err.response.data);
        }
      } else if (err.message) {
        this.onSetErrors(err.message);
      }
    }
  }

  *getFirewalls() {
    try {
      this.onSetErrors(null);
      this.loadingFirewalls = true;
      const response: AxiosResponse = yield callApiGet(
        ENV.NEXT_PUBLIC_GET_FIREWALLS
      );

      if (response.status === 200) {
        this.loadingFirewalls = false;
        this.firewalls = response.data;
      }
    } catch (err: any) {
      this.loadingFirewalls = false;
      if (err.response && err.response.data) {
        if (err.response.status === 401) {
          try {
            yield callApiGet(ENV.NEXT_PUBLIC_LOGOUT);
          } catch (error) {}
          // clearStorage();
          // signOut();
        } else {
          this.onSetErrors(err.response.data);
        }
      } else if (err.message) {
        this.onSetErrors(err.message);
      }
    }
  }
  *postFirewallRequests(selectedFirewalls: FirewallSelection[]) {
    try {
      this.onSetErrors(null);
      const fw = selectedFirewalls[0];

      const payload = {
        FirewallId: fw.id,
        PublicIp: fw.publicIp,
        Duration: fw.duration,
        RequestedBy: fw.requestedBy,
        CreatedAt: fw.created ?? new Date().toISOString(),
        Name: fw.name ?? "",
        Labels: fw.labels ?? "",
      };
      const response: AxiosResponse = yield callApiPost(
        ENV.NEXT_PUBLIC_CREATE_FIREWALL_REQUEST,
        payload
      );

      if (response.status === 201 || response.status === 200) {
        console.log("Requests submitted successfully:", response.data);
        yield this.getRequests({});
      } else {
        this.onSetErrors("Failed to submit firewall requests");
      }
    } catch (err: any) {
      if (err.response?.data) {
        this.onSetErrors(err.response.data);
      } else {
        this.onSetErrors(err.message || "Unknown error occurred");
      }
    }
  }
  *updateRequestStatus(id: string, action: "approve" | "reject") {
    try {
      const status = action === "approve" ? "Approved" : "Rejected";

      const requestBody = {
        requestId: id,
        status,
      };
      const url = `${ENV.NEXT_PUBLIC_EDIT_FIREWALL_REQUEST}`;
      const res: AxiosResponse = yield callApiPut(url, requestBody);

      if (res.status === 204) {
        yield this.getRequests({});
      } else {
        this.onSetErrors(`Failed to ${action} request`);
      }
    } catch (err: any) {
      this.onSetErrors(err.response?.data || err.message);
    }
  }
  *getUser(azureAdId: string) {
    try {
      this.onSetErrors(null);
      this.loadingUser = true;
      const response: AxiosResponse = yield callApiGet(
        `${ENV.NEXT_PUBLIC_GET_USER}/${azureAdId}`
      );

      if (response.status === 200) {
        this.loadingUser = false;
        this.user = response.data;
      }
    } catch (err: any) {
      this.loadingUser = false;

      if (err.response && err.response.data) {
        if (err.response.status === 401) {
          try {
            yield callApiGet(ENV.NEXT_PUBLIC_LOGOUT);
          } catch (error) {}
          //clearStorage();
          signOut();
        } else if (err.response.status === 404) {
          // User not found, create a new user
          try {
            this.loadingUser = true;
            const createResponse: AxiosResponse = yield callApiPost(
              ENV.NEXT_PUBLIC_CREATE_USER,
              { userDto: { azureAdId } }
            );

            if (
              createResponse.status === 200 ||
              createResponse.status === 201
            ) {
              this.loadingUser = false;
              this.user = createResponse.data;
            }
          } catch (createErr: any) {
            this.loadingUser = false;
            this.onSetErrors(createErr.response?.data || createErr.message);
          }
        } else {
          this.onSetErrors(err.response.data);
        }
      } else if (err.message) {
        this.onSetErrors(err.message);
      }
    }
  }
  *createUserWithData(userData: UserDTO) {
    try {
      this.onSetErrors(null);
      this.loadingUser = true;

      const response: AxiosResponse = yield callApiPost(
        ENV.NEXT_PUBLIC_CREATE_USER,
        { userDto: userData }
      );

      if (response.status === 200 || response.status === 201) {
        this.user = response.data;
        console.log("User created successfully:", response.data);
      } else {
        this.onSetErrors("Failed to create user");
      }

      this.loadingUser = false;
    } catch (err: any) {
      this.loadingUser = false;

      if (err.response && err.response.data) {
        this.onSetErrors(err.response.data);
      } else if (err.message) {
        this.onSetErrors(err.message);
      } else {
        this.onSetErrors("Unknown error occurred while creating user");
      }
    }
  }
}
