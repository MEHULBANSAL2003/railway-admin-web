import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const NotFoundPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [count, setCount] = useState(10);



  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-secondary, #f8fafc)",
      fontFamily: "inherit",
      padding: 24,
    }}>
      <div style={{ textAlign: "center", maxWidth: 420 }}>

        {/* 404 number */}
        <div style={{
          fontSize: 96,
          fontWeight: 800,
          lineHeight: 1,
          color: "var(--primary-100, #dbeafe)",
          letterSpacing: -4,
          marginBottom: 16,
          userSelect: "none",
        }}>
          404
        </div>

        {/* Icon */}
        <div style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#fef2f2",
          border: "1px solid #fecaca",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
               stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>

        <h1 style={{
          fontSize: 22,
          fontWeight: 700,
          color: "var(--text-primary, #0f172a)",
          marginBottom: 8,
        }}>
          Page not found
        </h1>

        <p style={{
          fontSize: 14,
          color: "var(--text-secondary, #64748b)",
          marginBottom: 8,
          lineHeight: 1.6,
        }}>
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Path pill */}
        <div style={{
          display: "inline-block",
          background: "var(--bg-tertiary, #f1f5f9)",
          border: "1px solid var(--border-primary, #e2e8f0)",
          borderRadius: 6,
          padding: "4px 12px",
          fontSize: 12,
          fontFamily: "monospace",
          color: "var(--text-tertiary, #94a3b8)",
          marginBottom: 28,
          maxWidth: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {location.pathname}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 24 }}>
          <button
            onClick={() => navigate("/dashboard", { replace: true })}
            style={{
              height: 36,
              padding: "0 18px",
              background: "var(--primary-600, #2563eb)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius-md, 6px)",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "inherit",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Go to Dashboard
          </button>

          <button
            onClick={() => navigate(-1)}
            style={{
              height: 36,
              padding: "0 18px",
              background: "transparent",
              color: "var(--text-secondary, #64748b)",
              border: "1px solid var(--border-primary, #e2e8f0)",
              borderRadius: "var(--radius-md, 6px)",
              fontSize: 14,
              fontWeight: 500,
              fontFamily: "inherit",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Go Back
          </button>
        </div>

        {/* Countdown */}
        <p style={{ fontSize: 12, color: "var(--text-tertiary, #94a3b8)", marginBottom: 6 }}>
          Redirecting to dashboard in {count}s
        </p>
        <div style={{
          width: 160,
          height: 3,
          background: "var(--border-primary, #e2e8f0)",
          borderRadius: 99,
          margin: "0 auto",
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${(count / 10) * 100}%`,
            background: "var(--primary-600, #2563eb)",
            borderRadius: 99,
            transition: "width 1s linear",
          }} />
        </div>

      </div>
    </div>
  );
};

export default NotFoundPage;
