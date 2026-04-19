/* eslint-disable no-irregular-whitespace */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SEO from "../../components/SEO.jsx";
import { Alert, Box, CircularProgress } from "@mui/material";
import authService from "../../services/auth_service.js";
import { getProductTypes } from "../../services/campaign_service.js";
import treatmentService from "../../services/treatment_service.js";
import LoginModal from "../../components/LoginModal.jsx";
import PurchaseOptionsDialog from "../../components/PurchaseOptionsDialog.jsx";
import CampaignModal from "../../components/CampaignModal.jsx";
import TreatmentCard from "../../components/TreatmentCard.jsx";
import HeroSection from "../../components/HeroSection.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import heroBg from "../../assets/images/hero-bg.png";

function toPlainText(value) {
  if (!value) return "";
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }, []);

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [bodyTreatments, setBodyTreatments] = useState([]);
  const [facialTreatments, setFacialTreatments] = useState([]);
  const [complementaryTreatments, setComplementaryTreatments] = useState([]);
  const [treatmentsLoading, setTreatmentsLoading] = useState(true);
  const [treatmentsError, setTreatmentsError] = useState(null);
  const [canPurchasePackages, setCanPurchasePackages] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedTreatmentForPurchase, setSelectedTreatmentForPurchase] = useState(null);
  const [campaignModals, setCampaignModals] = useState({});
  const [campaignProducts, setCampaignProducts] = useState([]);
  const [treatmentsByCategory, setTreatmentsByCategory] = useState({});

  const heroCategories = useMemo(() => {
    const dynamic = campaignProducts.map((campaign) => ({
      label:
        campaign.product_label ||
        `${campaign.product_type.charAt(0).toUpperCase()}${campaign.product_type.slice(1)}`,
      anchor: campaign.product_type,
    }));

    return [
      { label: "Estética Corporal", anchor: "estetica-corporal" },
      { label: "Estética Facial", anchor: "estetica-facial" },
      ...dynamic,
      { label: "Complementarios", anchor: "complementarios" },
    ];
  }, [campaignProducts]);

  useEffect(() => {
    const cachedData = localStorage.getItem("homePageTreatmentsCache");
    if (cachedData) {
      try {
        const { treatments, products } = JSON.parse(cachedData);
        setBodyTreatments(treatments.filter((t) => t.category === "body"));
        setFacialTreatments(treatments.filter((t) => t.category === "facial"));
        setComplementaryTreatments(treatments.filter((t) => t.category === "complementarios"));
        const byCategory = {};
        treatments.forEach((treatment) => {
          if (!byCategory[treatment.category]) byCategory[treatment.category] = [];
          byCategory[treatment.category].push(treatment);
        });
        setTreatmentsByCategory(byCategory);
        setCampaignProducts(products);
        setTreatmentsLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem("homePageTreatmentsCache");
      }
    }

    treatmentService
      .getAllTreatments()
      .then((data) => {
        setBodyTreatments(data.filter((t) => t.category === "body"));
        setFacialTreatments(data.filter((t) => t.category === "facial"));
        setComplementaryTreatments(data.filter((t) => t.category === "complementarios"));

        const byCategory = {};
        data.forEach((treatment) => {
          if (!byCategory[treatment.category]) byCategory[treatment.category] = [];
          byCategory[treatment.category].push(treatment);
        });
        setTreatmentsByCategory(byCategory);

        getProductTypes()
          .then((types) => {
            const DEDICATED_SECTIONS = ["body", "facial", "complementarios"];
            const filtered = types.filter((type) => !DEDICATED_SECTIONS.includes(type.product_type));
            setCampaignProducts(filtered);
            localStorage.setItem("homePageTreatmentsCache", JSON.stringify({ treatments: data, products: filtered }));
          })
          .catch(() => {});
      })
      .catch((err) => {
        setTreatmentsError("No se pudieron cargar los tratamientos.");
      })
      .finally(() => setTreatmentsLoading(false));
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.user_type === "customer") {
      authService
        .getPurchaseEligibility()
        .then((data) => setCanPurchasePackages(data.can_purchase_packages))
        .catch(() => setCanPurchasePackages(false));
      return;
    }
    setCanPurchasePackages(false);
  }, [isAuthenticated, user]);

  const scrollToSection = (anchor) => {
    const el = document.getElementById(anchor);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const handleTreatmentClick = (treatment, productType = "body") => {
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }
    if (user?.user_type === "employee") {
      navigate("/admin");
      return;
    }

    // Only show purchase dialog for body treatments when user can purchase packages
    if (productType === "body" && canPurchasePackages) {
      setSelectedTreatmentForPurchase(treatment);
      setPurchaseDialogOpen(true);
      return;
    }

    navigate("/schedule", { state: { treatment, productType } });
  };

  const handlePurchaseConfirm = (packageId) => {
    navigate("/schedule", {
      state: {
        treatment: { name: selectedTreatmentForPurchase.name, slug: selectedTreatmentForPurchase.slug },
        selectedPackageId: packageId,
        productType: "body",
      },
    });
  };

  return (
    <>
      <SEO
        title="FORMA Urbana — Estética Corporal y Facial | Montevideo Centro"
        description="Tratamientos no invasivos de estética corporal y facial en Montevideo Centro. Sin agujas. Sin cirugías. Resultados reales."
      />

      <HeroSection
        isAuthenticated={isAuthenticated}
        onLogin={() => setLoginModalOpen(true)}
        onCategorySelect={scrollToSection}
        imageSrc={heroBg}
        categories={heroCategories}
      />

      {treatmentsLoading && (
        <div className="fu-container" style={{ paddingTop: 48, paddingBottom: 48, textAlign: "center" }}>
          <CircularProgress sx={{ color: "#2e7d32" }} />
        </div>
      )}

      {treatmentsError && !treatmentsLoading && (
        <div className="fu-container" style={{ paddingTop: 24, paddingBottom: 24 }}>
          <Alert severity="error">{treatmentsError}</Alert>
        </div>
      )}

      {!treatmentsLoading && !treatmentsError && (
        <>
          <section className="fu-section" id="estetica-corporal">
            <div className="fu-container">
              <div className="fu-section__head">
                <div className="fu-eyebrow">Estética Corporal</div>
                <h2 className="fu-section__title">Tecnología no invasiva, resultados reales.</h2>
                <p className="fu-section__desc">Elegí el tratamiento y reservá tu sesión en un par de clics.</p>
              </div>
              <div className="fu-grid">
                {bodyTreatments.map((treatment) => (
                  <TreatmentCard key={treatment.slug} treatment={treatment} onClick={() => handleTreatmentClick(treatment, "body")} />
                ))}
              </div>
            </div>
          </section>

          <section className="fu-section fu-section--alt" id="estetica-facial">
            <div className="fu-container">
              <div className="fu-section__head">
                <div className="fu-eyebrow">Estética Facial</div>
                <h2 className="fu-section__title">Cuidá tu piel con protocolos a medida.</h2>
                <p className="fu-section__desc">Elegí el tratamiento y reservá tu sesión en un par de clics.</p>
              </div>
              <div className="fu-grid">
                {facialTreatments.map((treatment) => (
                  <TreatmentCard key={treatment.slug} treatment={treatment} onClick={() => handleTreatmentClick(treatment, "facial")} />
                ))}
              </div>
            </div>
          </section>

          {campaignProducts.map((campaign) => {
            const productType = campaign.product_type;
            const campaignTreatments = treatmentsByCategory[productType] || [];
            const categoryLabel =
              campaign.product_label || `${productType.charAt(0).toUpperCase()}${productType.slice(1)}`;
            const categoryDescription = toPlainText(campaign.product_description);
            if (campaignTreatments.length === 0) return null;
            const hasGenderSplit = campaignTreatments.some((t) => t.gender);

            return (
              <Box key={productType} id={productType} sx={{ py: { xs: 6, md: 9 } }}>
                <div className="fu-container">
                  {campaign.image_url && (
                    <Box
                      component="img"
                      src={campaign.image_url}
                      alt={campaign.product_label}
                      sx={{ width: "100%", height: 400, objectFit: "cover", borderRadius: "12px", mb: 5, display: "block" }}
                    />
                  )}
                  <div className="fu-section__head">
                    <div className="fu-eyebrow">
                      {categoryLabel}
                    </div>
                    <h2 className="fu-section__title">
                      {categoryDescription || categoryLabel}
                    </h2>
                    <p className="fu-section__desc">Elegí el tratamiento y reservá tu sesión en un par de clics.</p>
                  </div>

                  {(() => {
                    const getMinPriceByGender = (gender) => {
                      const group = campaignTreatments.filter((t) => t.gender === gender);
                      if (!group.length) return null;
                      const min = Math.min(...group.map((t) => t.price || Infinity));
                      return min === Infinity ? null : min;
                    };

                    const overallMinPrice = (() => {
                      const min = Math.min(...campaignTreatments.map((t) => t.price || Infinity));
                      return min === Infinity ? null : min;
                    })();

                    return (
                      <div className="fu-grid">
                        {hasGenderSplit ? (
                          [{ gender: "hombres", label: "Hombres" }, { gender: "mujeres", label: "Mujeres" }].map(({ gender, label }) => {
                            const genderMinPrice = getMinPriceByGender(gender);
                            return (
                              <TreatmentCard
                                key={gender}
                                treatment={{
                                  slug: `${productType}-${gender}`,
                                  subtitle: "Ver zonas y paquetes disponibles",
                                  name: label,
                                  price: genderMinPrice || 0,
                                  image_url: null,
                                }}
                                onClick={() => setCampaignModals((prev) => ({ ...prev, [`${productType}-${gender}`]: true }))}
                              />
                            );
                          })
                        ) : (
                          <TreatmentCard
                            treatment={{
                              slug: productType,
                              subtitle: "Zonas y paquetes personalizados",
                              name: "Consultar disponibilidad",
                              price: overallMinPrice || 0,
                              image_url: null,
                            }}
                            onClick={() => setCampaignModals((prev) => ({ ...prev, [productType]: true }))}
                          />
                        )}
                      </div>
                    );
                  })()}
                </div>
              </Box>
            );
          })}

          {complementaryTreatments.length > 0 && (
            <section className="fu-section" id="complementarios">
              <div className="fu-container">
                <div className="fu-section__head">
                  <div className="fu-eyebrow">Complementarios</div>
                  <h2 className="fu-section__title">Servicios que complementan tus tratamientos principales</h2>
                  <p className="fu-section__desc">Elegí el tratamiento y reservá tu sesión en un par de clics.</p>
                </div>
                <div className="fu-grid">
                  {complementaryTreatments.map((treatment) => (
                    <TreatmentCard key={treatment.slug} treatment={treatment} onClick={() => handleTreatmentClick(treatment, "complementarios")} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      <LoginModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} onSuccess={() => setLoginModalOpen(false)} />

      <PurchaseOptionsDialog
        open={purchaseDialogOpen}
        onClose={() => setPurchaseDialogOpen(false)}
        treatment={selectedTreatmentForPurchase}
        onConfirm={handlePurchaseConfirm}
      />

      {campaignProducts.map((campaign) => {
        const productType = campaign.product_type;
        const label = campaign.product_label || `${productType.charAt(0).toUpperCase()}${productType.slice(1)}`;
        const campaignTreatments = treatmentsByCategory[productType] || [];
        const hasGenderSplit = campaignTreatments.some((t) => t.gender);

        if (hasGenderSplit) {
          return (
            <Box key={productType}>
              {["hombres", "mujeres"].map((gender) => {
                const modalKey = `${productType}-${gender}`;
                return (
                  <CampaignModal
                    key={modalKey}
                    open={campaignModals[modalKey] || false}
                    onClose={() => setCampaignModals((prev) => ({ ...prev, [modalKey]: false }))}
                    gender={gender}
                    treatments={campaignTreatments.filter((t) => t.gender === gender)}
                    isAuthenticated={isAuthenticated}
                    onLoginRequired={() => {
                      setCampaignModals((prev) => ({ ...prev, [modalKey]: false }));
                      setLoginModalOpen(true);
                    }}
                    productType={productType}
                    modalTitle={`${label} - ${gender === "hombres" ? "Hombres" : "Mujeres"}`}
                  />
                );
              })}
            </Box>
          );
        }

        const modalKey = productType;
        return (
          <CampaignModal
            key={modalKey}
            open={campaignModals[modalKey] || false}
            onClose={() => setCampaignModals((prev) => ({ ...prev, [modalKey]: false }))}
            treatments={campaignTreatments}
            isAuthenticated={isAuthenticated}
            onLoginRequired={() => {
              setCampaignModals((prev) => ({ ...prev, [modalKey]: false }));
              setLoginModalOpen(true);
            }}
            productType={productType}
            modalTitle={label}
          />
        );
      })}

    </>
  );
}
