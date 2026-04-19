import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/es';
import LandingIcon from './LandingIcon.jsx';
import { MONTHS_ES, paymentLabel, statusConfig } from '../utils/appointmentUtils.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es');

export default function AppointmentRow({ appointment, onClick }) {
  const dt = dayjs(appointment.scheduled_at).tz('America/Montevideo');
  const monthStr = MONTHS_ES[dt.month()];
  const dayNum = dt.date();
  const timeStr = dt.format('HH:mm');
  const sc = statusConfig(appointment.status);

  return (
    <button
      className="fu-appt fu-appt--click"
      onClick={onClick}
    >
      <div className="fu-appt__date">
        <small>{monthStr}</small>
        <b>{dayNum}</b>
      </div>
      <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
        <h4 className="fu-appt__title">{appointment.treatment_name}</h4>
        <p className="fu-appt__meta">
          {timeStr}
          {appointment.duration_minutes ? ` · ${appointment.duration_minutes} min` : ''}
          {appointment.payment_method_expected ? ` · ${paymentLabel(appointment.payment_method_expected)}` : ''}
        </p>
      </div>
      <span className={`fu-appt__status${sc.cssModifier ? ` fu-appt__status${sc.cssModifier}` : ''}`}>{sc.label}</span>
      <LandingIcon name="chevron_right" size={18} color="var(--fu-ink-400)" />
    </button>
  );
}
