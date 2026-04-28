import { useEffect, useRef, useState } from "react";
import treatmentService from "../services/treatment_service.js";

function formatPrice(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return "$" + Math.round(parsed).toLocaleString("es-UY");
}

function discountPct(originalPrice, price) {
  if (!originalPrice || !price || originalPrice <= 0) return 0;
  const pct = Math.round((1 - price / originalPrice) * 100);
  return pct > 0 ? pct : 0;
}

function buildSessionPromoOption(treatment) {
  if (
    !treatment.is_session_promo ||
    typeof treatment.promo_price !== "number" ||
    treatment.promo_price <= 0 ||
    typeof treatment.price !== "number" ||
    treatment.price <= 0
  ) {
    return null;
  }
  const pct = discountPct(treatment.price, treatment.promo_price);
  if (pct <= 0) return null;
  return {
    kind: "session",
    pct,
    priceFrom: treatment.promo_price,
    tag: "Sesión única",
  };
}

function buildCuponeraOption(pkg) {
  if (!pkg || !pkg.is_promotional) return null;
  const pct = discountPct(pkg.original_price, pkg.price);
  if (pct <= 0) return null;
  const sessions = Number(pkg.session_count) || 0;
  const pricePerSession = sessions > 0 ? pkg.price / sessions : pkg.price;
  const tag =
    sessions > 0
      ? `${sessions} ${sessions === 1 ? "sesión" : "sesiones"}`
      : pkg.promo_label || "Cuponera";
  return {
    kind: "cuponera",
    pct,
    priceFrom: pricePerSession,
    tag,
  };
}

function pickBestOffer(treatment, packagesData) {
  const candidates = [];
  const sessionOpt = buildSessionPromoOption(treatment);
  if (sessionOpt) candidates.push(sessionOpt);

  const pkgs = packagesData?.packages || [];
  pkgs.forEach((pkg) => {
    const opt = buildCuponeraOption(pkg);
    if (opt) candidates.push(opt);
  });

  if (!candidates.length) return null;
  candidates.sort((a, b) => {
    if (b.pct !== a.pct) return b.pct - a.pct;
    return a.priceFrom - b.priceFrom;
  });
  return candidates[0];
}

function ArrowRight({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M2 8h11M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Spark() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M7 0l1.5 4.5L13 7l-4.5 1.5L7 13 5.5 8.5 1 7l4.5-1.5z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function PromoOffersBlock({ treatments, onSelect }) {
  const listRef = useRef(null);
  const [active, setActive] = useState(0);
  const [packagesBySlug, setPackagesBySlug] = useState({});

  useEffect(() => {
    if (!treatments || treatments.length === 0) return undefined;
    const slugsToFetch = treatments
      .filter((t) => t.is_cuponera_promo && t.slug && !packagesBySlug[t.slug])
      .map((t) => t.slug);
    if (slugsToFetch.length === 0) return undefined;

    let cancelled = false;
    Promise.all(
      slugsToFetch.map((slug) =>
        treatmentService
          .getTreatmentPackages(slug)
          .then((data) => [slug, data])
          .catch(() => [slug, null])
      )
    ).then((results) => {
      if (cancelled) return;
      setPackagesBySlug((prev) => {
        const next = { ...prev };
        results.forEach(([slug, data]) => {
          next[slug] = data;
        });
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [treatments, packagesBySlug]);

  if (!treatments || treatments.length === 0) return null;

  const enriched = treatments
    .map((t) => ({
      treatment: t,
      offer: pickBestOffer(t, packagesBySlug[t.slug]),
    }))
    .filter((row) => row.offer !== null);

  if (enriched.length === 0) return null;

  const count = enriched.length;
  const titleLead =
    count === 1
      ? "Tenemos un tratamiento en oferta"
      : `Tenemos ${count} tratamientos en oferta`;

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const items = el.querySelectorAll(".fu-promo-block__item");
    if (!items.length) return;
    const scrollLeft = el.scrollLeft;
    let nearest = 0;
    let nearestDist = Infinity;
    items.forEach((it, i) => {
      const d = Math.abs(it.offsetLeft - el.offsetLeft - scrollLeft);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = i;
      }
    });
    setActive(nearest);
  };

  return (
    <div className="fu-promo-block-wrap">
      <div className="fu-container">
        <div
          className="fu-promo-block"
          role="region"
          aria-label="Tratamientos en oferta"
        >
          <div className="fu-promo-block__inner">
            <div className="fu-promo-block__header">
              <div className="fu-promo-block__label">
                <Spark /> OFERTAS ACTIVAS
              </div>
              <div className="fu-promo-block__title">
                {titleLead}
                <span className="fu-promo-block__title-em"> este mes.</span>
              </div>
            </div>
            <ul
              className="fu-promo-block__list"
              ref={listRef}
              onScroll={handleScroll}
            >
              {enriched.map(({ treatment, offer }) => (
                <li key={treatment.slug} className="fu-promo-block__item">
                  <button
                    type="button"
                    className="fu-promo-block__btn"
                    onClick={() => onSelect?.(treatment)}
                  >
                    <div className="fu-promo-block__btn-top">
                      <span className="fu-promo-block__discount">
                        {offer.pct}% OFF
                      </span>
                      <span className="fu-promo-block__tag">{offer.tag}</span>
                    </div>
                    <div className="fu-promo-block__name">{treatment.name}</div>
                    <div className="fu-promo-block__btn-bottom">
                      <span className="fu-promo-block__price">
                        Desde <strong>{formatPrice(offer.priceFrom)}</strong>
                      </span>
                      <span
                        className="fu-promo-block__arrow"
                        aria-hidden="true"
                      >
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            {count > 1 && (
              <div className="fu-promo-block__dots" aria-hidden="true">
                {enriched.map((_, i) => (
                  <span
                    key={i}
                    className={`fu-promo-block__dot${
                      i === active ? " fu-promo-block__dot--active" : ""
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
