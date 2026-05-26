"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { analyzeCompose } from "@/lib/compose";
import { writeAudit } from "@/lib/audit";
import {
  deleteDnsRecord,
  getApexTarget,
  upsertARecord,
  upsertCnameRecord,
} from "@/lib/integrations/cloudflare";
import { createProxyHost } from "@/lib/integrations/npm";
import { deployStackFromCompose } from "@/lib/integrations/portainer";
import { prisma } from "@/lib/prisma";

export type ActionState = {
  ok: boolean;
  message: string;
};

export async function createDnsRecordAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return { ok: false, message: "Domaine requis." };
  }

  try {
    await upsertARecord(name);
    await writeAudit({
      action: "cloudflare.dns.upsert",
      target: name,
      status: "success",
      userId: user.id,
    });
    revalidatePath("/domains");
    return { ok: true, message: "Record DNS cree ou mis a jour." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur Cloudflare";
    await writeAudit({
      action: "cloudflare.dns.upsert",
      target: name,
      status: "error",
      message,
      userId: user.id,
    });
    return { ok: false, message };
  }
}

export async function deleteDnsRecordAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "");

  if (!id) {
    return;
  }

  await deleteDnsRecord(id);
  await writeAudit({
    action: "cloudflare.dns.delete",
    target: name || id,
    status: "success",
    userId: user.id,
  });
  revalidatePath("/domains");
}

export async function createProxyHostAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const domain = String(formData.get("domain") ?? "").trim();
  const forwardHost = String(formData.get("forwardHost") ?? "").trim();
  const forwardPort = Number(formData.get("forwardPort"));

  if (!domain || !forwardHost || !Number.isFinite(forwardPort)) {
    return { ok: false, message: "Domaine, host cible et port sont requis." };
  }

  try {
    await createProxyHost({ domain, forwardHost, forwardPort });
    await writeAudit({
      action: "npm.proxy.create",
      target: domain,
      status: "success",
      userId: user.id,
    });
    revalidatePath("/hosts");
    return { ok: true, message: "Proxy host cree avec SSL HTTP-01." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur NPM";
    await writeAudit({
      action: "npm.proxy.create",
      target: domain,
      status: "error",
      message,
      userId: user.id,
    });
    return { ok: false, message };
  }
}

export async function deployAppAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const stackName = String(formData.get("stackName") ?? "").trim();
  const compose = String(formData.get("compose") ?? "");
  const domainsJson = String(formData.get("domainsJson") ?? "[]");

  if (!stackName || !compose) {
    return { ok: false, message: "Stack et compose requis." };
  }

  let domains: Array<{
    domain: string;
    serviceName: string;
    internalPort: number;
  }>;

  try {
    domains = JSON.parse(domainsJson);
  } catch {
    return { ok: false, message: "Plan de domaines invalide." };
  }

  const preview = analyzeCompose(compose);
  if (preview.errors.length > 0) {
    return { ok: false, message: preview.errors.join(", ") };
  }

  const resolvedDomains = domains.length > 0 ? domains : preview.exposures;
  const apexTarget = getApexTarget();

  try {
    await upsertARecord(apexTarget);

    for (const exposure of resolvedDomains) {
      await upsertCnameRecord(exposure.domain, apexTarget);
    }

    await deployStackFromCompose(stackName, preview.transformedCompose);

    for (const exposure of resolvedDomains) {
      await createProxyHost({
        domain: exposure.domain,
        forwardHost: exposure.serviceName,
        forwardPort: exposure.internalPort,
      });
    }

    await prisma.appDeployment.create({
      data: {
        name: stackName,
        status: "deployed",
        stackName,
        originalCompose: compose,
        transformedCompose: preview.transformedCompose,
        domainsJson: JSON.stringify(resolvedDomains),
        userId: user.id,
      },
    });

    await writeAudit({
      action: "app.deploy",
      target: stackName,
      status: "success",
      metadata: resolvedDomains,
      userId: user.id,
    });

    revalidatePath("/apps");
    revalidatePath("/");
    return { ok: true, message: "App deployee via Cloudflare, Portainer et NPM." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur de deploiement";
    await writeAudit({
      action: "app.deploy",
      target: stackName,
      status: "error",
      message,
      metadata: resolvedDomains,
      userId: user.id,
    });
    return { ok: false, message };
  }
}
