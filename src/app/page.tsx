import AppShell from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Bienvenue</p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Tableau de bord VPS
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline">Dernière synchro: il y a 2 min</Badge>
            <Button>Nouvelle action</Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Domaines actifs", value: "14", note: "Cloudflare" },
            { label: "Containers", value: "23", note: "Portainer" },
            { label: "Hosts", value: "5", note: "Inventaire" },
            { label: "Certificats SSL", value: "12", note: "NPM" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-end justify-between">
                <span className="text-3xl font-semibold">{stat.value}</span>
                <span className="text-xs text-muted-foreground">
                  {stat.note}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Flux d&apos;activité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>proxy.example.com → container api-gateway</span>
                <Badge variant="secondary">OK</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span>Certificat auto-renouvelé: blog.example.com</span>
                <Badge variant="secondary">NPM</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span>Nouvelle image déployée: redis-cache</span>
                <Badge variant="outline">Portainer</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button className="w-full">Créer une app</Button>
              <Button variant="outline" className="w-full">
                Ajouter un domaine
              </Button>
              <Button variant="outline" className="w-full">
                Déployer un container
              </Button>
              <Button variant="ghost" className="w-full">
                Consulter les logs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
