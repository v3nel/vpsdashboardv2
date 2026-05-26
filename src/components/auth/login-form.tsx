"use client";

import HCaptcha from "@hcaptcha/react-hcaptcha";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LoginFormProps = {
  siteKey?: string;
};

export default function LoginForm({ siteKey }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const captchaRef = useRef<HCaptcha>(null);
  const [captchaToken, setCaptchaToken] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = new FormData(event.currentTarget);
    if (!captchaToken) {
      setError("Valide le hCaptcha avant de te connecter.");
      return;
    }

    setPending(true);
    const result = await signIn("credentials", {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      hcaptchaToken: captchaToken,
      redirect: false,
      callbackUrl: searchParams.get("callbackUrl") ?? "/",
    });
    setPending(false);

    if (!result?.ok) {
      captchaRef.current?.resetCaptcha();
      setCaptchaToken("");
      setError("Identifiants ou hCaptcha invalides.");
      return;
    }

    router.replace(result.url ?? "/");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="password">
          Mot de passe
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {siteKey ? (
        <HCaptcha
          ref={captchaRef}
          sitekey={siteKey}
          onVerify={setCaptchaToken}
          onExpire={() => setCaptchaToken("")}
        />
      ) : (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          HCAPTCHA_SITE_KEY manque dans l&apos;environnement.
        </p>
      )}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button className="w-full" disabled={pending || !siteKey}>
        {pending ? "Connexion..." : "Se connecter"}
      </Button>
    </form>
  );
}
