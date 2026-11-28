import { useState } from "react";
import type { FormEvent } from "react";

import { connectGmail, disconnectGmail, fetchRecentMails, readGmailToken } from "./gmail";
import type { MailSummary } from "./gmail";
import { STORAGE_KEYS, useStoredState } from "./storage";

type FeedItem = { title: string; link: string; date: string; source: string };

type Result = { text: string; mails: MailSummary[]; items: FeedItem[] };

const MODEL = "mistral-small-latest";

const askMistral = async (worker: string, system: string, user: string) => {
  const res = await fetch(`${worker.replace(/\/$/, "")}/mistral`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 800,
      temperature: 0.3,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(res.status === 401 ? "worker-key" : "worker-mistral");
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() || "";
};

const fetchFeeds = async (worker: string, feeds: string[]) => {
  const results = await Promise.allSettled(
    feeds.map(async (feed) => {
      const res = await fetch(`${worker.replace(/\/$/, "")}/rss`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feed }),
      });
      if (!res.ok) throw new Error("rss");
      return ((await res.json()) as { items: FeedItem[] }).items;
    })
  );
  return results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
};

const mailDigest = (mails: MailSummary[]) =>
  mails
    .map((mail, index) => `${index + 1}. De: ${mail.from} | Objet: ${mail.subject} | Extrait: ${mail.snippet}`)
    .join("\n");

const feedDigest = (items: FeedItem[]) =>
  items.map((item) => `- [${item.source}] ${item.title} (${item.date})`).join("\n");

export function AgentModule() {
  const [worker, setWorker] = useStoredState<string>(STORAGE_KEYS.agentWorker, "");
  const [clientId, setClientId] = useStoredState<string>(STORAGE_KEYS.agentClientId, "");
  const [feeds, setFeeds] = useStoredState<string>(
    STORAGE_KEYS.agentFeeds,
    "https://www.lemonde.fr/rss/une.xml"
  );
  const [gmailToken, setGmailToken] = useState<string | null>(() => readGmailToken()?.token ?? null);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState("");

  const feedList = feeds
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const run = async (key: string, action: () => Promise<Result>) => {
    setBusy(key);
    setError(null);
    try {
      setResult(await action());
    } catch (caught) {
      const reason = caught instanceof Error ? caught.message : "erreur";
      setError(
        reason === "gmail-auth"
          ? "Session Gmail expirée, reconnecte-toi."
          : reason === "worker-key"
            ? "Le Worker refuse la requête : vérifie le secret MISTRAL_API_KEY."
            : reason.startsWith("gmail")
              ? "Impossible de lire les mails : vérifie l'API Gmail et le Client ID."
              : "Appel impossible : vérifie l'URL du Worker et ta connexion."
      );
    } finally {
      setBusy(null);
    }
  };

  const analyseMails = () => {
    if (!worker) return;
    void run("mails", async () => {
      const token = readGmailToken()?.token ?? null;
      if (!token) {
        connectGmail(clientId);
        return { text: "", mails: [], items: [] };
      }
      const mails = await fetchRecentMails(token);
      if (mails.length === 0) {
        return { text: "Aucun mail récent trouvé.", mails: [], items: [] };
      }
      const text = await askMistral(
        worker,
        "Tu es un assistant personnel en français. On te donne une liste d'emails récents. Résume-les en trois sections : « À traiter » (emails attendant une réponse ou une action), « À lire » (informatifs mais sans urgence), « Bruit » (newsletters, promotions). Pour chaque email important, donne expéditeur et objet. Réponds en texte simple avec des puces •, maximum 180 mots.",
        mailDigest(mails)
      );
      return { text, mails, items: [] };
    });
  };

  const newsOfTheDay = () => {
    if (!worker || feedList.length === 0) return;
    void run("news", async () => {
      const items = await fetchFeeds(worker, feedList);
      if (items.length === 0) throw new Error("rss");
      const text = await askMistral(
        worker,
        "Tu es un assistant personnel en français. On te donne les derniers titres de flux RSS choisis par l'utilisateur. Sélectionne les 5 informations les plus marquantes et résume chacune en une ou deux phrases. Termine par une phrase de contexte si les titres s'y prêtent. Réponds en texte simple avec des puces •, maximum 200 mots. Ne mentionne pas d'URL.",
        feedDigest(items)
      );
      return { text, mails: [], items };
    });
  };

  const askTopic = (event: FormEvent) => {
    event.preventDefault();
    if (!worker || !topic.trim() || feedList.length === 0) return;
    const question = topic.trim();
    void run("topic", async () => {
      const items = await fetchFeeds(worker, feedList);
      const text = await askMistral(
        worker,
        "Tu es un assistant personnel en français. L'utilisateur pose une question d'actualité. On te donne les derniers titres de ses sources RSS choisies. Réponds à la question en t'appuyant sur ces titres si possible ; si les titres ne couvrent pas le sujet, dis-le clairement et indique ce que les sources en disent de plus proche. Réponds en texte simple, maximum 150 mots.",
        `Question: ${question}\n\nTitres récents:\n${feedDigest(items)}`
      );
      return { text, mails: [], items };
    });
  };

  const configured = worker.length > 0;

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-line bg-surface px-4 py-3">
        <p className="text-sm font-semibold">✦ Agent personnel</p>
        <p className="mt-1 text-xs text-muted">
          Propulsé par Mistral via ton Worker gratuit. Les extraits de mails ne sont envoyés à l'API que
          quand tu appuies sur le bouton. Les questions d'actualité s'appuient sur tes sources choisies.
        </p>
      </div>

      <details className="rounded-xl border border-line bg-surface px-4 py-3">
        <summary className="cursor-pointer text-sm font-semibold">Réglages de l'agent</summary>
        <div className="mt-3 space-y-3">
          <label className="block text-xs font-semibold">
            URL du Worker (proxy Mistral + RSS)
            <input
              value={worker}
              onChange={(event) => setWorker(event.target.value)}
              placeholder="https://agent.moncompte.workers.dev"
              className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="block text-xs font-semibold">
            Google OAuth Client ID (lecture Gmail)
            <input
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              placeholder="1234567890-xxxx.apps.googleusercontent.com"
              className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="block text-xs font-semibold">
            Flux RSS (une URL par ligne)
            <textarea
              value={feeds}
              onChange={(event) => setFeeds(event.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted">
              {gmailToken ? "Gmail : connecté (lecture seule)" : "Gmail : non connecté"}
            </span>
            {gmailToken ? (
              <button
                type="button"
                onClick={() => {
                  disconnectGmail();
                  setGmailToken(null);
                }}
                className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold active:opacity-80"
              >
                Déconnecter
              </button>
            ) : (
              <button
                type="button"
                disabled={!clientId}
                onClick={() => clientId && connectGmail(clientId)}
                className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold disabled:opacity-40 active:opacity-80"
              >
                Connecter Gmail
              </button>
            )}
          </div>
        </div>
      </details>

      {!configured ? (
        <p className="rounded-xl border border-dashed border-line bg-surface px-4 py-6 text-center text-sm text-muted">
          Renseigne d'abord l'URL du Worker dans les réglages ci-dessus. Guide pas à pas dans
          worker/README.md du projet.
        </p>
      ) : null}

      <div className="rounded-xl border border-line bg-surface px-4 py-3">
        <p className="text-sm font-semibold">📬 Mes mails</p>
        <button
          type="button"
          disabled={!configured || busy !== null}
          onClick={analyseMails}
          className="mt-2 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40 active:opacity-90"
        >
          {busy === "mails" ? "Lecture en cours…" : "Résumer mes derniers mails"}
        </button>
      </div>

      <div className="rounded-xl border border-line bg-surface px-4 py-3">
        <p className="text-sm font-semibold">📰 Nouvelles du jour</p>
        <button
          type="button"
          disabled={!configured || busy !== null || feedList.length === 0}
          onClick={newsOfTheDay}
          className="mt-2 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40 active:opacity-90"
        >
          {busy === "news" ? "Lecture des flux…" : "Les infos marquantes de mes sources"}
        </button>
      </div>

      <form onSubmit={askTopic} className="rounded-xl border border-line bg-surface px-4 py-3">
        <p className="text-sm font-semibold">🔎 Sur un sujet</p>
        <div className="mt-2 flex gap-2">
          <input
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="Ex. élections, manifestations, sport…"
            className="min-w-0 flex-1 rounded-lg border border-line bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={!configured || busy !== null || !topic.trim()}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 active:opacity-90"
          >
            {busy === "topic" ? "…" : "Demander"}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted">
          Réponses basées sur les dernières nouvelles de tes sources.
        </p>
      </form>

      {error ? (
        <p className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="space-y-3">
          {result.text ? (
            <div className="whitespace-pre-line rounded-xl border border-line bg-raised px-4 py-3 text-sm leading-relaxed">
              {result.text}
            </div>
          ) : null}

          {result.mails.length > 0 ? (
            <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
              {result.mails.slice(0, 20).map((mail) => (
                <li key={mail.id} className="px-4 py-2.5 text-xs">
                  <p className="truncate font-semibold">{mail.subject}</p>
                  <p className="truncate text-muted">{mail.from}</p>
                </li>
              ))}
            </ul>
          ) : null}

          {result.items.length > 0 ? (
            <ul className="space-y-1">
              {result.items.slice(0, 20).map((item) => (
                <li key={`${item.source}-${item.link}`}>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate rounded-lg px-3 py-2 text-xs text-accent underline-offset-2 active:bg-accent-soft"
                  >
                    [{item.source}] {item.title}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
