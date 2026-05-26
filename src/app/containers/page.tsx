import AppShell from "@/components/layout/app-shell";
import { EmptyState, ErrorState } from "@/components/dashboard/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { listContainers, listStacks } from "@/lib/integrations/portainer";

export const dynamic = "force-dynamic";

export default async function ContainersPage() {
  const [containersResult, stacksResult] = await Promise.all([
    listContainers()
      .then((containers) => ({ containers, error: "" }))
      .catch((error: Error) => ({ containers: [], error: error.message })),
    listStacks()
      .then((stacks) => ({ stacks, error: "" }))
      .catch((error: Error) => ({ stacks: [], error: error.message })),
  ]);

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Portainer</p>
            <h1 className="text-2xl font-semibold tracking-tight">Containers</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline">{containersResult.containers.length} containers</Badge>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Containers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {containersResult.error ? <ErrorState message={containersResult.error} /> : null}
              {!containersResult.error && containersResult.containers.length === 0 ? (
                <EmptyState message="Aucun container Portainer trouve." />
              ) : null}
              {containersResult.containers.map((container, index) => (
                <div key={container.Id} className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {container.Names?.[0]?.replace(/^\//, "") ?? container.Id.slice(0, 12)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {container.Image}
                      </p>
                    </div>
                    <Badge
                      variant={container.State === "running" ? "secondary" : "outline"}
                    >
                      {container.Status ?? container.State}
                    </Badge>
                  </div>
                  {index < containersResult.containers.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stacks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stacksResult.error ? <ErrorState message={stacksResult.error} /> : null}
              {!stacksResult.error && stacksResult.stacks.length === 0 ? (
                <EmptyState message="Aucune stack Portainer trouvee." />
              ) : null}
              {stacksResult.stacks.map((stack, index) => (
                <div key={stack.Id} className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{stack.Name}</p>
                      <p className="text-sm text-muted-foreground">
                        Endpoint {stack.EndpointId ?? "-"}
                      </p>
                    </div>
                    <Badge variant="outline">Stack</Badge>
                  </div>
                  {index < stacksResult.stacks.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
