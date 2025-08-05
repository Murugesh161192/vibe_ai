import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { detectOS, getKeyboardShortcuts, getModifierKey } from '../utils/osDetection';

describe('OS Detection Utility', () => {
  let originalUserAgent;

  beforeEach(() => {
    // Store original user agent
    originalUserAgent = navigator.userAgent;
  });

  afterEach(() => {
    // Restore original user agent
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      writable: true
    });
  });

  describe('detectOS', () => {
    test('detects Windows correctly', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        writable: true
      });
      
      expect(detectOS()).toBe('windows');
    });

    test('detects Mac correctly', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        writable: true
      });
      
      expect(detectOS()).toBe('mac');
    });

    test('detects Linux correctly', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        writable: true
      });
      
      expect(detectOS()).toBe('linux');
    });

    test('defaults to Windows for unknown OS', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Unknown Browser',
        writable: true
      });
      
      expect(detectOS()).toBe('windows');
    });
  });

  describe('getKeyboardShortcuts', () => {
    test('returns Mac shortcuts for Mac OS', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        writable: true
      });
      
      const shortcuts = getKeyboardShortcuts();
      expect(shortcuts.focus).toBe('⌘K');
      expect(shortcuts.submit).toBe('⌘Enter');
      expect(shortcuts.clear).toBe('Esc');
    });

    test('returns Windows shortcuts for Windows OS', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        writable: true
      });
      
      const shortcuts = getKeyboardShortcuts();
      expect(shortcuts.focus).toBe('Ctrl+K');
      expect(shortcuts.submit).toBe('Ctrl+Enter');
      expect(shortcuts.clear).toBe('Esc');
    });

    test('returns Windows shortcuts for Linux OS', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        writable: true
      });
      
      const shortcuts = getKeyboardShortcuts();
      expect(shortcuts.focus).toBe('Ctrl+K');
      expect(shortcuts.submit).toBe('Ctrl+Enter');
      expect(shortcuts.clear).toBe('Esc');
    });
  });

  describe('getModifierKey', () => {
    test('returns ⌘ for Mac', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        writable: true
      });
      
      expect(getModifierKey()).toBe('⌘');
    });

    test('returns Ctrl for Windows', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        writable: true
      });
      
      expect(getModifierKey()).toBe('Ctrl');
    });

    test('returns Ctrl for Linux', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        writable: true
      });
      
      expect(getModifierKey()).toBe('Ctrl');
    });
  });
}); 