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
        // Cab Castle Signature Palette: Mint (#69A481), White Smoke (#E7EDEB), Claret (#7C1F31)
        mint: {
          DEFAULT: '#69A481',
          hover: '#528A69',
          light: '#8FC4A5',
          pale: '#DEEDE4',
          dark: '#3B6B50',
          deep: '#2A533B',
          glow: 'rgba(105, 164, 129, 0.30)',
        },
        smoke: {
          DEFAULT: '#E7EDEB',
          canvas: '#E7EDEB',
          pure: '#FFFFFF',
          dark: '#DFE7E4',
          border: '#CBD8D4',
        },
        claret: {
          DEFAULT: '#7C1F31',
          hover: '#631826',
          light: '#9B2A41',
          deep: '#24060C',
          dark: '#380912',
          card: '#4D0E1C',
          surface: '#5D1323',
        },

        castle: {
          gold: {
            DEFAULT: '#69A481',          // Mint Accent
            hover: '#528A69',
            light: '#8FC4A5',
            pale: '#DEEDE4',
            dark: '#3B6B50',
            deep: '#2A533B',
            glow: 'rgba(105, 164, 129, 0.30)',
          },
          navy: {
            DEFAULT: '#7C1F31',          // Claret
            deep: '#24060C',            // Deep Claret Noir
            surface: '#380912',          // Dark Card Surface
            card: '#4D0E1C',
            light: '#5D1323',
          },
          ivory: {
            DEFAULT: '#E7EDEB',          // White Smoke Canvas
            pure: '#FFFFFF',
            warm: '#DFE7E4',
            border: '#CBD8D4',
          },
          slate: {
            DEFAULT: '#4D6257',
            light: '#6C8277',
            dark: '#2C3A33',
          },
        },

        // Reference Palette Tokens (Theme Mapped to Mint, White Smoke, Claret)
        prussian: {
          DEFAULT: '#7C1F31',
          hover: '#631826',
          dark: '#24060C',
          light: '#4D0E1C',
        },
        cyan: {
          DEFAULT: '#69A481',
          hover: '#528A69',
          light: '#DEEDE4',
          ice: '#8FC4A5',
        },
        chiffon: {
          DEFAULT: '#E7EDEB',
          card: '#FFFFFF',
          warm: '#DFE7E4',
          border: '#CBD8D4',
        },
        slate: {
          DEFAULT: '#4D6257',
          light: '#6C8277',
          dark: '#2C3A33',
        },

        // Backward compatibility mappings
        serenity: {
          DEFAULT: '#7C1F31',
          light: '#DEEDE4',
          dark: '#24060C',
          text: '#1B2922',
        },
        custard: {
          DEFAULT: '#69A481',
          hover: '#528A69',
          light: '#DEEDE4',
          dark: '#7C1F31',
        },
        purelight: {
          DEFAULT: '#E7EDEB',
          card: '#FFFFFF',
          border: '#CBD8D4',
        },

        // Theme-mapped Brand Tokens
        brand: {
          DEFAULT: '#69A481',          // Mint Primary Accent
          orange: '#69A481',
          'orange-hover': '#528A69',
          'orange-active': '#3B6B50',
          'orange-light': '#DEEDE4',
          primary: '#7C1F31',          // Claret Primary
          black: '#24060C',
          canvas: '#E7EDEB',           // White Smoke Canvas
          white: '#FFFFFF',
          surface: '#E7EDEB',
          'gray-secondary': '#4D6257',
          'gray-tertiary': '#6C8277',
          'gray-light': '#CBD8D4',
          border: '#CBD8D4',
          'border-subtle': '#DFE7E4',
          blue: '#7C1F31',
          'blue-light': '#DEEDE4',
          'blue-bg': '#DEEDE4',
          green: '#69A481',
          'green-light': '#DEEDE4',
          yellow: '#69A481',
          'yellow-deep': '#528A69',
          red: '#7C1F31',
        },

        // Urbanist / Brex Aliases mapped to Reference Palette
        urbanist: {
          primary: '#7C1F31',
          'primary-hover': '#631826',
          'primary-active': '#24060C',
          vanilla: '#DEEDE4',
          'vanilla-deep': '#69A481',
          honeydew: '#DEEDE4',
          'honeydew-deep': '#69A481',
          alice: '#8FC4A5',
          'alice-deep': '#7C1F31',
          canvas: '#E7EDEB',
          white: '#FFFFFF',
          'text-primary': '#1B2922',
          'text-secondary': '#4D6257',
          'text-tertiary': '#6C8277',
          border: '#CBD8D4',
          disabled: '#DFE7E4',
        },
        brexOrange: '#69A481',
        brexOrangeHover: '#528A69',
        brexPrimary: '#7C1F31',
        brexBlack: '#24060C',
        brexCanvas: '#E7EDEB',
        brexSurface: '#E7EDEB',
        brexGray: '#4D6257',
        brexBorder: '#CBD8D4',
        brexBlue: '#7C1F31',

        background: '#E7EDEB',
        foreground: '#1B2922',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#1B2922'
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#1B2922'
        },
        primary: {
          DEFAULT: '#7C1F31',
          foreground: '#FFFFFF'
        },
        secondary: {
          DEFAULT: '#DEEDE4',
          foreground: '#1B2922'
        },
        muted: {
          DEFAULT: '#E7EDEB',
          foreground: '#4D6257'
        },
        accent: {
          DEFAULT: '#69A481',
          foreground: '#FFFFFF'
        },
        destructive: {
          DEFAULT: '#7C1F31',
          foreground: '#FFFFFF'
        },
        border: '#CBD8D4',
        input: '#CBD8D4',
        ring: '#69A481',
      },
      boxShadow: {
        xs: '0px 1px 3px rgba(36, 6, 12, 0.05)',
        sm: '0px 2px 8px rgba(36, 6, 12, 0.08)',
        md: '0px 6px 16px rgba(36, 6, 12, 0.10)',
        lg: '0px 12px 28px rgba(36, 6, 12, 0.14)',
        xl: '0px 20px 40px rgba(36, 6, 12, 0.18)',
        gold: '0px 8px 24px rgba(105, 164, 129, 0.28)',
        goldGlow: '0px 0px 25px rgba(105, 164, 129, 0.38)',
        focus: '0px 0px 0px 3px rgba(105, 164, 129, 0.35)',
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