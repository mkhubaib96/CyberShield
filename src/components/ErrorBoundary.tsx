import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props { children: ReactNode; }
interface State { hasError: boolean; message: string; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: error instanceof Error ? error.message : "Unexpected application error." };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error("CyberShield render error", error, info.componentStack);
  }

  reset = () => { this.setState({ hasError: false, message: "" }); window.location.href = "/"; };

  render() {
    if (!this.state.hasError) return this.props.children;
    return <main className="flex min-h-screen items-center justify-center bg-background px-6"><section className="panel w-full max-w-lg p-7 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive"><AlertTriangle className="h-6 w-6" /></div><p className="mt-5 eyebrow">Recovery mode</p><h1 className="mt-2 font-display text-2xl font-bold">CyberShield hit an unexpected error</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">The application protected the rest of the workspace instead of rendering a blank screen. Restart the current view and try again.</p><details className="mt-4 rounded-xl border bg-muted/30 p-3 text-left text-xs text-muted-foreground"><summary className="cursor-pointer font-semibold">Technical details</summary><pre className="mt-2 whitespace-pre-wrap break-words">{this.state.message}</pre></details><Button className="mt-5" onClick={this.reset}><RotateCcw className="mr-2 h-4 w-4" />Restart workspace</Button></section></main>;
  }
}
