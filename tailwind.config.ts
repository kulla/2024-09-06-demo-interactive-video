import colors from 'tailwindcss/colors'

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: { organge: colors.orange, gray: colors.gray },
      spacing: { side: '16px' },
    },
  },
  plugins: [],
}
export default config
