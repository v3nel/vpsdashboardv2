import "server-only";

import { prisma } from "@/lib/prisma";

type AuditInput = {
  action: string;
  target?: string;
  status: "success" | "error" | "info";
  message?: string;
  metadata?: unknown;
  userId?: string;
};

export async function writeAudit(input: AuditInput) {
  try {
    await prisma.auditLog.create({
      data: {
        action: input.action,
        target: input.target,
        status: input.status,
        message: input.message,
        metadata: input.metadata ? JSON.stringify(input.metadata) : undefined,
        userId: input.userId,
      },
    });
  } catch {
    // Audit logging must not hide the original operational error.
  }
}
