const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me";
const SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

const TOKEN_KEY = "vq.agent.gmailToken";

type OAuthToken = { token: string; expiresAt: number };

export type MailSummary = { id: string; from: string; subject: string; snippet: string };

export const readGmailToken = (): OAuthToken | null => {
  const hash = window.location.hash;
  if (hash.includes("access_token=")) {
    const params = new URLSearchParams(hash.slice(1));
    const token = params.get("access_token");
    const expiresIn = Number(params.get("expires_in") ?? "0");
    if (token && expiresIn > 0) {
      const entry: OAuthToken = { token, expiresAt: Date.now() + expiresIn * 1000 };
      window.sessionStorage.setItem(TOKEN_KEY, JSON.stringify(entry));
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      return entry;
    }
  }
  try {
    const raw = window.sessionStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OAuthToken;
    if (parsed.token && parsed.expiresAt > Date.now() + 30_000) return parsed;
  } catch {
    return null;
  }
  window.sessionStorage.removeItem(TOKEN_KEY);
  return null;
};

export const connectGmail = (clientId: string) => {
  const redirect = window.location.origin + window.location.pathname;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirect,
    response_type: "token",
    scope: SCOPE,
    prompt: "consent",
  });
  window.location.assign(`${AUTH_ENDPOINT}?${params.toString()}`);
};

export const disconnectGmail = () => {
  window.sessionStorage.removeItem(TOKEN_KEY);
};

const headerValue = (headers: { name: string; value: string }[], name: string) =>
  headers.find((header) => header.name.toLowerCase() === name)?.value ?? "";

export const fetchRecentMails = async (token: string, count = 20): Promise<MailSummary[]> => {
  const listRes = await fetch(`${GMAIL_API}/messages?maxResults=${count}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (listRes.status === 401 || listRes.status === 403) throw new Error("gmail-auth");
  if (!listRes.ok) throw new Error("gmail-list");
  const listed = (await listRes.json()) as { messages?: { id: string }[] };
  const ids = listed.messages ?? [];
  const mails = await Promise.all(
    ids.map(async ({ id }) => {
      const res = await fetch(
        `${GMAIL_API}/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("gmail-message");
      const data = (await res.json()) as {
        id: string;
        snippet?: string;
        payload?: { headers?: { name: string; value: string }[] };
      };
      const headers = data.payload?.headers ?? [];
      return {
        id: data.id,
        from: headerValue(headers, "from"),
        subject: headerValue(headers, "subject") || "(sans objet)",
        snippet: data.snippet ?? "",
      };
    })
  );
  return mails;
};
