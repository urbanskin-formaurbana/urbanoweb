/**
 * UrbanSkin Analytics Wrapper
 *
 * Centralized GTM dataLayer interface. Every analytics event in the app should
 * go through this module so we can swap providers, debug, or disable tracking
 * from a single place.
 *
 * Convention:
 *   - Standard GA4 ecommerce events use GA4 names (purchase, begin_checkout, etc.)
 *   - Custom events use snake_case prefixed by domain (appointment_*, campaign_*)
 *   - Every event sends `event` + a flat payload; ecommerce events nest under `ecommerce`
 *
 * Schema for a treatment item (used in `items[]`):
 *   {
 *     item_id:       treatment.slug or treatment.id,
 *     item_name:     treatment.name,
 *     item_category: treatment.category ('body' | 'facial' | 'complementarios' | campaign),
 *     item_variant:  package_id | 'evaluation' | 'single' (optional),
 *     price:         number (UYU),
 *     quantity:      1
 *   }
 */

const isDev = import.meta.env.DEV;
const CURRENCY = "UYU";

function push(payload) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  // Reset ecommerce object before each ecommerce event to avoid stale data
  if (payload.ecommerce) {
    window.dataLayer.push({ ecommerce: null });
  }
  window.dataLayer.push(payload);
  if (isDev) {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", payload.event, payload);
  }
}

function toItem(treatment, overrides = {}) {
  if (!treatment) return null;
  return {
    item_id: treatment.slug || treatment.id || "unknown",
    item_name: treatment.name || "unknown",
    item_category: treatment.category || overrides.item_category || "general",
    item_variant: overrides.item_variant,
    price: Number(overrides.price ?? treatment.price ?? 0),
    quantity: 1,
    ...overrides,
  };
}

const analytics = {
  // ─── Discovery / Browsing ──────────────────────────────────────────────

  /**
   * User landed on the homepage and the treatment lists rendered.
   * Fire once per category list to populate "Most viewed services" reports.
   * @param {string} listName  e.g. 'body' | 'facial' | 'complementarios' | 'campaign:depilacion'
   * @param {Array}  treatments
   */
  trackViewItemList(listName, treatments = []) {
    push({
      event: "view_item_list",
      ecommerce: {
        currency: CURRENCY,
        item_list_id: listName,
        item_list_name: listName,
        items: treatments.map((t, idx) =>
          toItem(t, { index: idx, item_list_name: listName }),
        ),
      },
    });
  },

  /**
   * User clicked a treatment card (opens detail or starts booking).
   */
  trackSelectItem(treatment, listName) {
    push({
      event: "select_item",
      ecommerce: {
        currency: CURRENCY,
        item_list_id: listName,
        item_list_name: listName,
        items: [toItem(treatment, { item_list_name: listName })],
      },
    });
  },

  /**
   * Detail surface opened (PurchaseOptionsDialog, treatment description, etc.).
   */
  trackViewItem(treatment) {
    const price = Number(treatment?.price ?? 0);
    push({
      event: "view_item",
      ecommerce: {
        currency: CURRENCY,
        value: price,
        items: [toItem(treatment)],
      },
    });
  },

  // ─── Campaigns ─────────────────────────────────────────────────────────

  /**
   * User opened a CampaignModal (depilación zonas, paquetes, etc.).
   */
  trackCampaignViewed({ productType, gender }) {
    push({
      event: "campaign_viewed",
      campaign_product_type: productType,
      campaign_gender: gender || null,
    });
  },

  /**
   * User clicked "Contratar" on a zona/paquete inside a campaign modal.
   */
  trackCampaignItemSelected({ productType, gender, item }) {
    push({
      event: "campaign_item_selected",
      campaign_product_type: productType,
      campaign_gender: gender || null,
      ecommerce: {
        currency: CURRENCY,
        items: [
          toItem(item, {
            item_category: `campaign:${productType}`,
            item_variant: item?.item_type,
          }),
        ],
      },
    });
  },

  /**
   * Campaign had no slots — user joined the waitlist.
   */
  trackJoinWaitlist({ productType, gender }) {
    push({
      event: "join_waitlist",
      campaign_product_type: productType,
      campaign_gender: gender || null,
    });
  },

  // ─── Auth ──────────────────────────────────────────────────────────────

  /**
   * Successful login. Pass auth_method = 'google'.
   * isNewUser is optional — only set to true on first registration.
   */
  trackLogin({ authMethod, userId, isNewUser = false }) {
    push({
      event: isNewUser ? "sign_up" : "login",
      method: authMethod,
      user_id: userId || null,
    });
  },

  /**
   * Click on the login provider button (before completion). Useful to detect
   * abandonment after the OAuth popup opens.
   */
  trackLoginAttempt(authMethod) {
    push({
      event: "login_attempt",
      method: authMethod,
    });
  },

  /**
   * Login provider returned an error.
   */
  trackLoginError({ authMethod, error }) {
    push({
      event: "login_error",
      method: authMethod,
      error_message: error?.message || String(error),
    });
  },

  // ─── Booking flow ──────────────────────────────────────────────────────

  /**
   * User reached SchedulingPage (treatment chosen, picking date/time).
   * GA4 standard event.
   */
  trackBeginCheckout({ treatment, isEvaluation = false, packageId = null }) {
    const price = Number(treatment?.price ?? 0);
    push({
      event: "begin_checkout",
      ecommerce: {
        currency: CURRENCY,
        value: price,
        items: [
          toItem(treatment, {
            item_variant: isEvaluation
              ? "evaluation"
              : packageId
                ? `package:${packageId}`
                : "single",
            price,
          }),
        ],
      },
    });
  },

  /**
   * Date selected in the calendar.
   */
  trackDateSelected({ treatment, selectedDate }) {
    push({
      event: "date_selected",
      selected_date: selectedDate,
      treatment_slug: treatment?.slug,
    });
  },

  /**
   * Time slot selected.
   */
  trackTimeSlotSelected({ treatment, selectedDate, selectedTime }) {
    push({
      event: "time_slot_selected",
      selected_date: selectedDate,
      selected_time: selectedTime,
      treatment_slug: treatment?.slug,
    });
  },

  /**
   * GA4 standard add_shipping_info — fired when user finalized date+time and
   * navigates to /payment. We treat the appointment slot as the "shipping" step.
   */
  trackAddShippingInfo({
    treatment,
    selectedDate,
    selectedTime,
    isEvaluation = false,
  }) {
    const price = Number(treatment?.price ?? 0);
    push({
      event: "add_shipping_info",
      ecommerce: {
        currency: CURRENCY,
        value: price,
        shipping_tier: `${selectedDate} ${selectedTime}`,
        items: [
          toItem(treatment, {
            item_variant: isEvaluation ? "evaluation" : "single",
          }),
        ],
      },
    });
  },

  // ─── Payment ───────────────────────────────────────────────────────────

  /**
   * User picked a payment method (tarjeta / deposito / transferencia / efectivo).
   */
  trackPaymentMethodSelected({ paymentMethod, treatment }) {
    push({
      event: "payment_method_selected",
      payment_type: paymentMethod,
      treatment_slug: treatment?.slug,
    });
  },

  /**
   * GA4 standard add_payment_info — user submitted profile + chose method and
   * is about to complete the transaction (card, transfer, cash).
   */
  trackAddPaymentInfo({ treatment, paymentMethod, value, isEvaluation }) {
    push({
      event: "add_payment_info",
      payment_type: paymentMethod,
      ecommerce: {
        currency: CURRENCY,
        value: Number(value || 0),
        items: [
          toItem(treatment, {
            item_variant: isEvaluation ? "evaluation" : "single",
            price: Number(value || 0),
          }),
        ],
      },
    });
  },

  /**
   * GA4 standard purchase — payment approved (card via MercadoPago).
   * Value should be the FINAL amount charged (with MP fee for tarjeta).
   */
  trackPurchase({
    treatment,
    transactionId,
    value,
    paymentMethod,
    isEvaluation = false,
    packageId = null,
    coupon = null,
  }) {
    push({
      event: "purchase",
      ecommerce: {
        transaction_id: transactionId || null,
        currency: CURRENCY,
        value: Number(value || 0),
        coupon: coupon || undefined,
        payment_type: paymentMethod,
        items: [
          toItem(treatment, {
            item_variant: isEvaluation
              ? "evaluation"
              : packageId
                ? `package:${packageId}`
                : "single",
            price: Number(value || 0),
          }),
        ],
      },
    });
  },

  /**
   * Reservation confirmed without immediate online payment (efectivo / transferencia).
   * Tracked separately from `purchase` so paid vs unpaid bookings are
   * distinguishable in reports.
   */
  trackReservationCreatedNoPayment({
    treatment,
    paymentMethod,
    value,
    isEvaluation = false,
    appointmentId = null,
  }) {
    push({
      event: "reservation_created_no_payment",
      payment_type: paymentMethod,
      appointment_id: appointmentId,
      ecommerce: {
        currency: CURRENCY,
        value: Number(value || 0),
        items: [
          toItem(treatment, {
            item_variant: isEvaluation ? "evaluation" : "single",
            price: Number(value || 0),
          }),
        ],
      },
    });
  },

  /**
   * MercadoPago rejected the card or critical error in the brick.
   */
  trackPaymentFailed({ treatment, paymentMethod, error, statusDetail }) {
    push({
      event: "payment_failed",
      payment_type: paymentMethod,
      error_message: error?.message || String(error || "unknown"),
      mp_status_detail: statusDetail || null,
      treatment_slug: treatment?.slug,
    });
  },

  /**
   * Validation error on a profile/payment form field.
   */
  trackFormFieldError({ formName, fieldName, errorMessage }) {
    push({
      event: "form_field_error",
      form_name: formName,
      field_name: fieldName,
      error_message: errorMessage,
    });
  },

  // ─── Appointment lifecycle (admin + customer) ──────────────────────────

  /**
   * Admin pressed "Confirmar" on a pending appointment.
   */
  trackAppointmentConfirmed({ appointmentId, treatmentSlug }) {
    push({
      event: "appointment_confirmed",
      appointment_id: appointmentId,
      treatment_slug: treatmentSlug,
    });
  },

  /**
   * Admin or customer rescheduled an appointment.
   */
  trackAppointmentRescheduled({
    appointmentId,
    actor, // 'admin' | 'customer'
    treatmentSlug,
    oldScheduledAt,
    newScheduledAt,
  }) {
    push({
      event: "appointment_rescheduled",
      appointment_id: appointmentId,
      actor,
      treatment_slug: treatmentSlug,
      old_scheduled_at: oldScheduledAt || null,
      new_scheduled_at: newScheduledAt || null,
    });
  },

  /**
   * Appointment cancelled.
   */
  trackAppointmentCancelled({ appointmentId, actor, treatmentSlug, reason }) {
    push({
      event: "appointment_cancelled",
      appointment_id: appointmentId,
      actor,
      treatment_slug: treatmentSlug,
      reason: reason || null,
    });
  },

  /**
   * Admin marked the appointment as completed (session done).
   */
  trackAppointmentCompleted({ appointmentId, treatmentSlug }) {
    push({
      event: "appointment_completed",
      appointment_id: appointmentId,
      treatment_slug: treatmentSlug,
    });
  },

  /**
   * Admin marked a no-show.
   */
  trackAppointmentNoShow({ appointmentId, treatmentSlug }) {
    push({
      event: "appointment_no_show",
      appointment_id: appointmentId,
      treatment_slug: treatmentSlug,
    });
  },

  /**
   * Admin confirmed an offline payment (cash / transfer) for an appointment.
   */
  trackOfflinePaymentConfirmed({ appointmentId, paymentMethod, amount }) {
    push({
      event: "offline_payment_confirmed",
      appointment_id: appointmentId,
      payment_type: paymentMethod,
      value: Number(amount || 0),
      currency: CURRENCY,
    });
  },

  // ─── Engagement / outbound ─────────────────────────────────────────────

  /**
   * User clicked any wa.me link (FAB, contact CTA, transfer datos, etc.).
   * `source` lets us distinguish where the click came from.
   */
  trackWhatsAppClick({ source, context = {} }) {
    push({
      event: "whatsapp_click",
      source,
      ...context,
    });
  },

  /**
   * Login modal opened (e.g. user tried to book without auth).
   */
  trackLoginModalOpened({ trigger }) {
    push({
      event: "login_modal_opened",
      trigger, // 'treatment_click' | 'campaign_click' | 'protected_route' | 'manual'
    });
  },

  // ─── Generic escape hatch ──────────────────────────────────────────────

  /**
   * For one-off events that don't deserve a dedicated method yet.
   */
  trackCustomEvent(eventName, payload = {}) {
    push({ event: eventName, ...payload });
  },
};

export default analytics;
