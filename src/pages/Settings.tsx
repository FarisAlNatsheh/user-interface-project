// Settings.tsx
import { useMemo, useState } from "react";

type TimeFormat = "DD/mm/yyyy" | "mm/DD/yyyy" | "yyyy-mm-DD"; // keep only DD/mm/yyyy in UI, others optional

type SettingsState = {
  timeFormat: TimeFormat;
};

const DEFAULTS: SettingsState = {
  timeFormat: "DD/mm/yyyy",
};

export default function Settings() {
  // Replace with real persistence later (Tauri store / invoke)
  const [settings, setSettings] = useState<SettingsState>(DEFAULTS);

  const isDirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(DEFAULTS),
    [settings]
  );

  function setTimeFormat(v: TimeFormat) {
    setSettings((p) => ({ ...p, timeFormat: v }));
  }

  async function resetAllSecrets() {
    // Hook this to your real Tauri command later
    // await invoke("reset_all_secrets")
    const ok = confirm("Reset all secrets? This cannot be undone.");
    if (!ok) return;
    console.log("Resetting all secrets...");
  }

  // Optional: if you want to persist these settings, wire your save logic
  async function save() {
    // await invoke("save_settings", { settings })
    console.log("Saving settings:", settings);
  }

  return (
    <div className="page-shell settings-page">
      <header className="page-header settings-header">
        <div>
          <h1>Settings</h1>
          <p>Manage preferences and security actions.</p>
        </div>
        <button className="settings-button" onClick={save} disabled={!isDirty}>
          Save
        </button>
      </header>

      <section className="content-card settings-card">
        <div className="settings-row">
          <div className="settings-row-label">Time format</div>
          <select
            className="settings-select"
            value={settings.timeFormat}
            onChange={(e) => setTimeFormat(e.target.value as TimeFormat)}
          >
            <option value="DD/mm/yyyy">DD/mm/yyyy</option>
          </select>
        </div>

        <div className="settings-divider" />

        <div className="settings-row">
          <div className="settings-row-label">Reset secrets</div>
          <button className="settings-button settings-button-danger" onClick={resetAllSecrets}>
            Reset all secrets
          </button>
        </div>
      </section>
    </div>
  );
}
