import AppShell from "@/components/layout/app-shell";
import AppCreateForm from "@/components/apps/app-create-form";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AppsPage() {
  const deployments = await prisma.appDeployment.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Déploiements</p>
            <h1 className="text-2xl font-semibold tracking-tight">Apps</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline">{deployments.length} apps</Badge>
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
              <AppCreateForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dernières apps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              {deployments.length === 0 ? (
                <EmptyState message="Aucun deploiement local enregistre." />
              ) : null}
              {deployments.map((deployment, index) => (
                <div key={deployment.id} className="space-y-4">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{deployment.name}</p>
                    <p>{deployment.status} via Portainer/NPM</p>
                  </div>
                  {index < deployments.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
