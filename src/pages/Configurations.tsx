// Configuration.tsx
import { useMemo, useState } from "react";

type ConfigSection = {
  id: string;
  title: string;
  subtitle?: string;
  mode: "editable" | "view-only";
  filesUsed: Record<string, string>;
  synced: boolean;
};

const FILE_OPTIONS: Record<string, string[]> = {
  kubeconfig: ["kubeconfig-local", "kubeconfig-dev", "kubeconfig-stg"],
  gcs: ["gcs-local", "gcs-dev", "gcs-stg"],
  aws: ["aws-dev", "aws-stg"],
  tfstate: ["terraform-test", "terraform-stg"],
};

const FILE_LABELS: Record<string, string> = {
  kubeconfig: "Kubeconfig",
  gcs: "GCS",
  aws: "AWS",
  tfstate: "Terraform State",
};

const MOCK_SECTIONS: ConfigSection[] = [
  {
    id: "local",
    title: "Local",
    subtitle: "Uses local dev credentials and paths.",
    mode: "editable",
    synced: true,
    filesUsed: {
      kubeconfig: "kubeconfig-local",
      gcs: "gcs-local",
    },
  },
  {
    id: "dev",
    title: "Dev",
    subtitle: "Shared dev sandbox config.",
    mode: "editable",
    synced: false,
    filesUsed: {
      kubeconfig: "kubeconfig-dev",
      aws: "aws-dev",
      tfstate: "terraform-test",
    },
  },
  {
    id: "stg",
    title: "Stg",
    subtitle: "Pre-prod staging configuration.",
    mode: "view-only",
    synced: true,
    filesUsed: {
      kubeconfig: "kubeconfig-stg",
      gcs: "gcs-stg",
      aws: "aws-stg",
      tfstate: "terraform-stg",
    },
  },
];

export default function Configuration() {
  const [sections, setSections] = useState<ConfigSection[]>(MOCK_SECTIONS);
  const [activeId, setActiveId] = useState<string>(MOCK_SECTIONS[0]?.id ?? "");

  const original = useMemo(() => JSON.stringify(MOCK_SECTIONS), []);
  const current = useMemo(() => JSON.stringify(sections), [sections]);
  const isDirty = original !== current;

  function setFileMapping(sectionId: string, key: string, value: string) {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;
        if (section.mode === "view-only") return section;
        return {
          ...section,
          filesUsed: { ...section.filesUsed, [key]: value },
        };
      })
    );
  }

  function resetAll() {
    setSections(MOCK_SECTIONS);
    setActiveId(MOCK_SECTIONS[0]?.id ?? "");
  }

  function addConfiguration() {
    const id = `env-${Math.random().toString(16).slice(2, 8)}`;
    const newSection: ConfigSection = {
      id,
      title: "New Environment",
      subtitle: "Describe how this environment is used.",
      mode: "editable",
      synced: true,
      filesUsed: {
        kubeconfig: FILE_OPTIONS.kubeconfig[0],
      },
    };
    setSections((prev) => [newSection, ...prev]);
    setActiveId(id);
  }

  async function save() {
    console.log("Saving config:", sections);
  }

  const activeSection = useMemo(
    () => sections.find((section) => section.id === activeId) ?? sections[0],
    [activeId, sections]
  );

  const unsyncedCount = useMemo(
    () => sections.filter((section) => !section.synced).length,
    [sections]
  );

  return (
    <div className="page-shell config-page">
      <header className="page-header config-header">
        <div>
          <h1>Configuration</h1>
          <p>Expand an environment to see which files it uses.</p>
        </div>

        <div className="config-header-actions">
          <button className="config-button" onClick={addConfiguration}>
            Add configuration
          </button>
          <button className="config-button" onClick={resetAll} disabled={!isDirty}>
            Reset
          </button>
          <button className="config-button-primary" onClick={save} disabled={!isDirty}>
            Save
          </button>
        </div>
      </header>

      {unsyncedCount > 0 ? (
        <div className="status-alert status-alert-warning">
          {unsyncedCount} environment{unsyncedCount === 1 ? "" : "s"} not synced
          with PC. Review status before editing.
        </div>
      ) : null}

      <main className="config-tabs-layout">
        <div className="config-tabs" role="tablist" aria-label="Configuration environments">
          {sections.map((section) => {
            const isActive = section.id === activeId;
            return (
              <button
                key={section.id}
                className={`config-tab ${isActive ? "config-tab-active" : ""}`}
                onClick={() => setActiveId(section.id)}
                role="tab"
                aria-selected={isActive}
              >
                <span className="config-tab-title">
                  {section.title}
                  <span
                    className={`config-sync ${
                      section.synced ? "config-sync-ok" : "config-sync-alert"
                    }`}
                    aria-label={section.synced ? "Synced with PC" : "Not synced"}
                    data-tooltip={section.synced ? "Synced with PC" : "Not synced"}
                  >
                    {section.synced ? "↻" : "!"}
                  </span>
                </span>
                <span className="config-count-pill">
                  {Object.keys(section.filesUsed).length}
                </span>
                <span
                  className={`config-mode-badge config-mode-${section.mode}`}
                >
                  {section.mode === "view-only" ? "View-only" : "Editable"}
                </span>
              </button>
            );
          })}
        </div>

        {activeSection ? (
          <section className="config-panel" role="tabpanel">
            <div className="config-panel-header">
              <div>
                <div className="config-section-title">{activeSection.title}</div>
                {activeSection.subtitle ? (
                  <div className="config-section-subtitle">{activeSection.subtitle}</div>
                ) : null}
              </div>
              <span
                className={`config-mode-badge config-mode-${activeSection.mode}`}
              >
                {activeSection.mode === "view-only" ? "View-only" : "Editable"}
              </span>
            </div>
            <div className="config-mode-hint">
              {activeSection.mode === "view-only"
                ? "This environment is locked to prevent accidental changes."
                : "Changes here will update the active mappings."}
            </div>
            <div className="config-files-title">Files in use</div>
            <div className="config-files-list">
              {Object.entries(activeSection.filesUsed).map(([key, value]) => (
                <div
                  key={key}
                  className={`config-files-item ${
                    activeSection.mode === "view-only" ? "is-readonly" : ""
                  }`}
                >
                  <span className="config-files-label">{FILE_LABELS[key] ?? key}</span>
                  <div className="config-files-value">
                    <select
                      className="config-files-select"
                      value={value}
                      disabled={activeSection.mode === "view-only"}
                      onChange={(event) =>
                        setFileMapping(activeSection.id, key, event.target.value)
                      }
                    >
                      {(FILE_OPTIONS[key] ?? [value]).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
