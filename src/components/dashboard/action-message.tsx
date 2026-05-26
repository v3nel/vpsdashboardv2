"use client";

import type { ReactNode } from "react";
import { useActionState } from "react";

import type { ActionState } from "@/app/actions";
import { Button } from "@/components/ui/button";

const initialState: ActionState = { ok: false, message: "" };

export function ActionForm({
  action,
  children,
  submitLabel,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  children: ReactNode;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-3">
      {children}
      {state.message ? (
        <p className={state.ok ? "text-sm text-emerald-700" : "text-sm text-destructive"}>
          {state.message}
        </p>
      ) : null}
      <Button disabled={pending} className="w-full">
        {pending ? "En cours..." : submitLabel}
      </Button>
    </form>
  );
}
