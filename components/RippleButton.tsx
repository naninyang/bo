import { MouseEvent, useEffect, useRef, useState } from 'react';
import { isIOS, isAndroid } from 'react-device-detect';
import styles from '@/styles/RippleButton.module.sass';

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
  title?: string;
  type: 'button' | 'submit' | 'reset';
};

export default function RippleButton({ children, onClick, className = '', ariaLabel, title, type }: Props) {
  const [ios, setIos] = useState<boolean>();
  const [android, seAndroid] = useState<boolean>();
  const [monitor, setMonitor] = useState<boolean>();
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const isIPadOS = () => {
    return navigator.userAgent.includes('Macintosh') && 'ontouchend' in document;
  };
  useEffect(() => {
    if (isIOS || isIPadOS()) {
      setIos(true);
    } else if (isAndroid) {
      seAndroid(true);
    } else {
      setMonitor(true);
    }
  }, []);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;

    const ripple = document.createElement('span');
    ripple.className = styles.ripple;

    if (android) {
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    }

    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);

    onClick?.();
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className={`${ios ? styles.btn : ''} ${android ? styles.rb : ''} ${monitor ? styles.general : ''} ${className}`}
      aria-label={ariaLabel}
      title={title}
      type={type}
    >
      {children}
    </button>
  );
}
