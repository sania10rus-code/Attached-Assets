const KEY = "onix_privacy_v1";
export const PRIVACY_POLICY_VERSION = "1.0";

export type PrivacyAcceptance = {
  acceptedAt: string;
  version: string;
  login: string;
};

export function isPolicyAccepted(login: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return false;
    const list = JSON.parse(raw) as PrivacyAcceptance[];
    return list.some((a) => a.login === login && a.version === PRIVACY_POLICY_VERSION);
  } catch {
    return false;
  }
}

export function acceptPolicy(login: string): void {
  if (typeof window === "undefined") return;
  let list: PrivacyAcceptance[] = [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) list = JSON.parse(raw) as PrivacyAcceptance[];
  } catch {
    list = [];
  }
  const filtered = list.filter((a) => a.login !== login);
  filtered.push({
    acceptedAt: new Date().toISOString(),
    version: PRIVACY_POLICY_VERSION,
    login,
  });
  window.localStorage.setItem(KEY, JSON.stringify(filtered));
}

export function revokePolicy(login: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return;
    const list = JSON.parse(raw) as PrivacyAcceptance[];
    window.localStorage.setItem(KEY, JSON.stringify(list.filter((a) => a.login !== login)));
  } catch {
    // ignore
  }
}
