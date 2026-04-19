import LandingIcon from './LandingIcon.jsx';

export default function CuponeraCard({ cuponera }) {
  const { treatment_name, package_name, sessions_used, total_sessions, available } = cuponera;
  const progressPercent = (sessions_used / total_sessions) * 100;

  return (
    <div className="fu-cupon">
      <div className="fu-cupon__head">
        <div>
          <div className="fu-cupon__name">{treatment_name}</div>
          <div className="fu-cupon__sub">{package_name}</div>
        </div>
        <div className="fu-cupon__count">
          <b>{available}</b>
          <small>/{total_sessions}</small>
        </div>
      </div>
      <div className="fu-cupon__bar">
        <div className="fu-cupon__bar-fill" style={{ width: `${progressPercent}%` }} />
      </div>
      <div className="fu-cupon__chips">
        {Array.from({ length: total_sessions }).map((_, i) => (
          <span
            key={i}
            className={`fu-cupon__chip${i < sessions_used ? ' used' : ''}`}
          >
            {i < sessions_used ? (
              <LandingIcon name="check" size={12} color="currentColor" />
            ) : (
              i + 1
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
