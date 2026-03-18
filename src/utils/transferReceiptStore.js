/**
 * Simple module-level store to hold a File object in memory
 * Used to pass bank transfer receipt between PaymentPage and SchedulingPage
 * (File objects cannot be serialized through React Router's navigate() state)
 */
const transferReceiptStore = {
  file: null,
};

export default transferReceiptStore;
