/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          950: '#030712',
          900: '#050c18',
          850: '#081324',
          800: '#0c1b33',
          750: '#102342',
          700: '#162e54',
          600: '#1e3d6f',
          500: '#255194',
        },
        cyan: {
          glow: '#00F2FE',
          marine: '#06B6D4',
          deep: '#0891B2',
        },
        panel: {
          bg: '#081324',
          card: '#0a1628',
          cardHover: '#0e1f38',
          border: 'rgba(56, 189, 248, 0.15)',
          borderSubtle: 'rgba(255, 255, 255, 0.08)',
        },
        sonar: {
          ping: '#00F2FE',
          anomaly: '#F59E0B',
          critical: '#EF4444',
          track: '#38BDF8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Consolas', 'Menlo', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'radar-sweep': 'radarSweep 6s linear infinite',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.03)' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
