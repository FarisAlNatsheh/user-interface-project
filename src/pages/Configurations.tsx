// Configuration.tsx
import { useMemo, useState } from "react";

type ConfigSection = {
  id: string;
  title: string;
  subtitle?: string;
  filesUsed: Record<string, string>;
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
    filesUsed: {
      kubeconfig: "kubeconfig-local",
      gcs: "gcs-local",
    },
  },
  {
    id: "dev",
    title: "Dev",
    subtitle: "Shared dev sandbox config.",
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

  const [open, setOpen] = useState<Record<string, boolean>>({
    local: true,
    dev: false,
    stg: false,
  });

  const original = useMemo(() => JSON.stringify(MOCK_SECTIONS), []);
  const current = useMemo(() => JSON.stringify(sections), [sections]);
  const isDirty = original !== current;

  function toggleSection(id: string) {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function setFileMapping(sectionId: string, key: string, value: string) {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          filesUsed: { ...section.filesUsed, [key]: value },
        };
      })
    );
  }

  function resetAll() {
    setSections(MOCK_SECTIONS);
    setOpen({ local: true, dev: false, stg: false });
  }

  async function save() {
    console.log("Saving config:", sections);
  }

  return (
    <div className="page-shell config-page">
      <header className="page-header config-header">
        <div>
          <h1>Configuration</h1>
          <p>Expand an environment to see which files it uses.</p>
        </div>

        <div className="config-header-actions">
          <button className="config-button" onClick={resetAll} disabled={!isDirty}>
            Reset
          </button>
          <button className="config-button-primary" onClick={save} disabled={!isDirty}>
            Save
          </button>
        </div>
      </header>

      <main className="config-list">
        {sections.map((section) => {
          const isOpen = !!open[section.id];

          return (
            <section key={section.id} className="config-section">
              <button
                type="button"
                className="config-section-header"
                onClick={() => toggleSection(section.id)}
                aria-expanded={isOpen}
              >
                <div className="config-section-header-left">
                  <div className="config-section-header-text">
                    <div className="config-section-title">{section.title}</div>
                    {section.subtitle ? (
                      <div className="config-section-subtitle">{section.subtitle}</div>
                    ) : null}
                  </div>
                </div>

                <div className="config-section-header-right">
                  <Chevron isOpen={isOpen} />
                </div>
              </button>

              {isOpen ? (
                <div className="config-section-body">
                  <div className="config-files-title">Files in use</div>
                  <div className="config-files-list">
                    {Object.entries(section.filesUsed).map(([key, value]) => (
                      <div key={key} className="config-files-item">
                        <span className="config-files-label">{key}</span>
                        <div className="config-files-value">
                          <select
                            className="config-files-select"
                            value={value}
                            onChange={(event) =>
                              setFileMapping(section.id, key, event.target.value)
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
                </div>
              ) : null}
            </section>
          );
        })}
      </main>
    </div>
  );
}

function Chevron({ isOpen }: { isOpen: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`config-chevron ${isOpen ? "config-chevron-open" : ""}`}
    >
      ›
    </span>
  );
}
