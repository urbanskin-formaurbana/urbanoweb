export default function BookingPanel({ title, lead, children, className = "" }) {
  return (
    <section className={`fu-panel ${className}`.trim()}>
      {title && <h2 className="fu-panel__title">{title}</h2>}
      {lead && <p className="fu-panel__lead">{lead}</p>}
      {children}
    </section>
  );
}
