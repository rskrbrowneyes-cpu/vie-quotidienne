# Agent IA « Vie quotidienne » — setup pas à pas (100 % gratuit)

L'onglet **Agent** de l'app utilise Mistral pour résumer tes mails Gmail et les
nouvelles de tes sources RSS. Deux comptes gratuits à préparer une seule fois.

## 1. Le Worker Cloudflare (proxy Mistral + RSS)

L'API Mistral refuse les appels directs depuis un navigateur (CORS) : un mini
Worker gratuit sert de relais. La clé reste côté Worker, jamais dans l'app.

1. Crée un compte sur [dash.cloudflare.com](https://dash.cloudflare.com) (plan Free).
2. Menu **Workers & Pages → Create → Create Worker**, nomme-le (ex. `vq-agent`), Deploy.
3. **Edit code** : remplace tout le contenu par le fichier [`agent-worker.js`](./agent-worker.js), Deploy.
4. **Settings → Variables and Secrets → Add** :
   - Type *Secret*, nom `MISTRAL_API_KEY`, valeur = ta clé API Mistral
     ([console.mistral.ai → API Keys](https://console.mistral.ai/api-keys), plan gratuit).
5. Note l'URL du Worker (ex. `https://vq-agent.moncompte.workers.dev`).
6. Dans l'app : onglet **Agent → Réglages → URL du Worker** : colle cette URL.

Optionnel (ligne de commande) : `npx wrangler deploy` avec un `wrangler.toml`
minimal et `wrangler secret put MISTRAL_API_KEY`.

## 2. Gmail (lecture seule)

1. [console.cloud.google.com](https://console.cloud.google.com) → crée un projet (ex. `vie-quotidienne`).
2. **APIs & Services → Library → Gmail API → Enable**.
3. **APIs & Services → OAuth consent screen** : type *External*, remplis le nom de
   l'app et ton email, **Add Users** avec ton adresse Gmail (mode test = suffit,
   gratuit, aucun écran de vérification).
4. **Credentials → Create Credentials → OAuth client ID** : type *Web application*.
   - **Authorized JavaScript origins** : `https://rskrbrowneyes-cpu.github.io`
   - Pas de redirect URI à ajouter (le fragment `#access_token` revient sur l'URL de l'app).
5. Copie le **Client ID** et colle-le dans l'app : **Agent → Réglages → Google OAuth Client ID**.
6. Bouton **Connecter Gmail** → autorise → revenu sur l'app, Gmail affiche « connecté ».

La connexion dure ~1 h par session (jeton en sessionStorage, lecture seule) :
l'app redemande simplement l'autorisation quand elle expire.

## 3. Utilisation

- **📬 Mes mails** : résume tes ~20 derniers mails (À traiter / À lire / Bruit) et
  liste les objets en dessous.
- **📰 Nouvelles du jour** : lit tes flux RSS (réglages, une URL par ligne) et
  sélectionne les 5 infos les plus marquantes, avec liens cliquables.
- **🔎 Sur un sujet** : pose une question d'actualité — la réponse s'appuie sur les
  derniers titres de tes sources.

Coût total : 0 €. Quotas gratuits largement suffisants pour un usage personnel
(Mistral free tier, Workers 100 000 req/jour, Gmail API 1 Md d'unités de quota/jour).
