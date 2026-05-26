import "server-only";

import { requireEnv } from "@/lib/env";

type CloudflareRecord = {
  id: string;
  name: string;
  type: string;
  content: string;
  proxied?: boolean;
  ttl?: number;
};

type CloudflareResponse<T> = {
  success: boolean;
  result: T;
  errors?: Array<{ message: string }>;
};

function cloudflareConfig() {
  return requireEnv([
    "CLOUDFLARE_API_TOKEN",
    "CLOUDFLARE_ZONE_ID",
    "VPS_PUBLIC_IP",
  ]);
}

async function cfFetch<T>(path: string, init?: RequestInit) {
  const env = cloudflareConfig();
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}${path}`,
    {
      ...init,
      headers: {
        Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
        "Content-Type": "application/json",
        ...init?.headers,
      },
      cache: "no-store",
    }
  );

  const payload = (await response.json()) as CloudflareResponse<T>;
  if (!response.ok || !payload.success) {
    const message =
      payload.errors?.map((error) => error.message).join(", ") ||
      `Cloudflare HTTP ${response.status}`;
    throw new Error(message);
  }

  return payload.result;
}

export async function listDnsRecords() {
  return cfFetch<CloudflareRecord[]>("/dns_records?type=A&per_page=100");
}

export async function upsertARecord(name: string) {
  const env = cloudflareConfig();
  const records = await cfFetch<CloudflareRecord[]>(
    `/dns_records?type=A&name=${encodeURIComponent(name)}&per_page=1`
  );

  const body = JSON.stringify({
    type: "A",
    name,
    content: env.VPS_PUBLIC_IP,
    proxied: true,
    ttl: 1,
  });

  if (records[0]) {
    return cfFetch<CloudflareRecord>(`/dns_records/${records[0].id}`, {
      method: "PUT",
      body,
    });
  }

  return cfFetch<CloudflareRecord>("/dns_records", {
    method: "POST",
    body,
  });
}

export async function deleteDnsRecord(id: string) {
  return cfFetch<{ id: string }>(`/dns_records/${id}`, { method: "DELETE" });
}
