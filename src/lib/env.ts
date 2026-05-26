import "server-only";

export class MissingEnvError extends Error {
  constructor(keys: string[]) {
    super(`Variables d'environnement manquantes: ${keys.join(", ")}`);
    this.name = "MissingEnvError";
  }
}

export function requireEnv(keys: string[]) {
  const missing = keys.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new MissingEnvError(missing);
  }

  return Object.fromEntries(
    keys.map((key) => [key, process.env[key] as string])
  ) as Record<(typeof keys)[number], string>;
}

export function envStatus(keys: string[]) {
  return keys.map((key) => ({ key, configured: Boolean(process.env[key]) }));
}
