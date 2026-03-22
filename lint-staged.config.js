/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
export default {
  "**/*.[jt]s?(x)": ["oxfmt", "oxlint --fix"],
  "**/*.ts?(x)": () => "tsc -p tsconfig.json --noEmit",
};
