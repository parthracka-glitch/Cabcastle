/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      borderRadius: {
        DEFAULT: '20px',
        sm: '12px',
        md: '20px',
        lg: '20px',
        xl: '24px',
        '2xl': '24px',
        '3xl': '28px',
        full: '9999px',
      },
      fontFamily: {
        display: ['Nunito', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        body: ['Nunito', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        sans: ['Nunito', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"Space Mono"', '"SF Mono"', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        // Cab Castle Signature Luxury Palette (Midnight Obsidian, Royal Navy, Champagne Gold, Castle Ivory)
        castle: {
          gold: {
            DEFAULT: '#E5A93C',          // Royal Champagne Gold
            hover: '#D4901F',
            light: '#F6D285',            // Soft Gold Shimmer
            pale: '#FDF8EE',            // Subtle Ivory Gold Wash
            dark: '#C58B24',
            deep: '#9B6A14',
            glow: 'rgba(229, 169, 60, 0.28)',
          },
          navy: {
            DEFAULT: '#0F172A',          // Royal Dark Navy
            deep: '#090D16',            // Midnight Obsidian
            surface: '#162036',          // Dark Card Surface
            card: '#1E293B',
            light: '#24324D',
          },
          ivory: {
            DEFAULT: '#FAF8F5',          // Warm Castle Ivory Canvas
            pure: '#FFFFFF',
            warm: '#F4EFE6',            // Warm Stone
            border: '#E8E0D2',          // Subtle Gold-Ivory Border
          },
          slate: {
            DEFAULT: '#475569',
            light: '#64748B',
            dark: '#334155',
          },
        },

        // Reference Palette Tokens (Theme Mapped)
        prussian: {
          DEFAULT: '#0F172A',          // Velvet Midnight (Cab Castle)
          hover: '#090D16',
          dark: '#05080E',
          light: '#1E293B',
        },
        cyan: {
          DEFAULT: '#E5A93C',          // Mapped to Gold Accent
          hover: '#D4901F',
          light: '#FDF8EE',
          ice: '#F6D285',
        },
        chiffon: {
          DEFAULT: '#FAF8F5',          // Warm Castle Stone
          card: '#FFFFFF',
          warm: '#F4EFE6',
          border: '#E8E0D2',
        },
        slate: {
          DEFAULT: '#475569',
          light: '#64748B',
          dark: '#334155',
        },

        // Backward compatibility mappings
        serenity: {
          DEFAULT: '#0F172A',
          light: '#FDF8EE',
          dark: '#090D16',
          text: '#0F172A',
        },
        custard: {
          DEFAULT: '#E5A93C',
          hover: '#D4901F',
          light: '#FDF8EE',
          dark: '#0F172A',
        },
        purelight: {
          DEFAULT: '#FAF8F5',
          card: '#FFFFFF',
          border: '#E8E0D2',
        },

        // Theme-mapped Brand Tokens
        brand: {
          DEFAULT: '#E5A93C',          // Royal Gold Primary Accent
          orange: '#E5A93C',
          'orange-hover': '#D4901F',
          'orange-active': '#C58B24',
          'orange-light': '#FDF8EE',
          primary: '#0F172A',          // Midnight Obsidian Primary
          black: '#090D16',
          canvas: '#FAF8F5',           // Warm Castle Ivory Canvas
          white: '#FFFFFF',
          surface: '#FAF8F5',
          'gray-secondary': '#475569',
          'gray-tertiary': '#64748B',
          'gray-light': '#E8E0D2',
          border: '#E8E0D2',
          'border-subtle': '#F0EBE0',
          blue: '#0F172A',
          'blue-light': '#FDF8EE',
          'blue-bg': '#FDF8EE',
          green: '#0D9488',
          'green-light': '#CCFBF1',
          yellow: '#E5A93C',
          'yellow-deep': '#D4901F',
          red: '#E03131',
        },

        // Urbanist / Brex Aliases mapped to Reference Palette
        urbanist: {
          primary: '#0F172A',
          'primary-hover': '#090D16',
          'primary-active': '#05080E',
          vanilla: '#FDF8EE',
          'vanilla-deep': '#E5A93C',
          honeydew: '#FDF8EE',
          'honeydew-deep': '#E5A93C',
          alice: '#F6D285',
          'alice-deep': '#0F172A',
          canvas: '#FAF8F5',
          white: '#FFFFFF',
          'text-primary': '#0F172A',
          'text-secondary': '#475569',
          'text-tertiary': '#64748B',
          border: '#E8E0D2',
          disabled: '#F1ECE2',
        },
        brexOrange: '#E5A93C',
        brexOrangeHover: '#D4901F',
        brexPrimary: '#0F172A',
        brexBlack: '#090D16',
        brexCanvas: '#FAF8F5',
        brexSurface: '#FAF8F5',
        brexGray: '#475569',
        brexBorder: '#E8E0D2',
        brexBlue: '#0F172A',

        background: '#FAF8F5',
        foreground: '#0F172A',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#0F172A'
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#0F172A'
        },
        primary: {
          DEFAULT: '#0F172A',
          foreground: '#FFFFFF'
        },
        secondary: {
          DEFAULT: '#FDF8EE',
          foreground: '#0F172A'
        },
        muted: {
          DEFAULT: '#FAF8F5',
          foreground: '#475569'
        },
        accent: {
          DEFAULT: '#E5A93C',
          foreground: '#090D16'
        },
        destructive: {
          DEFAULT: '#E03131',
          foreground: '#FFFFFF'
        },
        border: '#E8E0D2',
        input: '#E8E0D2',
        ring: '#E5A93C',
      },
      boxShadow: {
        xs: '0px 1px 3px rgba(15, 23, 42, 0.04)',
        sm: '0px 2px 8px rgba(15, 23, 42, 0.06)',
        md: '0px 6px 16px rgba(15, 23, 42, 0.08)',
        lg: '0px 12px 28px rgba(15, 23, 42, 0.12)',
        xl: '0px 20px 40px rgba(15, 23, 42, 0.16)',
        gold: '0px 8px 24px rgba(229, 169, 60, 0.25)',
        goldGlow: '0px 0px 25px rgba(229, 169, 60, 0.35)',
        focus: '0px 0px 0px 3px rgba(229, 169, 60, 0.35)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        fadeUp: 'fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}