import AppShell from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const certificates = [
  { domain: "example.com", status: "Valide", expiresIn: "57 jours" },
  { domain: "api.example.com", status: "Valide", expiresIn: "21 jours" },
  { domain: "staging.example.com", status: "En attente", expiresIn: "-" },
];

export default function CertificatesPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Nginx Proxy Manager</p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Certificats SSL
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline">12 certificats</Badge>
            <Button>Renouveler</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Statut des certificats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {certificates.map((cert, index) => (
              <div key={cert.domain} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{cert.domain}</p>
                    <p className="text-sm text-muted-foreground">
                      Expire dans {cert.expiresIn}
                    </p>
                  </div>
                  <Badge
                    variant={cert.status === "Valide" ? "secondary" : "outline"}
                  >
                    {cert.status}
                  </Badge>
                </div>
                {index < certificates.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
