"use client";

import { useActionState, useMemo, useState } from "react";

import { deployAppAction, type ActionState } from "@/app/actions";
import { analyzeCompose } from "@/lib/compose";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const initialState: ActionState = { ok: false, message: "" };

const exampleCompose = `name: demo-app
services:
  web:
    image: nginx:latest
    ports:
      - "8080:80"
`;

export default function AppCreateForm() {
  const [compose, setCompose] = useState(exampleCompose);
  const [domains, setDomains] = useState<Record<string, string>>({});
  const [state, formAction, pending] = useActionState(deployAppAction, initialState);
  const preview = useMemo(() => analyzeCompose(compose, domains), [compose, domains]);

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setCompose(await file.text());
  }

  const resolvedDomains = preview.exposures.map((exposure) => ({
    ...exposure,
    domain: domains[exposure.id] ?? exposure.domain,
  }));

  return (
    <div className="space-y-4">
      <Input type="file" accept=".yml,.yaml" onChange={onFileChange} />
      <textarea
        className="min-h-56 w-full rounded-lg border bg-background p-3 font-mono text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        value={compose}
        onChange={(event) => setCompose(event.target.value)}
        spellCheck={false}
      />

      {preview.errors.length > 0 ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {preview.errors.join(", ")}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="mb-3 text-sm font-medium">Mappings publics detectes</p>
            <div className="space-y-3">
              {preview.exposures.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucun port public detecte dans ce compose.
                </p>
              ) : (
                preview.exposures.map((exposure) => (
                  <div
                    key={exposure.id}
                    className="grid gap-2 rounded-lg border bg-background p-3 md:grid-cols-[1fr_1fr]"
                  >
                    <div>
                      <p className="font-medium">{exposure.serviceName}</p>
                      <p className="text-sm text-muted-foreground">
                        {exposure.publishedPort ? `${exposure.publishedPort} -> ` : ""}
                        {exposure.internalPort}/{exposure.protocol}
                      </p>
                    </div>
                    <Input
                      value={domains[exposure.id] ?? exposure.domain}
                      onChange={(event) =>
                        setDomains((current) => ({
                          ...current,
                          [exposure.id]: event.target.value,
                        }))
                      }
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="min-w-0 rounded-lg border bg-background p-3">
              <p className="mb-2 text-sm font-medium">Compose original</p>
              <pre className="max-h-80 overflow-auto text-xs">{preview.originalCompose}</pre>
            </div>
            <div className="min-w-0 rounded-lg border bg-background p-3">
              <p className="mb-2 text-sm font-medium">Compose transforme</p>
              <pre className="max-h-80 overflow-auto text-xs">
                {preview.transformedCompose}
              </pre>
            </div>
          </div>

          <Separator />
          <form action={formAction} className="space-y-3">
            <Input name="stackName" defaultValue={preview.stackName} />
            <input type="hidden" name="compose" value={compose} />
            <input
              type="hidden"
              name="domainsJson"
              value={JSON.stringify(resolvedDomains)}
            />
            {state.message ? (
              <p
                className={
                  state.ok ? "text-sm text-emerald-700" : "text-sm text-destructive"
                }
              >
                {state.message}
              </p>
            ) : null}
            <Button
              className="w-full"
              disabled={pending || preview.exposures.length === 0}
            >
              {pending ? "Deploiement..." : "Confirmer et deployer"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
