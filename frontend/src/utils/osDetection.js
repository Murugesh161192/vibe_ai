// OS detection utility for keyboard shortcuts
export const detectOS = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform?.toLowerCase() || '';
  
  // Check platform first for more accurate detection
  if (platform.startsWith('mac') || platform.includes('mac')) {
    return 'mac';
  }
  
  if (platform.startsWith('win') || platform.includes('win')) {
    return 'windows';
  }
  
  if (platform.startsWith('linux') || platform.includes('linux')) {
    return 'linux';
  }
  
  // Fallback to userAgent
  if (userAgent.includes('mac os x') || userAgent.includes('macintosh')) {
    return 'mac';
  }
  
  if (userAgent.includes('windows') || userAgent.includes('win32') || userAgent.includes('win64')) {
    return 'windows';
  }
  
  if (userAgent.includes('linux') || userAgent.includes('x11')) {
    return 'linux';
  }
  
  // Default to Windows for unknown OS
  return 'windows';
};

export const getKeyboardShortcuts = () => {
  const os = detectOS();
  
  if (os === 'mac') {
    return {
      focus: '⌘K',
      submit: '⌘Enter',
      clear: 'Esc',
      focusKey: 'k',
      submitKey: 'Enter',
      modifier: 'cmd'
    };
  } else {
    // Windows and Linux
    return {
      focus: 'Ctrl+K',
      submit: 'Ctrl+Enter',
      clear: 'Esc',
      focusKey: 'k',
      submitKey: 'Enter',
      modifier: 'ctrl'
    };
  }
};

export const getModifierKey = () => {
  const os = detectOS();
  return os === 'mac' ? '⌘' : 'Ctrl';
};

// Check if the correct modifier key is pressed
export const isModifierPressed = (event) => {
  const os = detectOS();
  return os === 'mac' ? event.metaKey : event.ctrlKey;
}; 