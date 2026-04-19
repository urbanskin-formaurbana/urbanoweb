import LandingIcon from "./LandingIcon.jsx";

export default function AttentionBanner({
  title,
  subtitle,
  iconName = "priority_high",
}) {
  return (
    <div className="fu-attn">
      <div className="fu-attn__icon">
        <LandingIcon name={iconName} size={20} color="#fff" />
      </div>
      <div>
        <h3 className="fu-attn__title">{title}</h3>
        <p className="fu-attn__sub">{subtitle}</p>
      </div>
    </div>
  );
}
