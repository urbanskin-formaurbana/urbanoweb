import { Dialog } from '@mui/material';
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';

const SafeDialogContext = createContext(null);

const blurActive = () => {
  if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
};

/**
 * Hook to obtain a close handler that blurs focus before invoking onClose.
 * Use this for any button INSIDE the dialog that closes it (Cancel, X, etc.).
 *
 *   const close = useSafeClose();
 *   <Button onClick={close}>Cancelar</Button>
 */
export const useSafeClose = () => {
  const ctx = useContext(SafeDialogContext);
  if (!ctx) {
    throw new Error('useSafeClose must be used inside <SafeDialog>');
  }
  return ctx.close;
};

/**
 * Drop-in replacement for MUI's <Dialog> that prevents the WAI-ARIA warning
 *   "Blocked aria-hidden on an element because its descendant retained focus."
 *
 * Why: MUI applies aria-hidden="true" to <div id="root"> while focus is still
 * on a button inside #root (the trigger on open, or an inline close button on
 * close). Blurring document.activeElement before each transition avoids it.
 *
 * API: identical to MUI Dialog. For close buttons inside dialog content,
 * prefer useSafeClose() over wiring onClose manually.
 */
export default function SafeDialog({ open, onClose, children, ...rest }) {
  const prevOpen = useRef(open);

  useLayoutEffect(() => {
    if (prevOpen.current !== open) {
      blurActive();
      prevOpen.current = open;
    }
  }, [open]);

  const safeClose = useCallback(
    (event, reason) => {
      blurActive();
      onClose?.(event, reason);
    },
    [onClose]
  );

  const ctxValue = useMemo(() => ({ close: safeClose }), [safeClose]);

  return (
    <SafeDialogContext.Provider value={ctxValue}>
      <Dialog open={open} onClose={safeClose} {...rest}>
        {children}
      </Dialog>
    </SafeDialogContext.Provider>
  );
}
