import AppShell from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const containers = [
  { name: "api-gateway", status: "Running", image: "nginx:latest" },
  { name: "postgres-db", status: "Running", image: "postgres:16" },
  { name: "redis-cache", status: "Stopped", image: "redis:7" },
];

export default function ContainersPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Portainer</p>
            <h1 className="text-2xl font-semibold tracking-tight">Containers</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline">3 containers</Badge>
            <Button>Déployer un container</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Containers actifs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {containers.map((container, index) => (
              <div key={container.name} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{container.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {container.image}
                    </p>
                  </div>
                  <Badge
                    variant={
                      container.status === "Running" ? "secondary" : "outline"
                    }
                  >
                    {container.status}
                  </Badge>
                </div>
                {index < containers.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
