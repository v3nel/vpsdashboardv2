import "server-only";

import { requireEnv } from "@/lib/env";

export type NpmProxyHost = {
  id: number;
  domain_names: string[];
  forward_host: string;
  forward_port: number;
  certificate_id?: number;
  enabled?: boolean;
};

export type NpmCertificate = {
  id: number;
  nice_name?: string;
  domain_names?: string[];
  expires_on?: string;
  provider?: string;
};

function npmConfig() {
  return requireEnv(["NPM_URL", "NPM_EMAIL", "NPM_PASSWORD"]);
}

async function npmToken() {
  const env = npmConfig();
  const response = await fetch(`${env.NPM_URL.replace(/\/$/, "")}/api/tokens`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity: env.NPM_EMAIL, secret: env.NPM_PASSWORD }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`NPM login HTTP ${response.status}`);
  }

  const payload = (await response.json()) as { token?: string };
  if (!payload.token) {
    throw new Error("NPM n'a pas renvoye de token");
  }

  return payload.token;
}

async function npmFetch<T>(path: string, init?: RequestInit) {
  const env = npmConfig();
  const token = await npmToken();
  const response = await fetch(`${env.NPM_URL.replace(/\/$/, "")}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `NPM HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function listProxyHosts() {
  return npmFetch<NpmProxyHost[]>("/api/nginx/proxy-hosts");
}

export async function listCertificates() {
  return npmFetch<NpmCertificate[]>("/api/nginx/certificates");
}

export async function createProxyHost(input: {
  domain: string;
  forwardHost: string;
  forwardPort: number;
}) {
  return npmFetch<NpmProxyHost>("/api/nginx/proxy-hosts", {
    method: "POST",
    body: JSON.stringify({
      domain_names: [input.domain],
      forward_scheme: "http",
      forward_host: input.forwardHost,
      forward_port: input.forwardPort,
      certificate_id: "new",
      ssl_forced: true,
      hsts_enabled: true,
      hsts_subdomains: false,
      http2_support: true,
      block_exploits: true,
      allow_websocket_upgrade: true,
      enabled: true,
      meta: {
        letsencrypt_agree: true,
        letsencrypt_email: process.env.NPM_EMAIL,
        dns_challenge: false,
      },
      advanced_config: "",
      locations: [],
      caching_enabled: false,
    }),
  });
}
