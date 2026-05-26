import AppShell from "@/components/layout/app-shell";
import { createProxyHostAction } from "@/app/actions";
import { ActionForm } from "@/components/dashboard/action-message";
import { EmptyState, ErrorState } from "@/components/dashboard/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { listProxyHosts } from "@/lib/integrations/npm";

export const dynamic = "force-dynamic";

export default async function HostsPage() {
  const result = await listProxyHosts()
    .then((hosts) => ({ hosts, error: "" }))
    .catch((error: Error) => ({ hosts: [], error: error.message }));

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Inventaire</p>
            <h1 className="text-2xl font-semibold tracking-tight">Hosts</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline">{result.hosts.length} hosts</Badge>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Proxy hosts NPM</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.error ? <ErrorState message={result.error} /> : null}
              {!result.error && result.hosts.length === 0 ? (
                <EmptyState message="Aucun proxy host NPM trouve." />
              ) : null}
              {result.hosts.map((host, index) => (
                <div key={host.id} className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{host.domain_names.join(", ")}</p>
                      <p className="text-sm text-muted-foreground">
                        {host.forward_host}:{host.forward_port}
                      </p>
                    </div>
                    <Badge variant={host.enabled ? "secondary" : "outline"}>
                      {host.enabled ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                  {index < result.hosts.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ajouter un proxy</CardTitle>
            </CardHeader>
            <CardContent>
              <ActionForm action={createProxyHostAction} submitLabel="Creer le proxy">
                <Input name="domain" placeholder="app.example.com" required />
                <Input name="forwardHost" placeholder="service docker" required />
                <Input name="forwardPort" type="number" placeholder="3000" required />
              </ActionForm>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
