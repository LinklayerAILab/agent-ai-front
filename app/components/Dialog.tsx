import React, { useEffect, useRef, useState } from 'react';
import './Dialog.scss';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, children }) => {
  const backdropRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // use setTimeout 确保 DOM 已render
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      // awaitanimationendafter再uninstallcomponent
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // 与 CSS transition 时间匹配
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (backdropRef.current === event.target) {
      onClose();
    }
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <div 
      className={`dialog-backdrop ${isAnimating ? 'open' : ''}`} 
      onClick={handleBackdropClick} 
      ref={backdropRef}
    >
      <div className="dialog-content w-[90vw] lg:w-[1000px]">
        {children}
      </div>
    </div>
  );
};

export default Dialog;