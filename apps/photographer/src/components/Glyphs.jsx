const PATTERN = [1, 1, 1, 1, 0, 1, 1, 1, 0];

/** The small 3x3 "finder corner" glyph used as a QR shorthand icon in the design. */
export function QrGlyph({ color }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,4px)", gridTemplateRows: "repeat(3,4px)", gap: 2 }}>
      {PATTERN.map((v, i) => (
        <div key={i} style={{ background: v ? color : "transparent", borderRadius: 1 }} />
      ))}
    </div>
  );
}
