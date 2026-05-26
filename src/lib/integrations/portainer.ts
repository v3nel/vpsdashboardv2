import "server-only";

import { requireEnv } from "@/lib/env";

export type PortainerContainer = {
  Id: string;
  Names?: string[];
  Image?: string;
  State?: string;
  Status?: string;
};

export type PortainerStack = {
  Id: number;
  Name: string;
  Type?: number;
  Status?: number;
  EndpointId?: number;
  CreationDate?: number;
};

function portainerConfig() {
  return requireEnv(["PORTAINER_URL", "PORTAINER_API_KEY", "PORTAINER_ENDPOINT_ID"]);
}

async function portainerFetch<T>(path: string, init?: RequestInit) {
  const env = portainerConfig();
  const response = await fetch(`${env.PORTAINER_URL.replace(/\/$/, "")}${path}`, {
    ...init,
    headers: {
      "X-API-Key": env.PORTAINER_API_KEY,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Portainer HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function listContainers() {
  const env = portainerConfig();
  return portainerFetch<PortainerContainer[]>(
    `/api/endpoints/${env.PORTAINER_ENDPOINT_ID}/docker/containers/json?all=true`
  );
}

export async function listStacks() {
  return portainerFetch<PortainerStack[]>("/api/stacks");
}

export async function deployStackFromCompose(stackName: string, compose: string) {
  const env = portainerConfig();

  return portainerFetch<PortainerStack>(
    `/api/stacks/create/standalone/string?endpointId=${encodeURIComponent(
      env.PORTAINER_ENDPOINT_ID
    )}`,
    {
      method: "POST",
      body: JSON.stringify({
        name: stackName,
        stackFileContent: compose,
      }),
    }
  );
}
