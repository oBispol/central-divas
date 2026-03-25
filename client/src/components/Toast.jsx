import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }[type] || 'bg-green-500';

  const Icon = type === 'success' ? CheckCircle : null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
      <div className={`${bgColor} text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[250px]`}>
        {Icon && <Icon size={20} />}
        <span className="flex-1">{message}</span>
        <button 
          onClick={() => { setIsVisible(false); onClose(); }}
          className="ml-2 hover:opacity-80 transition-opacity"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
