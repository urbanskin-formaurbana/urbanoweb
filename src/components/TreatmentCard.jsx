import LandingIcon from "./LandingIcon.jsx";

function formatPrice(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "0";
  return parsed.toLocaleString("es-UY");
}

function formatDuration(treatment) {
  if (treatment?.duration) return treatment.duration;
  if (typeof treatment?.duration_minutes === "number") return `${treatment.duration_minutes} min`;
  return null;
}

export default function TreatmentCard({ treatment, onClick, showDesde = false }) {
  const duration = formatDuration(treatment);
  const hasSessionPromo =
    treatment.is_session_promo &&
    typeof treatment.promo_price === "number" &&
    treatment.promo_price > 0;
  const hasCuponeraPromo = !!treatment.is_cuponera_promo;
  const isFeatured = hasSessionPromo || hasCuponeraPromo;

  const className = `fu-tcard${isFeatured ? " fu-tcard--promo" : ""}`;

  return (
    <article
      id={treatment.slug ? `treatment-${treatment.slug}` : undefined}
      className={className}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="fu-tcard__media">
        {treatment.image_url ? (
          <img src={treatment.image_url} alt={treatment.name} loading="lazy" />
        ) : (
          <div className="fu-tcard__media-placeholder">Sin imagen</div>
        )}

        {duration && <span className="fu-tcard__tag">{duration}</span>}

        {hasSessionPromo && (
          <span className="fu-tcard__promo-badge">Oferta</span>
        )}
        {hasCuponeraPromo && !hasSessionPromo && (
          <span className="fu-tcard__promo-badge fu-tcard__promo-badge--cuponera">
            Promo en cuponera
          </span>
        )}
      </div>

      <div className="fu-tcard__body">
        {treatment.subtitle && <div className="fu-tcard__sub">{treatment.subtitle}</div>}
        <h3 className="fu-tcard__name">{treatment.name}</h3>

        <div className="fu-tcard__foot">
          <div className="fu-tcard__price">
            <small>Sesión</small>
            {hasSessionPromo ? (
              <>
                <span className="fu-tcard__price-old">${formatPrice(treatment.price)}</span>{" "}
                <span className="fu-tcard__price-new">${formatPrice(treatment.promo_price)}</span>
              </>
            ) : (
              <>
                {showDesde && "Desde "}${formatPrice(treatment.price)}
              </>
            )}
          </div>
          <span className="fu-tcard__go">
            Ver <LandingIcon name="arrow_forward" size={16} color="currentColor" />
          </span>
        </div>

        {hasCuponeraPromo && (
          <div className="fu-tcard__promo-hint">Promo disponible en cuponera</div>
        )}
      </div>
    </article>
  );
}
