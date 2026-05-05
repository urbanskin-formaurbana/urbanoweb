import RichTextDescriptionEditor from "../RichTextDescriptionEditor.jsx";

function safeCategoryLabel(category) {
  if (!category) return "Tratamiento";
  const map = {
    body: "Estética Corporal",
    facial: "Estética Facial",
    complementarios: "Complementarios",
  };
  return map[category] || category;
}

function hasDescriptionContent(value) {
  if (!value) return false;
  const stripped = String(value)
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
  return stripped.length > 0;
}

export default function TreatmentIntroBlock({ category, title, subtitle, description, duration, price, evaluationPrice }) {
  const showDescription = hasDescriptionContent(description);
  return (
    <section className="fu-detail__hero">
      <div className="fu-container">
        <div className="fu-detail__hero-inner" style={{ gridTemplateColumns: "1fr", maxWidth: 900 }}>
          <div>
            <div className="fu-detail__tag">{safeCategoryLabel(category)}</div>
            <h1 className="fu-detail__title" style={{ fontSize: "clamp(34px, 5vw, 56px)" }}>{title}</h1>
            {subtitle && <p className="fu-detail__sub">{subtitle}.</p>}
            {showDescription ? (
              <RichTextDescriptionEditor
                value={description}
                readOnly
                label={null}
                sx={{
                  color: "rgba(255,255,255,0.84)",
                  maxWidth: 780,
                  "& p": { margin: "0 0 12px", lineHeight: 1.6, fontSize: 16 },
                  "& ul, & ol": { margin: "0 0 12px", paddingLeft: "20px" },
                  "& li": { marginBottom: "6px" },
                  "& a": { color: "#9fd1a2" },
                }}
              />
            ) : (
              <p
                className="fu-detail__sub"
                style={{
                  fontStyle: "italic",
                  color: "rgba(255,255,255,0.7)",
                  maxWidth: 780,
                }}
              >
                Descripción no disponible.
              </p>
            )}
            <div className="fu-detail__metaline" style={{ marginBottom: 0 }}>
              <div>
                <div className="fu-detail__meta-label">Duración</div>
                <div className="fu-detail__meta-value">{duration}</div>
              </div>
              <div>
                <div className="fu-detail__meta-label">Sesión</div>
                <div className="fu-detail__meta-value">{price}</div>
              </div>
              {evaluationPrice && (
                <div>
                  <div className="fu-detail__meta-label">Evaluación</div>
                  <div className="fu-detail__meta-value">{evaluationPrice}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
