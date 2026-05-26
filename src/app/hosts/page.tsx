import AppShell from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const hosts = [
  { name: "vps-01", location: "EU-West", status: "Online" },
  { name: "vps-02", location: "EU-West", status: "Online" },
  { name: "edge-01", location: "FR-Paris", status: "Maintenance" },
];

export default function HostsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Inventaire</p>
            <h1 className="text-2xl font-semibold tracking-tight">Hosts</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline">3 hosts</Badge>
            <Button>Ajouter un host</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Disponibilité</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hosts.map((host, index) => (
              <div key={host.name} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{host.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {host.location}
                    </p>
                  </div>
                  <Badge
                    variant={
                      host.status === "Online" ? "secondary" : "outline"
                    }
                  >
                    {host.status}
                  </Badge>
                </div>
                {index < hosts.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
