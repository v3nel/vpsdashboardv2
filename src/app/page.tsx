import Link from "next/link";

import AppShell from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/lib/prisma";
import { listDnsRecords } from "@/lib/integrations/cloudflare";
import { listCertificates, listProxyHosts } from "@/lib/integrations/npm";
import { listContainers } from "@/lib/integrations/portainer";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [dns, containers, hosts, certificates, audits] = await Promise.all([
    listDnsRecords().catch(() => []),
    listContainers().catch(() => []),
    listProxyHosts().catch(() => []),
    listCertificates().catch(() => []),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 5 }).catch(() => []),
  ]);

  const stats = [
    { label: "Domaines actifs", value: String(dns.length), note: "Cloudflare" },
    { label: "Containers", value: String(containers.length), note: "Portainer" },
    { label: "Hosts proxy", value: String(hosts.length), note: "NPM" },
    { label: "Certificats SSL", value: String(certificates.length), note: "NPM" },
  ];

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
            <Badge variant="outline">Données live si APIs configurées</Badge>
            <Link className={buttonVariants()} href="/apps">
              Créer une app
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
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
              {audits.length === 0 ? (
                <p>Aucune activité locale enregistrée.</p>
              ) : null}
              {audits.map((audit, index) => (
                <div key={audit.id} className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <span>{audit.action}{audit.target ? `: ${audit.target}` : ""}</span>
                    <Badge variant={audit.status === "success" ? "secondary" : "outline"}>
                      {audit.status}
                    </Badge>
                  </div>
                  {index < audits.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Link className={buttonVariants({ className: "w-full" })} href="/apps">
                Créer une app
              </Link>
              <Link
                className={buttonVariants({ variant: "outline", className: "w-full" })}
                href="/domains"
              >
                Ajouter un domaine
              </Link>
              <Link
                className={buttonVariants({ variant: "outline", className: "w-full" })}
                href="/containers"
              >
                Voir containers
              </Link>
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
