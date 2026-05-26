import AppShell from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const domains = [
  { name: "example.com", status: "Actif", provider: "Cloudflare" },
  { name: "api.example.com", status: "Actif", provider: "Cloudflare" },
  { name: "staging.example.com", status: "En attente", provider: "Cloudflare" },
];

export default function DomainsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Cloudflare</p>
            <h1 className="text-2xl font-semibold tracking-tight">Domaines</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline">3 domaines</Badge>
            <Button>Ajouter un domaine</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Vue d&apos;ensemble</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {domains.map((domain, index) => (
              <div key={domain.name} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{domain.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {domain.provider}
                    </p>
                  </div>
                  <Badge
                    variant={domain.status === "Actif" ? "secondary" : "outline"}
                  >
                    {domain.status}
                  </Badge>
                </div>
                {index < domains.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
