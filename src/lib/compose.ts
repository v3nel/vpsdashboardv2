import { parse, stringify } from "yaml";
import { z } from "zod";

const serviceSchema = z
  .object({
    image: z.string().optional(),
    build: z.unknown().optional(),
    ports: z.array(z.union([z.string(), z.number()])).optional(),
    expose: z.array(z.union([z.string(), z.number()])).optional(),
    networks: z.union([z.array(z.string()), z.record(z.string(), z.unknown())]).optional(),
  })
  .passthrough();

const composeSchema = z
  .object({
    name: z.string().optional(),
    services: z.record(z.string(), serviceSchema),
    networks: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

export type ComposeExposure = {
  id: string;
  serviceName: string;
  internalPort: number;
  publishedPort?: number;
  protocol: "tcp" | "udp";
  domain: string;
};

export type ComposePreview = {
  stackName: string;
  originalCompose: string;
  transformedCompose: string;
  exposures: ComposeExposure[];
  errors: string[];
};

function portFromMapping(mapping: string | number) {
  const raw = String(mapping).trim();
  const protocol = raw.endsWith("/udp") ? "udp" : "tcp";
  const withoutProtocol = raw.replace(/\/(tcp|udp)$/i, "");
  const parts = withoutProtocol.split(":");
  const internalPort = Number(parts.at(-1));
  const publishedPort = parts.length > 1 ? Number(parts.at(-2)) : undefined;

  if (!Number.isFinite(internalPort)) {
    return null;
  }

  return {
    internalPort,
    publishedPort: Number.isFinite(publishedPort) ? publishedPort : undefined,
    protocol,
  } as const;
}

function safeStackName(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "app-stack"
  );
}

export function analyzeCompose(
  source: string,
  overrides: Partial<Record<string, string>> = {}
): ComposePreview {
  const errors: string[] = [];
  let document: unknown;

  try {
    document = parse(source);
  } catch (error) {
    return {
      stackName: "app-stack",
      originalCompose: source,
      transformedCompose: "",
      exposures: [],
      errors: [error instanceof Error ? error.message : "YAML invalide"],
    };
  }

  const parsed = composeSchema.safeParse(document);
  if (!parsed.success) {
    return {
      stackName: "app-stack",
      originalCompose: source,
      transformedCompose: "",
      exposures: [],
      errors: parsed.error.issues.map((issue) => issue.message),
    };
  }

  const compose = structuredClone(parsed.data);
  const stackName = safeStackName(compose.name ?? "app-stack");
  const exposures: ComposeExposure[] = [];

  for (const [serviceName, service] of Object.entries(compose.services)) {
    if (!service.ports?.length) {
      continue;
    }

    const exposePorts = new Set(
      (service.expose ?? []).map((port) => String(port).replace(/\/tcp$/i, ""))
    );

    for (const mapping of service.ports) {
      const parsedPort = portFromMapping(mapping);
      if (!parsedPort) {
        errors.push(`${serviceName}: mapping de port invalide (${String(mapping)})`);
        continue;
      }

      exposePorts.add(String(parsedPort.internalPort));
      const id = `${serviceName}:${parsedPort.internalPort}/${parsedPort.protocol}`;
      exposures.push({
        id,
        serviceName,
        internalPort: parsedPort.internalPort,
        publishedPort: parsedPort.publishedPort,
        protocol: parsedPort.protocol,
        domain:
          overrides[id]?.trim() ||
          `${serviceName.replace(/_/g, "-")}.${process.env.NEXT_PUBLIC_DEFAULT_DOMAIN ?? "example.com"}`,
      });
    }

    delete service.ports;
    service.expose = Array.from(exposePorts);

    if (Array.isArray(service.networks)) {
      service.networks = Array.from(new Set([...service.networks, "proxy"]));
    } else if (service.networks && typeof service.networks === "object") {
      service.networks = { ...service.networks, proxy: {} };
    } else {
      service.networks = ["proxy"];
    }
  }

  compose.networks = {
    ...(compose.networks ?? {}),
    proxy: { external: true },
  };

  return {
    stackName,
    originalCompose: source,
    transformedCompose: stringify(compose),
    exposures,
    errors,
  };
}
