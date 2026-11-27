import type { RootScreens, RootTexts } from "../root-screens";

const texts: RootTexts = {
  lang: "fr",
  dir: "ltr",
  missingChunkTitle: "L’application a été mise à jour",
  missingChunk: "Cette page n’a pas pu se charger après une mise à jour.",
  reload: "Recharger",
  errorTitle: "Une erreur est survenue",
  errorDescription: "Cette page a rencontré un problème inattendu.",
  retry: "Réessayer",
  errorDetails: "Détails",
  notFound: "Page introuvable",
  notFoundDescription: "Rien ne se trouve à cette adresse.",
  home: "Aller à l’accueil",
  starterEyebrow: "Pour commencer",
  starterHint: ({ file, directory }) => (
    <>
      Modifiez {file} ou ajoutez une route dans {directory}.
    </>
  ),
};

const frenchRootScreens: RootScreens = {
  resolveLocale: () => "fr",
  texts: () => texts,
};

export default frenchRootScreens;
