import { Component, lazy, Suspense, type ReactNode } from "react";
import Loading from "./loading";

const Demo = lazy(() => import("./demo"));

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#fff",
            color: "#red",
            padding: 40,
            fontFamily: "monospace",
            fontSize: 14,
            overflow: "auto",
            zIndex: 99999,
          }}>
          <h2 style={{ color: "#red", marginBottom: 16 }}>
            Demo4 Runtime Error:
          </h2>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {this.state.error.message}
            {"\n\n"}
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Index() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <Demo />
      </Suspense>
    </ErrorBoundary>
  );
}
