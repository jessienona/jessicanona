import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGuest } from "../context/GuestContext.jsx";
import { api } from "../lib/api.js";
import { embedSelfie, findMatches } from "../lib/faceMatch.js";

const STAGE_COPY = {
  prompt: {
    glyph: "CAMERA",
    title: "Find your photos",
    body: "Take one selfie and we will pull every shot you appear in.",
    cta: "Take a selfie",
  },
  matching: {
    glyph: "MATCHING",
    title: "Matching…",
    cta: "Matching…",
  },
  "no-face": {
    glyph: "RETRY",
    title: "Couldn't see a face",
    body: "Try again with better light, facing the camera.",
    cta: "Try again",
  },
};

export function FindScreen() {
  const navigate = useNavigate();
  const { slug, session, photos, setMatchedIds, showToast } = useGuest();
  const [stage, setStage] = useState("prompt");
  const [foundCount, setFoundCount] = useState(0);
  const inputRef = useRef(null);

  async function onSelfie(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setStage("matching");
    try {
      const selfieEmbedding = await embedSelfie(file);
      if (!selfieEmbedding) {
        setStage("no-face");
        return;
      }
      const { embeddings } = await api.embeddings(slug);
      const matches = findMatches(selfieEmbedding, embeddings);
      setFoundCount(matches.length);
      setMatchedIds(matches);
      setStage("result");
    } catch (err) {
      console.error(err);
      showToast("Matching failed — try browsing everything instead.", "ERROR");
      setStage("prompt");
    }
  }

  const copy =
    stage === "result"
      ? {
          glyph: `${foundCount} FOUND`,
          title: foundCount === 1 ? "1 photo of you" : `${foundCount} photos of you`,
          body:
            foundCount > 0
              ? "Found across the gallery. Download them all at once."
              : "No matches yet — the gallery still has everything, browse it instead.",
          cta: foundCount > 0 ? `See my ${foundCount} photo${foundCount === 1 ? "" : "s"}` : "Browse everything",
        }
      : STAGE_COPY[stage];

  function onCta() {
    if (stage === "prompt" || stage === "no-face") {
      inputRef.current?.click();
      return;
    }
    if (stage === "result") {
      navigate(`/g/${slug}/gallery`);
    }
  }

  return (
    <>
      <div style={{ padding: "calc(env(safe-area-inset-top) + 12px) 22px 0", flex: "none" }}>
        <span onClick={() => navigate(`/g/${slug}/gallery`)} style={{ font: "400 14px/1 'Helvetica Neue',Helvetica,sans-serif", color: "rgba(26,25,24,.5)", cursor: "pointer" }}>
          ‹ Gallery
        </span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, padding: "20px 34px", textAlign: "center" }}>
        <div style={{ width: 168, height: 168, borderRadius: "50%", background: "#dcd6cb", position: "relative", overflow: "hidden", border: "1px solid rgba(26,25,24,.12)" }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", font: "400 9.5px/1 'IBM Plex Mono',monospace", color: "rgba(26,25,24,.45)", letterSpacing: ".1em" }}>
            {copy.glyph}
          </div>
        </div>
        <div>
          <div style={{ font: "300 30px/1.2 'Cormorant Garamond',serif", color: "#1A1918" }}>{copy.title}</div>
          <div style={{ font: "400 14px/1.65 'Helvetica Neue',Helvetica,sans-serif", color: "rgba(26,25,24,.58)", marginTop: 11, maxWidth: 250 }}>
            {copy.body ?? `Comparing against ${photos.length.toLocaleString()} photos, on this device.`}
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(26,25,24,.12)", paddingTop: 18, font: "400 11.5px/1.6 'Helvetica Neue',Helvetica,sans-serif", color: "rgba(26,25,24,.45)", maxWidth: 262 }}>
          Matching happens on your phone. The selfie is never uploaded and is deleted when you leave.
        </div>
      </div>
      <div style={{ flex: "none", padding: "0 28px max(38px, env(safe-area-inset-bottom))", display: "flex", flexDirection: "column", gap: 12 }}>
        <input ref={inputRef} type="file" accept="image/*" capture="user" hidden onChange={onSelfie} />
        <div
          onClick={onCta}
          style={{
            height: 54,
            borderRadius: 13,
            background: "#1A1918",
            color: "#F4F1EC",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            font: "500 16px/1 'Helvetica Neue',Helvetica,sans-serif",
            cursor: stage === "matching" ? "default" : "pointer",
            opacity: stage === "matching" ? 0.6 : 1,
          }}
        >
          {copy.cta}
        </div>
        <div onClick={() => navigate(`/g/${slug}/gallery`)} style={{ textAlign: "center", font: "400 13.5px/1 'Helvetica Neue',Helvetica,sans-serif", color: "rgba(26,25,24,.45)", cursor: "pointer" }}>
          Browse everything instead
        </div>
      </div>
    </>
  );
}
