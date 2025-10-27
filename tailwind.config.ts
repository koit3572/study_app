/* eslint-disable @typescript-eslint/no-require-imports */
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,md,mdx}", // ← md/mdx 꼭 포함!
  ],
  theme: { extend: {} },
  plugins: [
    require("@tailwindcss/typography"), // ← 등록
  ],
};
export default config;
