// Settings.tsx
import { useMemo, useState } from "react";
import { Settings as SettingsIcon } from "lucide-react";

type TimeFormat = "DD/mm/yyyy" | "mm/DD/yyyy" | "yyyy-mm-DD"; // keep only DD/mm/yyyy in UI, others optional

type SettingsState = {
  timeFormat: TimeFormat;
  autoRefresh: boolean;
  alertDigest: boolean;
};

const DEFAULTS: SettingsState = {
  timeFormat: "DD/mm/yyyy",
  autoRefresh: true,
  alertDigest: false,
};

export default function Settings() {
  // Replace with real persistence later (Tauri store / invoke)
  const [settings, setSettings] = useState<SettingsState>(DEFAULTS);
  const connectedPcName = "FARIS_PC";

  const isDirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(DEFAULTS),
    [settings]
  );

  function setTimeFormat(v: TimeFormat) {
    setSettings((p) => ({ ...p, timeFormat: v }));
  }

  function toggleAutoRefresh() {
    setSettings((p) => ({ ...p, autoRefresh: !p.autoRefresh }));
  }

  function toggleAlertDigest() {
    setSettings((p) => ({ ...p, alertDigest: !p.alertDigest }));
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
          <h1 className="settings-title">
            <SettingsIcon size={22} />
            Settings
          </h1>
          <p>Manage preferences and security actions.</p>
        </div>
        <button className="settings-button" onClick={save} disabled={!isDirty}>
          Save
        </button>
      </header>

      <section className="content-card settings-card">
        <div className="settings-section">
          <div className="settings-section-title">Appearance</div>
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
          <div className="settings-row">
            <div className="settings-row-label">Auto-refresh dashboard</div>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={settings.autoRefresh}
                onChange={toggleAutoRefresh}
              />
              <span className="settings-toggle-track" aria-hidden="true" />
            </label>
          </div>
        </div>

        <div className="settings-divider" />

        <div className="settings-section">
          <div className="settings-section-title">Notifications</div>
          <div className="settings-row">
            <div className="settings-row-label">Daily alert digest</div>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={settings.alertDigest}
                onChange={toggleAlertDigest}
              />
              <span className="settings-toggle-track" aria-hidden="true" />
            </label>
          </div>
        </div>

        <div className="settings-divider" />

        <div className="settings-section">
          <div className="settings-section-title">Sync</div>
          <div className="settings-row">
            <div className="settings-row-label">Connected PC</div>
            <div className="settings-row-value">{connectedPcName}</div>
          </div>
        </div>

        <div className="settings-divider" />

        <div className="settings-section">
          <div className="settings-section-title">Security</div>
          <div className="settings-row">
            <div className="settings-row-label">Reset secrets</div>
            <button className="settings-button settings-button-danger" onClick={resetAllSecrets}>
              Reset all secrets
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
