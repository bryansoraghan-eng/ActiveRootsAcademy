import type { ReactNode } from 'react';

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = { sm: 'ara-modal-sm', md: 'ara-modal-md', lg: 'ara-modal-lg', xl: 'ara-modal-xl' };

export default function Modal({ onClose, children, title, size = 'md' }: ModalProps) {
  return (
    <div className="ara-modal-overlay">
      <div className="ara-modal-backdrop" onClick={onClose} />
      <div className={`ara-modal ${sizeMap[size]}`}>
        {title ? (
          <div className="ara-modal-header">
            <h2 className="ara-modal-title">{title}</h2>
            <button type="button" onClick={onClose} className="ara-modal-close">×</button>
          </div>
        ) : (
          <button type="button" onClick={onClose} className="ara-modal-close ara-modal-close-float">×</button>
        )}
        <div className="ara-modal-body">{children}</div>
      </div>
    </div>
  );
}
