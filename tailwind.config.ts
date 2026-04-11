import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    fontFamily: {
      sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Inter', 'system-ui', 'sans-serif'],
      mono: ['"Courier Prime"', '"IBM Plex Mono"', 'monospace'],
      display: ['"Courier Prime"', 'monospace'],
    },
    extend: {
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        hope: {
          red: "hsl(var(--hope-red))",
          pink: "hsl(var(--hope-pink))",
          coral: "hsl(var(--hope-coral))",
        },
        crimson: {
          50: "hsl(0, 85%, 97%)",
          100: "hsl(0, 85%, 94%)",
          200: "hsl(0, 85%, 88%)",
          300: "hsl(0, 85%, 76%)",
          400: "hsl(0, 85%, 64%)",
          500: "hsl(0, 80%, 52%)",
          600: "hsl(0, 80%, 48%)",
          700: "hsl(0, 80%, 38%)",
          800: "hsl(0, 80%, 28%)",
          900: "hsl(0, 80%, 18%)",
        },
        alert: {
          50: "hsl(14, 100%, 96%)",
          500: "hsl(14, 100%, 50%)",
          600: "hsl(14, 100%, 40%)",
        },
      },
      borderRadius: {
        none: "0px",
        xs: "1px",
        sm: "2px",
        base: "4px",
        lg: "8px",
        full: "9999px",
      },
      keyframes: {
        "marquee-vertical": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(-50%)" },
        },
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "slide-in-left": {
          from: {
            opacity: "0",
            transform: "translateX(-40px)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "slide-in-right": {
          from: {
            opacity: "0",
            transform: "translateX(40px)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "slide-in-up": {
          from: {
            opacity: "0",
            transform: "translateY(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "pulse-glow": {
          "0%, 100%": {
            "box-shadow": "0 0 0 0 rgba(194, 30, 30, 0.7)",
          },
          "50%": {
            "box-shadow": "0 0 0 12px rgba(194, 30, 30, 0)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "marquee-vertical": "marquee-vertical 20s linear infinite",
        "slide-left": "slide-in-left 400ms ease-out forwards",
        "slide-right": "slide-in-right 400ms ease-out forwards",
        "slide-up": "slide-in-up 400ms ease-out forwards",
        "pulse-glow": "pulse-glow 2s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
