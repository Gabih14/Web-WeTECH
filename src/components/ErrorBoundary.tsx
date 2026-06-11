import React from "react";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error no controlado en la app", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 px-4 py-16">
          <div className="mx-auto max-w-lg rounded-lg bg-white p-6 text-center shadow-md">
            <h1 className="text-xl font-semibold text-gray-900">
              No pudimos cargar esta sección
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Actualizá la página para volver a intentarlo. Si el problema
              continúa, escribinos y te ayudamos con tu compra.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-lg bg-yellow-400 px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-yellow-500"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
