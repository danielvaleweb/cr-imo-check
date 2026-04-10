import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'Ocorreu um erro inesperado.';
      
      try {
        // Check if it's a Firestore error JSON
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            errorMessage = `Erro no banco de dados (${parsed.operationType}): ${parsed.error}`;
          }
        }
      } catch (e) {
        // Not a JSON error, use default or message
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-brand-cream p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center">
            <h2 className="text-2xl font-serif text-brand-rust mb-4">Ops! Algo deu errado</h2>
            <p className="text-brand-dark mb-6">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-brand-rust text-white px-6 py-2 rounded-full hover:bg-opacity-90 transition-colors"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
