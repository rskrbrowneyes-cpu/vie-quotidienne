import { createFileRoute } from "@tanstack/react-router";

import { App } from "../vq/app";

export const Route = createFileRoute("/")({
  component: App,
});
