import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // black: "var(--black)",
        // white: "var(--white)",
        // body: "var(--body)",
        // "heart-red": "var(--heart-red)",
        // accent: {
        //   DEFAULT: "var(--accent)",
        //   foreground: "var(--accent-foreground)",
        // },
        // "accent-2": "var(--accent-2)",
        // "accent-3": "var(--accent-3)",
        // "body-light": "var(--body-light)",

        black: "hsl(0,0%,13.7%)",
        white: "hsl(0,0%,100%)",
        body: "hsl(0,0%,13.7%)",
        "heart-red": "hsl(0, 70.40%, 45.10%)",
        accent: {
          DEFAULT: "hsl(260.3, 80%, 80.4%)",
          foreground: "hsl(260.3, 80%, 80.4%)",
        },
        "accent-2": "hsl(277.1,14.3%,71.2%)",
        "accent-3": "hsl(258,8.1%,75.7%)",
        "body-light": "hsl(0,0%,100%)",

        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        // border: "hsl(var(--border))",
        border: "hsl(0, 0.00%, 85.50%)", //changed
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
        corePlugins: {
    preflight: false, // This disables Tailwind's base styles
  },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
};
export default config;
