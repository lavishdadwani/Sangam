/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 🍔 Primary Brand Colors (Professional Food Delivery Red)
        primary: {
          DEFAULT: '#E23744',  // Main brand color
          hover: '#CF2A37',    // Hover state
          light: '#FFF5F5',    // Light background
          dark: '#B71C2B',     // Dark variant
        },
  
        // 🧱 App Background Colors
        app: {
          bg: '#FFFFFF',        // Main background
          secondary: '#FAFAFA', // Secondary background
          card: '#FFFFFF',      // Card background
          hover: '#F5F5F5',     // Hover background
        },
  
        // 📝 Text Colors
        text: {
          primary: '#1F2937',   // Primary text
          secondary: '#6B7280', // Secondary text
          muted: '#9CA3AF',     // Muted text
          light: '#FFFFFF',     // Light text
        },
  
        // 📦 Border Colors
        border: {
          DEFAULT: '#E5E7EB',   // Default border
          light: '#F3F4F6',     // Light border
          dark: '#D1D5DB',      // Dark border
          primary: '#E23744',   // Primary border
        },
  
        // ✅ State Colors
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
        },
        info: {
          DEFAULT: '#3B82F6',
          light: '#DBEAFE',
        },
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'large': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
    },
  },  
  plugins: [],
}

