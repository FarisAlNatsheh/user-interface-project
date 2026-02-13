// Dashboard.tsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

type DashboardStatus =
  | { kind: "ok"; activeEnv: string; updatedLabel: string }
  | {
      kind: "error";
      activeEnv: string;
      updatedLabel: string;
      missingFileName: string;
    };

export default function Dashboard() {
  // Mock state to match the low-fidelity design.
  // Replace this with real data from your backend / Tauri commands later.
  const [status, setStatus] = useState<DashboardStatus>({
    kind: "error",
    activeEnv: "LOCAL",
    updatedLabel: "Updated 3m ago",
    missingFileName: "GCS",
  });

  const isError = status.kind === "error";

  const headline = useMemo(() => {
    if (status.kind === "error") return `FILE "${status.missingFileName}" NOT FOUND`;
    return "No Issues Found";
  }, [status]);

  return (
    <div className="page-shell dashboard-page">
      <div className="content-card dashboard-card">
        <div className="dashboard-top">
          <div className="dashboard-active-label">ACTIVE:</div>
          <div className="dashboard-active-value">{status.activeEnv}</div>
        </div>

        <div className="dashboard-icon">
          {isError ? <IconX /> : <IconCheck />}
        </div>

        <div className="dashboard-center">
          {isError && (
            <div className="dashboard-hint">
              <span className="dashboard-hint-text">Check</span>{" "}
              <Link className="dashboard-hint-link" to="/alerts#alert-gcs">
                "Alerts"
              </Link>{" "}
              <span className="dashboard-hint-text">for more info</span>
            </div>
          )}

          <div className="dashboard-headline">{headline}</div>

          <div className="dashboard-updated">{status.updatedLabel}</div>
        </div>

        <div className="dashboard-switch">
          <div className="dashboard-switch-title">Developer Preview</div>
          <div className="dashboard-switch-body">
            <span className="dashboard-switch-text">
              Switch status to preview UI states.
            </span>
            <div className="dashboard-switch-actions">
              <button
                className="dashboard-switch-button"
                onClick={() =>
                  setStatus({
                    kind: "error",
                    activeEnv: "LOCAL",
                    updatedLabel: "Updated 3m ago",
                    missingFileName: "GCS",
                  })
                }
              >
                Switch to Error
              </button>
              <button
                className="dashboard-switch-button"
                onClick={() =>
                  setStatus({
                    kind: "ok",
                    activeEnv: "LOCAL",
                    updatedLabel: "Updated 3m ago",
                  })
                }
              >
                Switch to OK
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconX() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="44" fill="#E84C3D" />
      <path
        d="M44 44 L76 76 M76 44 L44 76"
        stroke="#fff"
        strokeWidth="10"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="44" fill="#2ECC71" />
      <path
        d="M38 62 L54 76 L82 44"
        stroke="#fff"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
