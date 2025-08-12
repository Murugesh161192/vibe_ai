import React, { useState, useEffect } from 'react';
import { 
  Share2, Copy, Check, AlertCircle, 
  Twitter, Linkedin, Facebook, MessageCircle,
  Link2, QrCode, Send, Globe, Users, Download
} from 'lucide-react';
import Modal from './Modal';
import { useAnnouncement, useFocusTrap, useKeyboardShortcuts } from '../utils/accessibility';

const ShareModal = ({ 
  isOpen, 
  onClose, 
  overallScore, 
  repositoryInfo,
  analysisUrl 
}) => {
  const [shareMethod, setShareMethod] = useState('link');
  const [copyStatus, setCopyStatus] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  
  const announce = useAnnouncement();
  const focusTrapRef = useFocusTrap(isOpen);

  // Generate share URL
  const shareUrl = analysisUrl || window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  
  // Generate share text
  const shareText = `Check out the GitHub Vibe Score analysis for ${repositoryInfo?.name || 'this repository'}! 🚀\n\nScore: ${overallScore}/100 ${getScoreEmoji(overallScore)}\n\n`;
  const encodedText = encodeURIComponent(shareText);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'escape': () => onClose()
  });

  // Generate QR code
  useEffect(() => {
    if (shareMethod === 'qr') {
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}&bgcolor=0f1419&color=ffffff`;
      setQrCodeUrl(qrApiUrl);
    }
  }, [shareMethod, encodedUrl]);

  function getScoreEmoji(score) {
    if (score >= 85) return '🏆';
    if (score >= 70) return '⭐';
    if (score >= 55) return '👍';
    if (score >= 40) return '💪';
    return '🔧';
  }

  const shareOptions = [
    {
      id: 'link',
      name: 'Copy Link',
      icon: Link2,
      description: 'Copy analysis link to clipboard',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      id: 'social',
      name: 'Social Media',
      icon: Share2,
      description: 'Share on social platforms',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      id: 'qr',
      name: 'QR Code',
      icon: QrCode,
      description: 'Generate QR code for mobile',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    }
  ];

  const socialPlatforms = [
    {
      id: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      color: 'hover:bg-blue-500/20',
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'hover:bg-blue-600/20',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'hover:bg-blue-800/20',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'hover:bg-green-600/20',
      url: `https://wa.me/?text=${encodedText}${shareUrl}`
    }
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus('success');
      announce('Link copied to clipboard');
      setTimeout(() => setCopyStatus(null), 3000);
    } catch (error) {
      setCopyStatus('error');
      announce('Failed to copy link');
      console.error('Copy failed:', error);
    }
  };

  const handleSocialShare = (platform) => {
    window.open(platform.url, '_blank', 'width=600,height=400');
    announce(`Opening ${platform.name} to share`);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `GitHub Vibe Score: ${overallScore}`,
          text: shareText,
          url: shareUrl
        });
        announce('Share dialog opened');
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Native share failed:', error);
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.download = `vibe-score-qr-${repositoryInfo?.name || 'code'}.png`;
    link.href = qrCodeUrl;
    link.click();
    announce('QR code downloaded');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Analysis"
      size="lg"
      data-testid="share-modal"
    >
      <div ref={focusTrapRef} className="space-y-6">
        {/* Share Method Selection - Responsive Grid */}
        <div>
          <h3 className="text-sm font-medium text-white/80 mb-3">Choose Sharing Method</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {shareOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setShareMethod(option.id)}
                className={`relative p-4 rounded-lg border-2 transition-all transform hover:scale-[1.02] ${
                  shareMethod === option.id
                    ? `${option.bgColor} ${option.borderColor} shadow-lg`
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
                aria-label={`Share via ${option.name}`}
                aria-pressed={shareMethod === option.id}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`p-3 rounded-lg ${shareMethod === option.id ? option.bgColor : 'bg-white/5'}`}>
                    <option.icon className={`w-6 h-6 ${shareMethod === option.id ? option.color : 'text-white/60'}`} />
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-white text-sm">
                      {option.name}
                    </div>
                    <div className="text-xs text-white/60 mt-1 hidden sm:block">
                      {option.description}
                    </div>
                  </div>
                  {shareMethod === option.id && (
                    <div className="absolute top-2 right-2">
                      <Check className="w-4 h-4 text-green-400" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Share Content - Dynamic based on selection */}
        <div className="min-h-[200px]">
          {/* Copy Link */}
          {shareMethod === 'link' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Analysis URL</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-mono truncate"
                    aria-label="Share URL"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2 rounded-lg transition-all font-medium shadow-lg hover:shadow-xl flex items-center justify-center gap-2 min-w-[100px] ${
                      copyStatus === 'success'
                        ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                        : 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 backdrop-blur-sm text-white border border-white/10'
                    }`}
                    aria-label="Copy link to clipboard"
                    data-testid="share-button"
                  >
                    {copyStatus === 'success' ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {copyStatus === 'success' && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400">Link copied to clipboard!</span>
                  </div>
                </div>
              )}

              {copyStatus === 'error' && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-400">Failed to copy link. Please try again.</span>
                  </div>
                </div>
              )}

              {/* Native Share Button (for mobile) */}
              {navigator.share && (
                <button
                  onClick={handleNativeShare}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  aria-label="Share using device share dialog"
                >
                  <Send className="w-4 h-4 text-white/60" />
                  <span className="text-white/80">Share using device</span>
                </button>
              )}
            </div>
          )}

          {/* Social Media */}
          {shareMethod === 'social' && (
            <div className="space-y-4">
              <p className="text-sm text-white/60">Share on your favorite platform:</p>
              <div className="grid grid-cols-2 gap-3">
                {socialPlatforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => handleSocialShare(platform)}
                    className={`p-4 rounded-lg bg-white/5 border border-white/10 ${platform.color} transition-all flex items-center gap-3 justify-center sm:justify-start`}
                    aria-label={`Share on ${platform.name}`}
                  >
                    <platform.icon className="w-5 h-5 text-white/80" />
                    <span className="text-white/80 hidden sm:inline">Share on {platform.name}</span>
                    <span className="text-white/80 sm:hidden">{platform.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QR Code */}
          {shareMethod === 'qr' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-white rounded-lg">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code for sharing"
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-sm text-white/60 mt-3 text-center">
                  Scan this QR code to view the analysis on mobile
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleDownloadQR}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 backdrop-blur-sm text-white rounded-lg transition-all border border-white/10 font-medium shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  aria-label="Download QR code"
                >
                  <Download className="w-4 h-4 text-white/80" />
                  <span className="text-white/80">Download QR</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  aria-label="Copy link"
                >
                  <Copy className="w-4 h-4 text-white/80" />
                  <span className="text-white/80">Copy Link</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats - Always visible at bottom */}
        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-white/60">Score:</span>
              <span className="text-white font-semibold">{overallScore}/100</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span className="text-white/60">Repo:</span>
              <span className="text-white font-semibold truncate max-w-[150px]">
                {repositoryInfo?.name || 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Small Trophy icon component for the stats
const Trophy = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v3a2 2 0 002 2h1v3a3 3 0 003 3h2a3 3 0 003-3v-3h1a2 2 0 002-2V5a2 2 0 00-2-2H5zm9 4V5h1v2a1 1 0 01-1 1zm-9 0V5h1v2a1 1 0 01-1 1z" clipRule="evenodd" />
  </svg>
);

export default ShareModal; 