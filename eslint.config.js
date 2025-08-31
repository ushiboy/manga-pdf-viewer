import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";

export default [
  // Base ESLint recommended rules
  js.configs.recommended,

  // Configuration for TypeScript and React files
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        // React global
        React: "readonly",
        // Vitest test globals
        vi: "readonly",
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
      "@typescript-eslint": tsPlugin,
      prettier,
    },
    rules: {
      // TypeScript recommended rules
      ...tsPlugin.configs.recommended.rules,

      // React recommended rules
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // JSX a11y recommended rules (with relaxed settings)
      ...jsxA11y.configs.recommended.rules,
      "jsx-a11y/no-noninteractive-element-interactions": "warn",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",

      // Prettier integration
      ...prettierConfig.rules,
      "prettier/prettier": "error",

      // React specific settings
      "react/react-in-jsx-scope": "off", // React 17+ doesn't need React import
      "react/prop-types": "off", // Using TypeScript for prop validation

      // TypeScript specific settings
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",

      // General JavaScript/TypeScript rules
      "no-console": "warn",
      "prefer-const": "error",
      "no-var": "error",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },

  // Configuration for test files
  {
    files: ["**/*.test.{ts,tsx,js,jsx}", "**/*.spec.{ts,tsx,js,jsx}"],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // Ignore patterns
  {
    ignores: [
      "dist/**",
      "build/**",
      "node_modules/**",
      "coverage/**",
      "*.min.js",
      "public/**",
      ".playwright-mcp/**",
      "dev-dist/**",
      "test-results/**",
      "playwright-report/**",
    ],
  },
];
