const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function paymentLabel(method) {
  const labels = {
    tarjeta: 'Tarjeta',
    seña: 'Seña online',
    deposito: 'Seña online',
    transferencia: 'Transferencia',
    efectivo: 'Efectivo',
  };
  return labels[method] || method || '';
}

function statusConfig(status) {
  const map = {
    pending: { label: 'Pendiente', cssModifier: '--pending' },
    confirmed: { label: 'Confirmada', cssModifier: '' },
    completed: { label: 'Realizada', cssModifier: '--done' },
    reserved: { label: 'Pago en clínica', cssModifier: '--reserved' },
    no_show: { label: 'Ausente', cssModifier: '' },
    cancelled: { label: 'Cancelada', cssModifier: '--cancelled' },
  };
  const config = map[status] || { label: status, cssModifier: '' };
  return config;
}

export { MONTHS_ES, paymentLabel, statusConfig };
