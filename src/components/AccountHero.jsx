export default function AccountHero({ name, subtitle, stats }) {
  return (
    <div className="fu-account__hero">
      <div className="fu-container">
        <div className="fu-account__hello">Hola, socio/a</div>
        <h1 className="fu-account__name">{name}</h1>
        <p className="fu-account__sub">{subtitle}</p>
        <div className="fu-account__stats">
          {stats.map(({ num, label }) => (
            <div className="fu-account__stat" key={label}>
              <div className="fu-account__stat-num">{num}</div>
              <div className="fu-account__stat-label">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
