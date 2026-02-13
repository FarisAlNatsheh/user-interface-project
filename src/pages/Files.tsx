// Files.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

type FileType = "kubeconfig" | "GCS" | "AWS" | "tfstate";

type ManagedFile = {
  id: string;
  name: string;
  type: FileType;
  lastUpdatedLabel: string; // e.g. "10h", "1w"
  mode: "editable" | "monitoring-only";
  linkedConfigs: string[];
  synced: boolean;
  createdLabel?: string; // optional, for details pane
  contentsPreview?: string; // optional, for details pane
  events?: string[]; // optional, for details pane
};

const MOCK_FILES: ManagedFile[] = [
  {
    id: "f1",
    name: "kubeconfig-local",
    type: "kubeconfig",
    lastUpdatedLabel: "10h",
    mode: "editable",
    linkedConfigs: ["Local"],
    synced: true,
    createdLabel: "01/01/1970",
    contentsPreview: "apiVersion: v1\nclusters:\n  - name: local\n    cluster:\n      server: https://127.0.0.1:6443\n...",
    events: [
      "kubeconfig-local was modified on November 8th 2025",
      "kubeconfig-local created on 1st Jan 1970",
    ],
  },
  {
    id: "f2",
    name: "gcs-local",
    type: "GCS",
    lastUpdatedLabel: "1w",
    mode: "editable",
    linkedConfigs: ["Local"],
    synced: false,
    createdLabel: "11/10/2025",
    contentsPreview: "{\n  \"client_id\": \"...\",\n  \"project_id\": \"...\"\n}\n...",
    events: ["gcs-local was modified 1 week ago", "gcs-local created on 11/10/2025"],
  },
  {
    id: "f3",
    name: "aws-dev",
    type: "AWS",
    lastUpdatedLabel: "1y",
    mode: "monitoring-only",
    linkedConfigs: ["Dev", "Stg"],
    synced: false,
  },
  {
    id: "f4",
    name: "terraform-test",
    type: "tfstate",
    lastUpdatedLabel: "2y",
    mode: "monitoring-only",
    linkedConfigs: ["Dev"],
    synced: true,
  },
];

type SortKey = "name" | "type" | "mode" | "lastUpdated";
type SortDir = "asc" | "desc";

export default function Files() {
  const [files, setFiles] = useState<ManagedFile[]>(MOCK_FILES);
  const [selectedId, setSelectedId] = useState<string>(MOCK_FILES[0]?.id ?? "");
  const selected = useMemo(() => files.find((f) => f.id === selectedId) ?? null, [files, selectedId]);
  const tableRef = useRef<HTMLDivElement | null>(null);

  // Table controls
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = files.filter((f) => {
      if (!q) return true;
      return `${f.name} ${f.type} ${f.lastUpdatedLabel}`.toLowerCase().includes(q);
    });

    const sorted = [...filtered].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;

      if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
      if (sortKey === "type") return a.type.localeCompare(b.type) * dir;
      if (sortKey === "mode") return a.mode.localeCompare(b.mode) * dir;

      // "lastUpdated" is a label like 10h/1w/1y — keep it simple for now:
      return a.lastUpdatedLabel.localeCompare(b.lastUpdatedLabel) * dir;
    });

    return sorted;
  }, [files, query, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
      return;
    }
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  }

  function addFile() {
    // Hook to real add flow later
    const id = `f${Math.random().toString(16).slice(2)}`;
    const newFile: ManagedFile = {
      id,
      name: `new-file-${files.length + 1}`,
      type: "kubeconfig",
      lastUpdatedLabel: "now",
      mode: "editable",
      linkedConfigs: ["Local"],
      synced: true,
      createdLabel: "today",
      contentsPreview: "…",
      events: ["Created just now"],
    };
    setFiles((prev) => [newFile, ...prev]);
    setSelectedId(id);
  }

  function editSelected() {
    if (!selected) return;
    console.log("Edit:", selected.id);
  }

  function deleteSelected() {
    if (!selected) return;
    if (!confirm(`Delete "${selected.name}"?`)) return;

    setFiles((prev) => prev.filter((f) => f.id !== selected.id));
    setSelectedId(() => {
      const remaining = files.filter((f) => f.id !== selected.id);
      return remaining[0]?.id ?? "";
    });
  }

  const unsyncedCount = useMemo(
    () => files.filter((file) => !file.synced).length,
    [files]
  );

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!tableRef.current) return;
      if (tableRef.current.contains(event.target as Node)) return;
      setSelectedId("");
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className="page-shell files-page">
      <header className="page-header files-header">
        <div>
          <h1>Files</h1>
          <p>Managed files with editing and monitoring clarity.</p>
        </div>
        <div />
      </header>

      {unsyncedCount > 0 ? (
        <div className="status-alert status-alert-warning">
          {unsyncedCount} file{unsyncedCount === 1 ? "" : "s"} not synced with PC.
          Review status before editing.
        </div>
      ) : null}

      <div className="files-layout">
        <section className="files-card" ref={tableRef}>
          <div className="files-toolbar">
            <input
              className="files-input"
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="files-table-wrap" role="region" aria-label="Managed files table">
            <table className="files-table">
              <thead>
                <tr>
                  <Th
                    label="Name"
                    active={sortKey === "name"}
                    dir={sortDir}
                    onClick={() => toggleSort("name")}
                  />
                  <Th
                    label="Type"
                    active={sortKey === "type"}
                    dir={sortDir}
                    onClick={() => toggleSort("type")}
                  />
                  <Th
                    label="Mode"
                    active={sortKey === "mode"}
                    dir={sortDir}
                    onClick={() => toggleSort("mode")}
                  />
                  <Th
                    label="Last Updated"
                    active={sortKey === "lastUpdated"}
                    dir={sortDir}
                    onClick={() => toggleSort("lastUpdated")}
                    align="right"
                  />
                </tr>
              </thead>

              <tbody>
                {visibleRows.length === 0 ? (
                  <tr>
                    <td className="files-empty" colSpan={4}>
                      No files found.
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((f) => {
                    const isSelected = f.id === selectedId;
                    return (
                      <tr
                        key={f.id}
                        onClick={() => setSelectedId(f.id)}
                        className={`files-row ${isSelected ? "is-selected" : ""}`}
                      >
                        <td className="files-td">
                          <span className="files-name">
                            {f.name}
                            <span
                              className={`files-sync ${
                                f.synced ? "files-sync-ok" : "files-sync-alert"
                              }`}
                              aria-label={f.synced ? "Synced with PC" : "Not synced"}
                              data-tooltip={f.synced ? "Synced with PC" : "Not synced"}
                            >
                              {f.synced ? "↻" : "!"}
                            </span>
                          </span>
                        </td>
                        <td className="files-td">{f.type}</td>
                        <td className="files-td">
                          <span className={`files-mode files-mode-${f.mode}`}>
                            {f.mode === "editable" ? "Editable" : "Monitoring-only"}
                          </span>
                        </td>
                        <td className="files-td files-td-right">{f.lastUpdatedLabel}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="files-details" aria-live="polite">
          {!selected ? (
            <div className="files-details-empty">Select a file to see details.</div>
          ) : (
            <div className="files-details-body">
              <div className="files-details-header">
                <div>
                  <div className="files-details-name">{selected.name}</div>
                  <div className="files-details-meta">
                    Type: {selected.type} · Last updated {selected.lastUpdatedLabel}
                  </div>
                </div>
                <span className={`files-mode files-mode-${selected.mode}`}>
                  {selected.mode === "editable" ? "Editable" : "Monitoring-only"}
                </span>
              </div>

              <div className="files-details-section">
                <div className="files-details-title">Linked configurations</div>
                <div className="files-details-links">
                  {selected.linkedConfigs.length === 0
                    ? "Not linked"
                    : selected.linkedConfigs.map((cfg) => (
                        <Link key={cfg} to="/configurations" className="files-link">
                          {cfg}
                        </Link>
                      ))}
                </div>
              </div>

              <div className="files-details-section">
                <div className="files-details-title">Editing status</div>
                <div className="files-details-text">
                  {selected.mode === "editable"
                    ? "Editable in this workspace. Changes will be applied on save."
                    : "Monitoring-only to avoid accidental edits. Review linked configurations for changes."}
                </div>
              </div>
            </div>
          )}
        </section>

        <div className="files-actions">
          <button
            className="files-button"
            onClick={editSelected}
            disabled={!selected || selected.mode === "monitoring-only"}
          >
            Edit
          </button>
          <button className="files-button" onClick={deleteSelected} disabled={!selected}>
            Delete
          </button>
          <button className="files-button files-button-primary" onClick={addFile}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

function Th({
  label,
  active,
  dir,
  onClick,
  align,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <th className="files-th" style={{ textAlign: align ?? "left" }}>
      <button className="files-th-button" onClick={onClick} type="button">
        <span className="files-th-label">{label}</span>
        <span className="files-th-sort">{active ? (dir === "asc" ? "˄" : "˅") : "↕"}</span>
      </button>
    </th>
  );
}
