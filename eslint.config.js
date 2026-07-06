export default [
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: await import("@typescript-eslint/parser").then(m => m.default || m),
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      "no-unused-vars": "off",
    },
  },
];
