import React from "react";
import { Outlet } from "react-router-dom";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";

class OwnerPanelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
    this.handleRetry = this.handleRetry.bind(this);
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[OwnerPanel] Unhandled render error:", error, errorInfo);
  }

  handleRetry() {
    this.setState({ hasError: false });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card border border-border rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="mx-auto mb-4 size-14 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="size-7 text-red-500" />
          </div>
          <h1 className="font-serif text-[28px] font-bold text-foreground leading-tight mb-2">
            Something went wrong
          </h1>
          <p className="text-[13.5px] text-muted-foreground mb-6">
            We couldn't load this section. Please try again or go back to the dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-foreground text-background text-[13px] font-medium hover:opacity-90 transition-opacity"
            >
              <RefreshCw className="size-4" />
              Try Again
            </button>
            <button
              onClick={() => { window.location.href = "/propertyowner/admin"; }}
              className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl border border-border text-foreground text-[13px] font-medium hover:bg-muted transition-colors"
            >
              <LayoutDashboard className="size-4" />
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
}

// React Router v6 layout wrapper — renders child routes inside the ErrorBoundary
export function OwnerPanelShell() {
  return (
    <OwnerPanelErrorBoundary>
      <Outlet />
    </OwnerPanelErrorBoundary>
  );
}

export default OwnerPanelErrorBoundary;
