// Alerts.tsx
import { useMemo, useState } from "react";

type Severity = "critical" | "warning" | "info";

type AlertItem = {
  id: string;
  anchorId?: string;
  title: string;
  message: string;
  explanation: string;
  technicalDetails: string[];
  remediationSteps: string[];
  severity: Severity;
  source?: string;
  createdAt: string; // display label like "3m ago" / "2026-02-13 14:02"
};

const MOCK_ALERTS: AlertItem[] = [
  {
    id: "a1",
    anchorId: "alert-gcs",
    severity: "critical",
    title: 'FILE "GCS" NOT FOUND',
    message:
      "The application couldn't locate the required file. Verify it exists and the configured path is correct.",
    explanation: "Missing file access in the LOCAL environment is blocking sync operations.",
    technicalDetails: [
      "Path lookup failed for /Users/natsheh/.config/gcs.json",
      "Last successful read: 2026-02-13 13:59",
    ],
    remediationSteps: [
      "Confirm the file exists and permissions allow read access.",
      "Re-link the file from Configurations → Local.",
    ],
    source: "Local FS",
    createdAt: "3m ago",
  },
  {
    id: "a2",
    severity: "warning",
    title: "CONFIG VALUE MISSING",
    message: "A non-critical configuration value is missing. Defaults were applied.",
    explanation: "A fallback value was used to keep the service running.",
    technicalDetails: ["Key: telemetry.sample_rate", "Fallback: 0.2"],
    remediationSteps: ["Review the config template", "Set a value in the Configurations tab"],
    source: "Config",
    createdAt: "12m ago",
  },
  {
    id: "a3",
    severity: "info",
    title: "HEALTH CHECK OK",
    message: "Background health checks completed successfully.",
    explanation: "All monitored services responded within the expected threshold.",
    technicalDetails: ["Latency avg: 120ms", "Services checked: 6"],
    remediationSteps: ["No action required"],
    source: "Monitor",
    createdAt: "1h ago",
  },
];

export default function Alerts() {
  // Replace MOCK_ALERTS with real data later (Tauri invoke / backend / store)
  const [alerts, setAlerts] = useState<AlertItem[]>(MOCK_ALERTS);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const [query, setQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<"all" | Severity>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return alerts.filter((a) => {
      const matchesSeverity = severityFilter === "all" ? true : a.severity === severityFilter;
      const matchesQuery =
        q.length === 0
          ? true
          : (a.title + " " + a.message + " " + (a.source ?? "")).toLowerCase().includes(q);

      return matchesSeverity && matchesQuery;
    });
  }, [alerts, query, severityFilter]);

  const counts = useMemo(() => {
    const c = { critical: 0, warning: 0, info: 0 };
    for (const a of alerts) c[a.severity]++;
    return c;
  }, [alerts]);

  function clearAll() {
    setAlerts([]);
  }

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="page-shell alerts-page">
      <header className="page-header alerts-header">
        <div>
          <h1>Alerts</h1>
          <p>
            {alerts.length === 0
              ? "No alerts right now."
              : `${counts.critical} critical · ${counts.warning} warning · ${counts.info} info`}
          </p>
        </div>

        <div className="alerts-header-actions">
          <button
            className="alerts-button"
            onClick={clearAll}
            disabled={alerts.length === 0}
          >
            Clear all
          </button>
        </div>
      </header>

      <section className="alerts-controls">
        <input
          className="alerts-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search alerts…"
          aria-label="Search alerts"
        />

        <select
          className="alerts-select"
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value as any)}
          aria-label="Filter by severity"
        >
          <option value="all">All severities</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>
      </section>

      {filtered.length === 0 ? (
        <EmptyState
          title={alerts.length === 0 ? "All clear" : "No matches"}
          message={
            alerts.length === 0
              ? "Nothing needs your attention."
              : "Try changing the filter or search query."
          }
        />
      ) : (
        <div className="alerts-table-wrap">
          <table className="alerts-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Title</th>
                <th>Source</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((alert) => (
                <AlertRow
                  key={alert.id}
                  alert={alert}
                  isExpanded={expandedIds.has(alert.id)}
                  onToggle={() => toggleExpanded(alert.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AlertRow({
  alert,
  isExpanded,
  onToggle,
}: {
  alert: AlertItem;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr id={alert.anchorId} data-severity={alert.severity}>
        <td>
          <span className={`alerts-badge alerts-badge-${alert.severity}`}>
            {alert.severity.toUpperCase()}
          </span>
        </td>
        <td>
          <div className="alerts-title">{alert.title}</div>
          <div className="alerts-message">{alert.message}</div>
        </td>
        <td className="alerts-muted">{alert.source ?? "—"}</td>
        <td className="alerts-muted">{alert.createdAt}</td>
        <td>
          <div className="alerts-actions">
            <button className="alerts-button-ghost" onClick={onToggle}>
              {isExpanded ? "Hide" : "Details"}
            </button>
            <button
              className="alerts-button-ghost"
              onClick={() => console.log("Copy message:", alert.id)}
            >
              Copy
            </button>
          </div>
        </td>
      </tr>
      {isExpanded ? (
        <tr className="alerts-details-row">
          <td colSpan={5}>
            <div className="alerts-details">
              <div className="alerts-details-block">
                <div className="alerts-details-title">Why this happened</div>
                <div className="alerts-details-text">{alert.explanation}</div>
              </div>
              <div className="alerts-details-block">
                <div className="alerts-details-title">Technical details</div>
                <ul className="alerts-details-list">
                  {alert.technicalDetails.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </div>
              <div className="alerts-details-block">
                <div className="alerts-details-title">Remediation steps</div>
                <ol className="alerts-details-list alerts-details-steps">
                  {alert.remediationSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="alerts-empty">
      <div className="alerts-empty-title">{title}</div>
      <div className="alerts-empty-msg">{message}</div>
    </div>
  );
}
