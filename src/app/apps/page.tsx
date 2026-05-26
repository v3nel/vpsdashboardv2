import AppShell from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function AppsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Déploiements</p>
            <h1 className="text-2xl font-semibold tracking-tight">Apps</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline">2 apps</Badge>
            <Button>Créer une app</Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Créer une app</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Colle un docker-compose ou charge un fichier pour préparer un
                déploiement avec proxy et SSL.
              </p>
              <Input
                type="file"
                accept=".yml,.yaml"
                className="cursor-pointer"
              />
              <Separator />
              <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                Zone de collage du docker-compose (bientôt disponible).
              </div>
              <Button className="w-full">Analyser le compose</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dernières apps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="space-y-1">
                <p className="font-medium text-foreground">blog-stack</p>
                <p>Déployée via Portainer</p>
              </div>
              <Separator />
              <div className="space-y-1">
                <p className="font-medium text-foreground">api-stack</p>
                <p>Proxy géré par NPM</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
