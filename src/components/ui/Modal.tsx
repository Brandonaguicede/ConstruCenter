import { useEffect, useRef, type ReactNode } from 'react';

interface ModalProps {
  children: ReactNode;
  titleId: string;
  onClose: () => void;
}

/** Native dialog supplies focus containment, Escape and an inert background. */
export function Modal({ children, titleId, onClose }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className="site-modal"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      {children}
    </dialog>
  );
}

