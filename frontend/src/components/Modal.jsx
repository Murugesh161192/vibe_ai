import React, { useEffect } from 'react';
import { X, Bot, AlertCircle, CheckCircle, Info, ExternalLink } from 'lucide-react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  type = 'info', // 'info', 'success', 'warning', 'error'
  size = 'md', // 'sm', 'md', 'lg', 'xl'
  hideFooter = false // Option to hide the default footer
}) => {
  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  const typeConfig = {
    info: { icon: Info, color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
    success: { icon: CheckCircle, color: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/20' },
    warning: { icon: AlertCircle, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20' },
    error: { icon: AlertCircle, color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20' },
    bot: { icon: Bot, color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20' }
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className={`
          relative w-full ${sizeClasses[size]} 
          bg-gray-900/95 backdrop-blur-xl 
          rounded-xl border border-white/10 
          shadow-2xl animate-slide-up
          max-h-[90vh] sm:max-h-[85vh] 
          flex flex-col
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Sticky for better mobile UX */}
        <div className={`
          flex items-center justify-between 
          p-4 sm:p-5 
          border-b border-white/10 
          ${config.bgColor}
          rounded-t-xl
          flex-shrink-0
        `}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Icon className={`w-5 h-5 ${config.color} flex-shrink-0`} />
            <h2 
              id="modal-title" 
              className="text-base sm:text-lg font-semibold text-white truncate"
            >
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="
              p-2 ml-2
              rounded-lg hover:bg-white/10 
              transition-colors
              flex-shrink-0
              touch-manipulation
            "
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-white/60 hover:text-white" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="
          flex-1 
          p-4 sm:p-5 
          overflow-y-auto 
          custom-scrollbar
          overscroll-contain
        ">
          {children}
        </div>

        {/* Footer - Optional, Sticky for better mobile UX */}
        {!hideFooter && (
          <div className="
            flex justify-end gap-2 
            p-4 sm:p-5 
            border-t border-white/10
            flex-shrink-0
            bg-gray-900/50
            rounded-b-xl
          ">
            <button
              onClick={onClose}
              className="
                px-4 py-2.5 
                text-sm font-medium
                bg-white/10 text-white 
                rounded-lg hover:bg-white/20 
                transition-all
                touch-manipulation
                min-w-[80px]
              "
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Summary Modal Component - Specific for repository summaries
export const SummaryModal = ({ isOpen, onClose, repo, summary, isLoading, error }) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Repository Summary: ${repo?.name || 'Unknown'}`}
      type="bot"
      size="lg"
      hideFooter={false}
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Bot className="w-8 h-8 text-purple-400 animate-pulse mb-3" />
          <p className="text-white/60">Generating AI summary...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-8">
          <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
          <p className="text-red-400 mb-2">Failed to generate summary</p>
          <p className="text-white/60 text-sm text-center px-4">{error}</p>
        </div>
      ) : summary ? (
        <div className="space-y-4">
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-white/90 leading-relaxed">
              {summary}
            </div>
          </div>
          {repo && (
            <div className="pt-4 border-t border-white/10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
                <span className="text-white/60">
                  Generated: {new Date().toLocaleTimeString()}
                </span>
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  View on GitHub
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-8 text-center text-white/60">
          No summary available
        </div>
      )}
    </Modal>
  );
};

export default Modal; 