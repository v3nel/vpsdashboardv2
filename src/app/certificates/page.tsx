import AppShell from "@/components/layout/app-shell";
import { EmptyState, ErrorState } from "@/components/dashboard/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { listCertificates } from "@/lib/integrations/npm";

export const dynamic = "force-dynamic";

export default async function CertificatesPage() {
  const result = await listCertificates()
    .then((certificates) => ({ certificates, error: "" }))
    .catch((error: Error) => ({ certificates: [], error: error.message }));

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
            <Badge variant="outline">{result.certificates.length} certificats</Badge>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Statut des certificats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.error ? <ErrorState message={result.error} /> : null}
            {!result.error && result.certificates.length === 0 ? (
              <EmptyState message="Aucun certificat NPM trouve." />
            ) : null}
            {result.certificates.map((cert, index) => (
              <div key={cert.id} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {cert.nice_name || cert.domain_names?.join(", ") || `Certificat ${cert.id}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Expiration {cert.expires_on ?? "inconnue"}
                    </p>
                  </div>
                  <Badge variant="secondary">{cert.provider ?? "LetsEncrypt"}</Badge>
                </div>
                {index < result.certificates.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
