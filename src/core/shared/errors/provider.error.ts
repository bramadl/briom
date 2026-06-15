import { DomainError } from "@briom/drimion";

export class ProviderError extends DomainError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, { context: "Provider", cause: options?.cause });
  }
}