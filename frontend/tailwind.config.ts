import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0066cc',
        secondary: '#ff6b6b',
        success: '#51cf66',
        warning: '#ffd43b',
        danger: '#ff6b6b',
        info: '#74c0fc',
      },
    },
  },
  plugins: [],
}
export default config
