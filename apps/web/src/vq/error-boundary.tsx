import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

type BoundaryProps = { children: ReactNode };

type BoundaryState = { failed: boolean };

export class ModuleBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("vq: module crashed", error, info.componentStack);
  }

  render() {
    if (!this.state.failed) {
      return this.props.children;
    }

    return (
      <div className="rounded-2xl border border-line bg-surface p-4">
        <p className="font-semibold">Un module a planté.</p>
        <p className="mt-1 text-sm text-muted">
          Tes données sont enregistrées sur l'appareil. Recharge pour réessayer.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-3 rounded-xl bg-accent px-4 py-2 text-base font-medium text-white active:opacity-80"
        >
          Recharger
        </button>
      </div>
    );
  }
}
