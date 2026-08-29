import { useGuest } from "../context/GuestContext.jsx";

export function InstallHint() {
  const { install } = useGuest();
  const { installed, canPrompt, promptInstall, needsManualInstructions } = install;

  if (installed) return null; // no need to keep suggesting it once it's done

  if (canPrompt) {
    return (
      <div
        onClick={promptInstall}
        style={{ textAlign: "center", font: "400 12.5px/1 'Helvetica Neue',Helvetica,sans-serif", color: "rgba(26,25,24,.4)", cursor: "pointer" }}
      >
        Save this gallery to your home screen
      </div>
    );
  }

  if (needsManualInstructions) {
    return (
      <div style={{ textAlign: "center", font: "400 12.5px/1 'Helvetica Neue',Helvetica,sans-serif", color: "rgba(26,25,24,.4)" }}>
        Tap Share, then "Add to Home Screen", to save this gallery
      </div>
    );
  }

  return null;
}
