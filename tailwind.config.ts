// tailwind.config.js
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
        xs: "480px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        poppins: ["var(--font-poppins)", "sans-serif"],
        kalam: ["var(--font-kalam)", "cursive"],
        robotoMono: ["var(--font-roboto-mono)", "monospace"],
        oswald: ["var(--font-oswald)", "sans-serif"],
        lato: ["var(--font-lato)", "sans-serif"],
        Montserrat: ["var(--font-Montserrat)", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        titulos: {
          DEFAULT: "hsl(var(--titulos))",
          foreground: "hsl(var(--titulos-foreground))",
        },
        botonprimario: {
          DEFAULT: "hsl(var(--botonprimario))",
          foreground: "hsl(var(--botonprimario-foreground))",
        },
        botonsecundario: {
          DEFAULT: "hsl(var(--botonsecundario))",
          foreground: "hsl(var(--botonsecundario-foreground))",
        },
        botonprimariodark: {
          DEFAULT: "hsl(var(--botonprimariodark))",
          foreground: "hsl(var(--botonprimariodark-foreground))",
        },
        botonsecundariodark: {
          DEFAULT: "hsl(var(--botonsecundariodark))",
          foreground: "hsl(var(--botonsecundariodark-foreground))",
        },
        botonprimariolight: {
          DEFAULT: "hsl(var(--botonprimariolight))",
          foreground: "hsl(var(--botonprimariolight-foreground))",
        },
        botonsecundariolight: {
          DEFAULT: "hsl(var(--botonsecundariolight))",
          foreground: "hsl(var(--botonsecundariolight-foreground))",
        },
        verde: {
          DEFAULT: "#7cffc4",
          foreground: "#0000",
        },
        rosa: {
          DEFAULT: "#ff0f74",
          foreground: "#0000",
        },
        customGray: {
          50: "rgba(128, 128, 128, 0.5)", // 50% opacity
        },
        dark: {
          DEFAULT: "#111827",
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl:": "24px",
      },
      keyframes: {
        'loading-bar': {
          '0%': { width: '0%' },
          '100%': { width: '100%' }
        }
      },
      animation: {
        'loading-bar': 'loading-bar 1.5s ease-in-out infinite'
      },
    },
  },
  plugins: [],
};

export default config;
