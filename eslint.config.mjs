// eslint.config.mjs
import { Linter } from "eslint";

export default /** @type {Linter.Config} */ ({
  root: true,
  parser: "@typescript-eslint/parser", // string, not a function
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "next/core-web-vitals"
  ],
  rules: {
    // your custom rules
  },
});
