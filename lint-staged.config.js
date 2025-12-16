/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
export default {
  "**/*.[jt]s?(x)": ["oxfmt", "oxlint --type-aware --type-check --fix"],
  "**/*.ts?(x)": () => "tsc -p tsconfig.json --noEmit",
};
