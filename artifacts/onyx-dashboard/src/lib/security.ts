/**
 * HTTPS-only enforcement.
 *
 * - `isSecureContext()` trusts the browser flag (true for HTTPS or localhost).
 * - `secureFetch` blocks all network requests when the page is not served
 *   over a secure context.
 */

export function isSecureContext(): boolean {
  if (typeof window === "undefined") return true;
  if (typeof window.isSecureContext === "boolean") return window.isSecureContext;
  const proto = window.location?.protocol;
  const host = window.location?.hostname || "";
  return (
    proto === "https:" ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "[::1]"
  );
}

export function getSecurityWarning(): string | null {
  if (isSecureContext()) return null;
  return "Соединение не защищено. Приложение работает только по HTTPS — сетевые запросы заблокированы.";
}

export class InsecureContextError extends Error {
  constructor() {
    super("Сетевые запросы заблокированы: соединение не использует HTTPS.");
    this.name = "InsecureContextError";
  }
}

export async function secureFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (!isSecureContext()) throw new InsecureContextError();
  return fetch(input, init);
}

let installed = false;
export function installSecureFetchGuard(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;
  const original = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (!isSecureContext()) {
      return Promise.reject(new InsecureContextError());
    }
    return original(input, init);
  };
}
