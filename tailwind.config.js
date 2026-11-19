/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#F2F6F4',
          100: '#DCE9DD',
          200: '#B5D1B8',
          400: '#438A70',
          500: '#2E6F58',
          600: '#235644',
          700: '#183C32', // Primary forest
          800: '#122E26',
          900: '#0D201A',
        },
        ivory: {
          50: '#FAFAF7',
          100: '#F5F5EF', // Warm ivory background
          200: '#ECECE3',
          300: '#E4E4D8',
        },
        sage: {
          50: '#F6FAF6',
          100: '#DCE9DD', // Soft sage
          200: '#C7DBC9',
          300: '#A9C7AC',
        },
        sand: {
          50: '#FAF6F0',
          100: '#F4EFE6',
          200: '#E9DCCB', // Accent sand
          300: '#DCBFA3',
          700: '#8C581E',
          800: '#704414',
        },
        ink: {
          900: '#25332D', // Primary text
          700: '#3D4F46',
          500: '#6F7D75', // Secondary text
          400: '#94A099',
          300: '#BFC8C2',
          200: '#E4E8E1', // Border
          100: '#F0F3EF',
        },
        status: {
          onTrack: '#183C32',
          onTrackBg: '#DCE9DD',
          onTrackBorder: '#B5D1B8',
          slipping: '#8C581E',
          slippingBg: '#F5E8D3',
          slippingBorder: '#E5CCA8',
          lapsed: '#943828',
          lapsedBg: '#F9E4DF',
          lapsedBorder: '#EABFB7',
          recovering: '#1B5E6B',
          recoveringBg: '#D9F0F2',
          recoveringBorder: '#A7DCE0',
        },
        // Keep brand aliases for backward compatibility
        brand: {
          50: '#F2F6F4',
          100: '#DCE9DD',
          200: '#B5D1B8',
          500: '#2E6F58',
          600: '#235644',
          700: '#183C32',
          800: '#122E26',
          900: '#0D201A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(37, 51, 45, 0.04), 0 1px 2px -1px rgba(37, 51, 45, 0.04)',
        'card-hover': '0 4px 12px 0 rgba(37, 51, 45, 0.07), 0 2px 4px -2px rgba(37, 51, 45, 0.05)',
        'modal': '0 20px 40px -8px rgba(24, 60, 50, 0.16), 0 8px 16px -4px rgba(24, 60, 50, 0.08)',
      },
    },
  },
  plugins: [],
}
