// eslint.config.mjs
import { Linter } from "eslint";

export default [
  {
    files: ["**/*.{js,ts,tsx}"],
    languageOptions: {
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
    },
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "next/core-web-vitals",
    ],
    rules: {
      // your custom rules
    },
  },
];
