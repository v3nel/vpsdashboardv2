import AppShell from "@/components/layout/app-shell";
import { createDnsRecordAction, deleteDnsRecordAction } from "@/app/actions";
import { ActionForm } from "@/components/dashboard/action-message";
import { EmptyState, ErrorState } from "@/components/dashboard/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { getApexTarget, listDnsRecords } from "@/lib/integrations/cloudflare";

export const dynamic = "force-dynamic";

export default async function DomainsPage() {
  const result = await listDnsRecords()
    .then((records) => ({ records, error: "" }))
    .catch((error: Error) => ({ records: [], error: error.message }));
  const apexTarget = getApexTarget();
  const aRecords = result.records.filter((record) => record.type === "A");
  const cnameRecords = result.records.filter((record) => record.type === "CNAME");

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Cloudflare</p>
            <h1 className="text-2xl font-semibold tracking-tight">Domaines</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline">{aRecords.length} A</Badge>
            <Badge variant="outline">{cnameRecords.length} CNAME</Badge>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Vue d&apos;ensemble</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.error ? <ErrorState message={result.error} /> : null}
              {!result.error && result.records.length === 0 ? (
                <EmptyState message="Aucun record DNS Cloudflare trouve." />
              ) : null}
              {result.records.map((record, index) => (
                <div key={record.id} className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{record.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {record.type === "CNAME"
                          ? `CNAME ${record.content === apexTarget ? "@" : record.content}`
                          : `${record.type} ${record.content}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{record.type}</Badge>
                      <Badge variant={record.proxied ? "secondary" : "outline"}>
                        {record.proxied ? "Proxy CF" : "DNS only"}
                      </Badge>
                      <form action={deleteDnsRecordAction}>
                        <input type="hidden" name="id" value={record.id} />
                        <input type="hidden" name="name" value={record.name} />
                        <Button type="submit" variant="destructive" size="sm">
                          Supprimer
                        </Button>
                      </form>
                    </div>
                  </div>
                  {index < result.records.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ajouter un domaine</CardTitle>
            </CardHeader>
            <CardContent>
              <ActionForm action={createDnsRecordAction} submitLabel="Creer le record A">
                <Input name="name" placeholder="app.example.com" required />
              </ActionForm>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
