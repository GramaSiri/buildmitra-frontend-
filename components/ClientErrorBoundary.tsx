import React from "react";

class ClientErrorBoundary extends React.Component<any, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    console.error("BuildMitra client error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          padding: "24px",
          fontFamily: "Arial",
          background: "#f8fafc",
          color: "#111827"
        }}>
          <h2>BuildMitra page error</h2>
          <p>This page had a mobile browser error. Please go back and open again.</p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = "/";
            }}
            style={{
              padding: "10px 16px",
              background: "#1a5f7a",
              color: "white",
              border: 0,
              borderRadius: "8px"
            }}
          >
            Go Home
          </button>
          <pre style={{
            marginTop: "16px",
            padding: "12px",
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "8px",
            whiteSpace: "pre-wrap",
            fontSize: "12px"
          }}>
            {String(this.state.error?.message || this.state.error || "")}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ClientErrorBoundary;
