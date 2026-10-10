export function isAiDocumentProcessingApproved(env = process.env) {
  return env.AI_DOCUMENT_PROCESSING_APPROVED === "true";
}
