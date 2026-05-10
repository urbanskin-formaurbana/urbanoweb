import { getAnonymousId } from "./anonymousId";
import { doesSessionExist, getUserId } from "supertokens-auth-react/recipe/session";

function pushToDataLayer(eventName, payload) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug("[track]", eventName, payload);
  }
  // TODO: POST to /analytics endpoint when backend route exists
}

export async function track(eventName, props = {}) {
  const anonymous_id = getAnonymousId();
  let user_id = null;
  try {
    if (await doesSessionExist()) {
      user_id = await getUserId();
    }
  } catch {}

  pushToDataLayer(eventName, {
    event: eventName,
    ...props,
    anonymous_id,
    user_id,
    timestamp: new Date().toISOString(),
  });
}
