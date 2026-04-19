function labelValueRow(label, value, key) {
  return (
    <li key={key}>
      <span>{label}</span>
      <b>{value}</b>
    </li>
  );
}

export default function BookingSummaryCard({
  label = "Tu reserva",
  title,
  rows = [],
  totalLabel = "Total",
  totalValue,
  children,
}) {
  return (
    <aside className="fu-summary">
      <div className="fu-summary__label">{label}</div>
      {title && <h3 className="fu-summary__title">{title}</h3>}
      <ul className="fu-summary__list">{rows.map((row, idx) => labelValueRow(row.label, row.value, `${row.label}-${idx}`))}</ul>
      <div className="fu-summary__total">
        <span className="fu-summary__total-label">{totalLabel}</span>
        <span className="fu-summary__total-value">{totalValue}</span>
      </div>
      {children}
    </aside>
  );
}
