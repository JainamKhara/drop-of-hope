import React, { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global Error Boundary Component
 *
 * Catches unhandled errors in React component tree and displays user-friendly error UI.
 * This prevents white-screen-of-death crashes and provides recovery options.
 *
 * Features:
 * - Catches rendering errors in all child components
 * - Shows user-friendly error message
 * - Provides "Try Again" and "Go Home" recovery options
 * - Shows detailed error info in development mode
 * - Logs errors to console for debugging
 *
 * Limitations (errors NOT caught):
 * - Event handler errors (use try-catch in handlers)
 * - Async code errors (use .catch() or try-catch in async functions)
 * - Server-side errors (handled by server middleware)
 * - setTimeout/setInterval errors
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console and potentially to error tracking service
    console.error("Error caught by boundary:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-destructive/10 p-4">
          <div className="max-w-md rounded-lg border border-destructive/20 bg-white p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <h2 className="text-lg font-semibold text-foreground">
                Something went wrong
              </h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              An unexpected error occurred. Please try refreshing the page or
              contact support if the problem persists.
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-4 rounded bg-muted p-2">
                <summary className="cursor-pointer text-sm font-mono">
                  Error details (dev only)
                </summary>
                <pre className="mt-2 overflow-auto text-xs">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <div className="mt-4 flex gap-2">
              <Button onClick={this.resetError} className="flex-1">
                Try Again
              </Button>
              <Button
                onClick={() => (window.location.href = "/")}
                variant="outline"
                className="flex-1"
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
