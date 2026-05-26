import AppShell from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
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
            <div className="space-y-2">
              <p className="text-sm font-medium">Cloudflare Token</p>
              <Input placeholder="CF_API_TOKEN" disabled />
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium">Portainer URL</p>
              <Input placeholder="https://portainer.local" disabled />
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium">Nginx Proxy Manager URL</p>
              <Input placeholder="https://npm.local" disabled />
            </div>
            <Button className="w-full">Mettre à jour</Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
