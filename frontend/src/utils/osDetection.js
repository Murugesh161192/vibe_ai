// OS detection utility for keyboard shortcuts
export const detectOS = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('win')) {
    return 'windows';
  } else if (userAgent.includes('mac')) {
    return 'mac';
  } else if (userAgent.includes('linux')) {
    return 'linux';
  } else {
    // Default to Windows for unknown OS
    return 'windows';
  }
};

export const getKeyboardShortcuts = () => {
  const os = detectOS();
  
  if (os === 'mac') {
    return {
      focus: '⌘K',
      submit: '⌘Enter',
      clear: 'Esc'
    };
  } else {
    // Windows and Linux
    return {
      focus: 'Ctrl+K',
      submit: 'Ctrl+Enter',
      clear: 'Esc'
    };
  }
};

export const getModifierKey = () => {
  const os = detectOS();
  return os === 'mac' ? '⌘' : 'Ctrl';
}; 