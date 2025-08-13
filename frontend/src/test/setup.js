import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Suppress act() warnings for cleaner test output
const originalError = console.error
beforeEach(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: An update to')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterEach(() => {
  console.error = originalError
})

// Mock D3 for tests with proper chaining
const mockElement = () => {
  const element = {
    append: vi.fn(() => mockElement()),
    attr: vi.fn(() => mockElement()),
    style: vi.fn(() => mockElement()),
    on: vi.fn(() => mockElement()),
    text: vi.fn(() => mockElement()),
    remove: vi.fn(() => mockElement()),
    selectAll: vi.fn(() => mockElement()),
    data: vi.fn(() => mockElement()),
    enter: vi.fn(() => mockElement()),
    exit: vi.fn(() => mockElement()),
    merge: vi.fn(() => mockElement()),
    transition: vi.fn(() => mockElement()),
    duration: vi.fn(() => mockElement()),
    ease: vi.fn(() => mockElement()),
    node: vi.fn(() => document.createElement('svg')),
    classed: vi.fn(() => mockElement()),
    call: vi.fn(() => mockElement()),
  };
  return element;
};

// Create a proper scale function mock
const createScaleMock = () => {
  // The scale itself should be a function that transforms values
  const scale = vi.fn((value) => {
    // Simple linear transformation for testing
    // Assuming domain [0, 100] and range [0, radius]
    return value; // Return value as-is for simplicity in tests
  });
  
  // Add chainable methods
  scale.domain = vi.fn((domainArray) => {
    if (domainArray) {
      // Store domain for potential use
      scale._domain = domainArray;
    }
    return scale; // Return scale for chaining
  });
  
  scale.range = vi.fn((rangeArray) => {
    if (rangeArray) {
      // Store range for potential use
      scale._range = rangeArray;
    }
    return scale; // Return scale for chaining
  });
  
  scale.nice = vi.fn(() => scale);
  scale.ticks = vi.fn(() => [0, 20, 40, 60, 80, 100]);
  scale.tickFormat = vi.fn(() => (d) => `${d}`);
  scale.copy = vi.fn(() => createScaleMock());
  scale.clamp = vi.fn(() => scale);
  
  return scale;
};

// Create a proper line generator mock
const createLineMock = () => {
  const line = vi.fn(() => 'M0,0L10,10');
  line.x = vi.fn(() => line);
  line.y = vi.fn(() => line);
  line.curve = vi.fn(() => line);
  line.defined = vi.fn(() => line);
  return line;
};

// Create a proper radial line generator mock
const createLineRadialMock = () => {
  const lineRadial = vi.fn(() => 'M0,0A10,10');
  lineRadial.radius = vi.fn(() => lineRadial);
  lineRadial.angle = vi.fn(() => lineRadial);
  lineRadial.curve = vi.fn(() => lineRadial);
  lineRadial.defined = vi.fn(() => lineRadial);
  return lineRadial;
};

// Mock D3 for tests
global.d3 = {
  select: vi.fn(() => mockElement()),
  selectAll: vi.fn(() => mockElement()),
  scaleOrdinal: vi.fn(() => {
    const scale = createScaleMock();
    scale.unknown = vi.fn(() => scale);
    return scale;
  }),
  scaleLinear: vi.fn(() => createScaleMock()),
  scaleBand: vi.fn(() => {
    const scale = createScaleMock();
    scale.bandwidth = vi.fn(() => 20);
    scale.paddingInner = vi.fn(() => scale);
    scale.paddingOuter = vi.fn(() => scale);
    return scale;
  }),
  line: vi.fn(() => createLineMock()),
  lineRadial: vi.fn(() => createLineRadialMock()),
  curveCardinalClosed: {},
  curveLinearClosed: {},
  axisBottom: vi.fn(() => mockElement()),
  axisLeft: vi.fn(() => mockElement()),
  max: vi.fn((array, accessor) => {
    if (accessor) {
      return Math.max(...array.map(accessor));
    }
    return Math.max(...array);
  }),
  min: vi.fn((array, accessor) => {
    if (accessor) {
      return Math.min(...array.map(accessor));
    }
    return Math.min(...array);
  }),
  extent: vi.fn((array, accessor) => {
    if (accessor) {
      const values = array.map(accessor);
      return [Math.min(...values), Math.max(...values)];
    }
    return [Math.min(...array), Math.max(...array)];
  }),
  range: vi.fn((start, end, step = 1) => {
    const result = [];
    for (let i = start; i < end; i += step) {
      result.push(i);
    }
    return result;
  }),
};

// Mock window.matchMedia with proper implementation
const mockMediaQueryList = {
  matches: false,
  media: '',
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn((query) => ({
    ...mockMediaQueryList,
    media: query || '',
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
  }
  observe(target) {
    // Mock implementation - immediately call callback with entry
    if (this.callback) {
      this.callback([{
        target,
        isIntersecting: true,
        intersectionRatio: 1,
        boundingClientRect: { top: 0, left: 0, bottom: 100, right: 100, width: 100, height: 100 },
        intersectionRect: { top: 0, left: 0, bottom: 100, right: 100, width: 100, height: 100 },
        rootBounds: null,
        time: Date.now()
      }]);
    }
  }
  unobserve() {
    // Mock implementation
  }
  disconnect() {
    // Mock implementation
  }
  takeRecords() {
    return [];
  }
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    // Mock implementation
  }
  unobserve() {
    // Mock implementation
  }
  disconnect() {
    // Mock implementation
  }
}

// Mock window properties for viewport tests
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768
});

// Mock document.body.style for tests
if (!document.body) {
  document.body = document.createElement('body');
}

// Mock getComputedStyle to return valid values
global.getComputedStyle = vi.fn().mockImplementation((element, pseudoElement) => {
  const style = {
    fontSize: '16px',
    display: 'block',
    visibility: 'visible',
    opacity: '1',
    height: '100px',
    width: '100px',
    position: 'static',
    zIndex: '0',
    transform: 'none',
    clip: 'auto',
    clipPath: 'none',
    overflow: 'visible',
    pointerEvents: 'auto',
    color: 'rgb(0, 0, 0)',
    backgroundColor: 'rgba(0, 0, 0, 0)'
  };
  
  const getPropertyValue = vi.fn().mockImplementation((property) => {
    const normalizedProperty = property.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
    const values = {
      'font-size': '16px',
      'display': 'block',
      'visibility': 'visible',
      'opacity': '1',
      'height': '100px',
      'width': '100px',
      'position': 'static',
      'z-index': '0',
      'transform': 'none',
      'clip': 'auto',
      'clip-path': 'none',
      'overflow': 'visible',
      'pointer-events': 'auto',
      'color': 'rgb(0, 0, 0)',
      'background-color': 'rgba(0, 0, 0, 0)',
      // Add the normalized property names too
      'fontSize': '16px',
      'display': 'block',
      'visibility': 'visible',
      'opacity': '1',
      'height': '100px',
      'width': '100px',
      'position': 'static',
      'zIndex': '0',
      'transform': 'none',
      'clip': 'auto',
      'clipPath': 'none',
      'overflow': 'visible',
      'pointerEvents': 'auto',
      'color': 'rgb(0, 0, 0)',
      'backgroundColor': 'rgba(0, 0, 0, 0)'
    };
    return values[property] || values[normalizedProperty] || '';
  });
  
  return {
    ...style,
    getPropertyValue,
    // Add length property for CSSStyleDeclaration interface
    length: Object.keys(style).length,
    // Add item method
    item: vi.fn().mockImplementation((index) => Object.keys(style)[index] || null),
    // Add all the direct properties for access
    ...Object.fromEntries(Object.entries(style).map(([key, value]) => [key, value]))
  };
});

// Mock navigator.clipboard for share tests
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(true),
    readText: vi.fn().mockResolvedValue(''),
  },
  writable: true,
});

// Mock Element.prototype methods for accessibility tests
Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
  value: vi.fn().mockReturnValue({
    top: 0,
    left: 0,
    bottom: 100,
    right: 100,
    width: 100,
    height: 100,
    x: 0,
    y: 0
  }),
  writable: true,
});

Object.defineProperty(Element.prototype, 'clientHeight', {
  value: 100,
  writable: true,
});

Object.defineProperty(Element.prototype, 'clientWidth', {
  value: 100,
  writable: true,
});

Object.defineProperty(Element.prototype, 'scrollHeight', {
  value: 100,
  writable: true,
});

Object.defineProperty(Element.prototype, 'scrollWidth', {
  value: 100,
  writable: true,
});

Object.defineProperty(Element.prototype, 'offsetHeight', {
  value: 100,
  writable: true,
});

Object.defineProperty(Element.prototype, 'offsetWidth', {
  value: 100,
  writable: true,
});

Object.defineProperty(Element.prototype, 'offsetParent', {
  value: null,
  writable: true,
});

Object.defineProperty(Element.prototype, 'offsetTop', {
  value: 0,
  writable: true,
});

Object.defineProperty(Element.prototype, 'offsetLeft', {
  value: 0,
  writable: true,
}); 