import { ENV } from "@/env";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { getSession } from "next-auth/react";
import { Session } from "next-auth";
import md5 from "md5";

const API_ENDPOINT = ENV.NEXT_PUBLIC_API_ENDPOINT;
const HETZNER_TOKEN = ENV.NEXT_PUBLIC_HETZNER_API_TOKEN;

export async function callApiGet(path: string): Promise<AxiosResponse> {
  const session: Session | null = await getSession();

  // Extract query parameters if present
  const [basePath, queryString] = path.split("?");
  let hashPayload: any = {};

  // Handle path parameters (split and process)
  const pathSegments = basePath.split("/").filter((segment) => segment !== ""); // Remove empty parts
  if (pathSegments.length > 1) {
    // Assuming '/xyz/{param}' structure
    hashPayload["pathParams"] = pathSegments.slice(1).join("/");
  }

  // Handle query parameters if present
  if (queryString) {
    const params = new URLSearchParams(queryString);
    params.forEach((value, key) => {
      hashPayload[key] = value;
    });
  }

  const hash = md5(JSON.stringify(hashPayload));

  const headers = {
    Authorization:
      session && session.accessToken ? `Bearer ${session.accessToken}` : "",
    "X-Request-Hash": hash,
    "Accept-Language": localStorage.getItem("lang") || "en-US",
  };
  return await axios.get(`${API_ENDPOINT}/api/${path}`, { headers: headers });
}

export async function callApiPost(
  path?: string,
  payload?: any,
  onUploadProgress?: any
): Promise<AxiosResponse> {
  const session: Session | null = await getSession();

  if (payload) {
    delete payload["hash"];
    const hash = md5(JSON.stringify(payload));
    payload["hash"] = hash;
  }

  const config: AxiosRequestConfig = {
    headers: {
      Authorization:
        session && session.accessToken ? `Bearer ${session.accessToken}` : "",
      "Content-Type": onUploadProgress
        ? "multipart/form-data"
        : "application/json",
      "Accept-Language": localStorage.getItem("lang") || "en-US",
    },
    onUploadProgress: onUploadProgress,
  };

  return await axios.post(`${API_ENDPOINT}/api/${path}`, payload, config);
}

export async function callApiPut(
  path: string,
  payload: any,
  onUploadProgress?: any
): Promise<AxiosResponse> {
  const session: Session | null = await getSession();
  if (payload) {
    // add secret prop
    delete payload["hash"];
    payload["poweredBy"] = "PCES";
    const hash = md5(JSON.stringify(payload));
    // remove secret prop
    delete payload["poweredBy"];
    payload["hash"] = hash;
  }

  const config: AxiosRequestConfig = {
    headers: {
      Authorization:
        session && session.accessToken ? `Bearer ${session.accessToken}` : "",
      "Content-Type": onUploadProgress
        ? "multipart/form-data"
        : "application/json",
    },
    onUploadProgress: onUploadProgress,
  };

  return await axios.put(`${API_ENDPOINT}/api/${path}`, payload, config);
}

//BPMN

export async function callApiBpmnServiceGet(
  path: string
): Promise<AxiosResponse> {
  const session: Session | null = await getSession();
  const headers = {
    Authorization:
      session && session.accessToken ? `Bearer ${session.accessToken}` : "",
  };
  return await axios.get(`${ENV.NEXT_PUBLIC_BPMNSERVICE_URL}/api/${path}`, {
    headers: headers,
  });
}

export async function callApiBpmnServicePost(
  path: string,
  payload: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse> {
  const session: Session | null = await getSession();
  const defaultHeaders = {
    Authorization:
      session && session.accessToken ? `Bearer ${session.accessToken}` : "",
    "Content-Type": "application/json",
  };

  return await axios.post(
    `${ENV.NEXT_PUBLIC_BPMNSERVICE_URL}/api/${path}`,
    payload,
    {
      headers: {
        ...defaultHeaders,
        ...(config?.headers || {}),
      },
      ...config,
    }
  );
}

//Hetzner

export async function callApiHetznerServiceGet(
  path: string
): Promise<AxiosResponse> {
  //const session: Session | null = await getSession();
  const token = ENV.NEXT_PUBLIC_HETZNER_API_TOKEN;
  const headers = {
    Authorization: `Bearer ${HETZNER_TOKEN}`,
  };
  return await axios.get(`${ENV.NEXT_PUBLIC_HETZNER_FIREWALLS}/${path}`, {
    headers: headers,
  });
}

export async function callApiHetznerServicePost(
  path: string,
  payload: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse> {
   console.log("token: ", HETZNER_TOKEN);
  // const session: Session | null = await getSession();
  const defaultHeaders = {
    Authorization: `Bearer ${HETZNER_TOKEN}`,
    "Content-Type": "application/json",
  };

  return await axios.post(
    `${ENV.NEXT_PUBLIC_HETZNER_FIREWALLS}/${path}`,
    payload,
    {
      headers: {
        ...defaultHeaders,
        ...(config?.headers || {}),
      },
      ...config,
    }
  );
}
