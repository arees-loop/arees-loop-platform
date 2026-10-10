export function publicServiceEligibilityWhere(isStagingProject, productionEligibility) {
  if (isStagingProject) {
    // Catalog rows in Staging intentionally have no production license relation.
    // Project-level SSO and the UI's test-only disclosure keep them non-production.
    return { partner: { status: "ACTIVE" } };
  }

  return productionEligibility;
}
