import { useSession } from "../context/SessionContext.jsx";

export function InstallHint() {
  const { install } = useSession();
  const { installed, canPrompt, promptInstall, needsManualInstructions } = install;

  if (installed) {
    return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 0", borderTop: "1px solid rgba(242,240,236,.09)" }}>
        <span style={{ font: "400 14.5px/1 'Helvetica Neue',Helvetica,sans-serif", color: "#F2F0EC" }}>Installed as an app</span>
        <span style={{ font: "400 12px/1 'IBM Plex Mono',monospace", color: "oklch(0.75 0.15 145)" }}>✓ DONE</span>
      </div>
    );
  }

  if (canPrompt) {
    return (
      <div
        onClick={promptInstall}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 0", borderTop: "1px solid rgba(242,240,236,.09)", cursor: "pointer" }}
      >
        <span style={{ font: "400 14.5px/1 'Helvetica Neue',Helvetica,sans-serif", color: "#F2F0EC" }}>Install Tether as an app</span>
        <span style={{ font: "400 12px/1 'IBM Plex Mono',monospace", color: "rgba(242,240,236,.5)" }}>INSTALL</span>
      </div>
    );
  }

  if (needsManualInstructions) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "15px 0", borderTop: "1px solid rgba(242,240,236,.09)" }}>
        <span style={{ font: "400 14.5px/1 'Helvetica Neue',Helvetica,sans-serif", color: "#F2F0EC" }}>Install as an app</span>
        <span style={{ font: "400 12px/1.5 'Helvetica Neue',Helvetica,sans-serif", color: "rgba(242,240,236,.45)" }}>
          Tap Share, then "Add to Home Screen".
        </span>
      </div>
    );
  }

  return null;
}
