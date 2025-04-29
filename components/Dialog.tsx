import { useRef, useEffect } from 'react';
import styles from '@/styles/Dialog.module.sass';

type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Dialog({ isOpen, onClose, children }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (event.target === dialog) {
        onClose();
      }
    };

    dialog.addEventListener('click', handleClickOutside);
    return () => {
      dialog.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <dialog ref={dialogRef} className={styles.dialog} aria-modal="true" role="dialog">
      <div className={styles['dialog-container']}>{children}</div>
    </dialog>
  );
}
