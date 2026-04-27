import LandingIcon from "./LandingIcon.jsx";

export default function AttentionBanner({
  title,
  subtitle,
  iconName,
  tone = "urgent",
}) {
  const resolvedIcon = iconName || (tone === "info" ? "schedule" : "priority_high");
  return (
    <div className={`fu-attn fu-attn--${tone}`}>
      <div className="fu-attn__icon">
        <LandingIcon name={resolvedIcon} size={20} color="#fff" />
      </div>
      <div>
        <h3 className="fu-attn__title">{title}</h3>
        <p className="fu-attn__sub">{subtitle}</p>
      </div>
    </div>
  );
}
