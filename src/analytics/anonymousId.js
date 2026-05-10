let _inMemoryId = null;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STORAGE_KEY = "fu.anonymousId";

export function getAnonymousId() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && UUID_RE.test(stored)) return stored;
    const id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    if (!_inMemoryId) _inMemoryId = crypto.randomUUID();
    return _inMemoryId;
  }
}
