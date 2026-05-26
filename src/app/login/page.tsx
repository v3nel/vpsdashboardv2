import { redirect } from "next/navigation";

import LoginForm from "@/components/auth/login-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <p className="text-sm text-muted-foreground">VPS Ops Dashboard</p>
          <CardTitle>Connexion admin</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm siteKey={process.env.HCAPTCHA_SITE_KEY} />
        </CardContent>
      </Card>
    </main>
  );
}
