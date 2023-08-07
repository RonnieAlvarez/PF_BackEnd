export const env = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: "standard",
  extends: "eslint:recommended",
  plugins: ["hbs"],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    quotes: ["error", "double"],
    "comma-dangle": ["error", "only-multiline"],
    indent: ["error", 2],
    "hbs/check-hbs-template-literals": 2,
  },
};
