import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '60vh', padding: '40px', textAlign: 'center', color: 'var(--text-primary)'
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.1)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', marginBottom: '24px',
            fontSize: '28px'
          }}>
            ⚠
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '12px', fontSize: '1.5rem' }}>
            Algo correu mal
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '400px', lineHeight: '1.6' }}>
            {this.props.fallbackMessage || 'Ocorreu um erro inesperado. Tente recarregar a página.'}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            className="btn-primary"
            style={{ padding: '12px 32px', fontSize: '14px' }}
          >
            Recarregar Página
          </button>
          {import.meta.env.MODE === 'development' && this.state.error && (
            <pre style={{
              marginTop: '24px', padding: '16px', background: 'var(--bg-base)',
              border: '1px solid var(--border-subtle)', borderRadius: '8px',
              fontSize: '12px', color: '#ef4444', textAlign: 'left',
              maxWidth: '600px', overflow: 'auto', whiteSpace: 'pre-wrap'
            }}>
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
