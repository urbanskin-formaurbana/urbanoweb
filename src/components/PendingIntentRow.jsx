import LandingIcon from './LandingIcon.jsx';
import { paymentLabel } from '../utils/appointmentUtils.js';

export default function PendingIntentRow({ intent, onClick }) {
  // Show PAGA if payment is completed, IMPAGA if pending
  const isPaid = intent.status === 'completed';
  const sc = {
    label: isPaid ? 'PAGA' : 'IMPAGA',
    cssModifier: isPaid ? ' fu-appt__status--done' : ' fu-appt__status--pending'
  };

  return (
    <button
      className="fu-appt fu-appt--click"
      onClick={onClick}
    >
      <div className="fu-appt__date">
        <small>?</small>
        <b>?</b>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 className="fu-appt__title">{intent.treatment_name}</h4>
        <p className="fu-appt__meta">
          {paymentLabel(intent.payment_method)} · ${Number(intent.amount).toLocaleString("es-UY")}
        </p>
      </div>
      <span className={`fu-appt__status${sc.cssModifier}`}>{sc.label}</span>
      <LandingIcon name="chevron_right" size={18} color="var(--fu-ink-400)" />
    </button>
  );
}
