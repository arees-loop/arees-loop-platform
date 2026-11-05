/**
 * Neoleap integration readiness checks.
 *
 * This module intentionally does not initiate charges: the exact bank API
 * contract and credentials must be verified before enabling payments.
 * Never return secret values to the client.
 */
export type GatewayReadiness = {
  provider: "NEOLEAP";
  mode: "disabled" | "sandbox" | "production";
  configured: boolean;
  missing: string[];
};

const REQUIRED = [
  "NEOLEAP_TRANPORTAL_ID",
  "NEOLEAP_TRANPORTAL_PASSWORD",
  "NEOLEAP_RESOURCE_KEY",
  "NEOLEAP_API_BASE_URL",
  "NEOLEAP_INQUIRY_URL",
  "NEOLEAP_CALLBACK_ORIGIN",
] as const;

export function neoleapReadiness(): GatewayReadiness {
  const requested = process.env.NEOLEAP_MODE;
  const mode = requested === "sandbox" || requested === "production" ? requested : "disabled";
  const missing = REQUIRED.filter((name) => !process.env[name]?.trim());
  // A production environment must never be activated by mere presence of keys.
  const enabled = process.env.NEOLEAP_ENABLED === "true";
  return {
    provider: "NEOLEAP",
    mode,
    configured: enabled && mode !== "disabled" && missing.length === 0,
    missing: [...missing, ...(!enabled ? ["NEOLEAP_ENABLED"] : [])],
  };
}

export function assertNeoleapSandboxOnly(): void {
  const readiness = neoleapReadiness();
  if (!readiness.configured || readiness.mode !== "sandbox") {
    throw new Error("Neoleap sandbox integration is not configured");
  }
}
