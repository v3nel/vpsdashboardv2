import AppShell from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { envStatus } from "@/lib/env";
import { REQUIRED_ENV } from "@/lib/integrations";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const statuses = envStatus([...REQUIRED_ENV, "ADMIN_EMAIL", "ADMIN_PASSWORD"]);

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Configuration</p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Paramètres
            </h1>
          </div>
          <Badge variant="outline">Sécurisé</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Connexions API</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {statuses.map((item, index) => (
              <div key={item.key} className="space-y-4">
                <div className="grid gap-3 md:grid-cols-[220px_1fr_auto] md:items-center">
                  <p className="text-sm font-medium">{item.key}</p>
                  <Input
                    value={item.configured ? "Configure via environnement" : "Manquant"}
                    disabled
                    readOnly
                  />
                  <Badge variant={item.configured ? "secondary" : "outline"}>
                    {item.configured ? "OK" : "A definir"}
                  </Badge>
                </div>
                {index < statuses.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
