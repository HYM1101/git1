export interface WorkflowPayload {
  opinion?: string
  reason?: string
  requirement?: string
  changeResponsible?: boolean
  newResponsible?: string
  extendDeadline?: boolean
  newDeadline?: string
  files: File[]
  attachmentDescription?: string
}

export function serializeWorkflowPayload(payload: WorkflowPayload): Record<string, unknown> {
  return {
    ...payload,
    files: payload.files.map(({ name, size, type }) => ({ name, size, type })),
  }
}
