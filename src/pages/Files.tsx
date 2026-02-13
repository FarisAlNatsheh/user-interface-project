// Files.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";

type FileType = "kubeconfig" | "GCS" | "AWS" | "tfstate";

type ManagedFile = {
  id: string;
  name: string;
  type: FileType;
  lastUpdatedLabel: string; // e.g. "10h", "1w"
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
    createdLabel: "11/10/2025",
    contentsPreview: "{\n  \"client_id\": \"...\",\n  \"project_id\": \"...\"\n}\n...",
    events: ["gcs-local was modified 1 week ago", "gcs-local created on 11/10/2025"],
  },
  { id: "f3", name: "aws-dev", type: "AWS", lastUpdatedLabel: "1y" },
  { id: "f4", name: "terraform-test", type: "tfstate", lastUpdatedLabel: "2y" },
];

type SortKey = "name" | "type" | "lastUpdated";
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
    setSelectedId((prevId) => {
      const remaining = files.filter((f) => f.id !== selected.id);
      return remaining[0]?.id ?? "";
    });
  }

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
          <p>Managed files</p>
        </div>
        <div />
      </header>

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
                    <td className="files-empty" colSpan={3}>
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
                        <td className="files-td">{f.name}</td>
                        <td className="files-td">{f.type}</td>
                        <td className="files-td files-td-right">{f.lastUpdatedLabel}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="files-actions">
          <button className="files-button" onClick={editSelected} disabled={!selected}>
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
