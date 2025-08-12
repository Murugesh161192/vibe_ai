/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        '2xs': '320px', // Very small mobile devices (iPhone SE, etc)
        'xs': '375px',  // Small mobile devices (iPhone 6/7/8)
        '3xl': '1920px',
        '4xl': '2560px',
      },
      spacing: {
        '4.5': '1.125rem',  // 18px - for icons
        '13': '3.25rem',    // 52px
        '15': '3.75rem',    // 60px  
        '17': '4.25rem',    // 68px
        '18': '4.5rem',     // 72px - FIXED: Added missing w-18
        '19': '4.75rem',    // 76px
        '21': '5.25rem',    // 84px
        '22': '5.5rem',     // 88px
        '23': '5.75rem',    // 92px
        '26': '6.5rem',     // 104px
        '30': '7.5rem',     // 120px
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#d1d5db',
          200: '#9ca3af',
          300: '#6b7280',
          400: '#4b5563',
          500: '#374151',
          600: '#1f2937',
          700: '#111827',
          800: '#0f172a',
          900: '#060818',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#374151',
          800: '#1f2937',
          900: '#0f172a',
        },
        vibe: {
          excellent: '#10b981', // Green for high scores
          good: '#f59e0b',      // Amber for medium scores
          poor: '#ef4444',      // Red for low scores
          neutral: '#6b7280'    // Gray for neutral
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite', 
        'pulse-slower': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 3s infinite',
        'radar-spin': 'radarSpin 20s linear infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        radarSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
} 