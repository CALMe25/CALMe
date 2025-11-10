// Type definitions for compromise.js methods used in this project
declare module "compromise" {
  interface CompromiseDocument {
    match(pattern: string): CompromiseDocument;
    out(format: "array" | "text" | "json"): string[] | string | unknown[];
    has(tag: string): boolean;
    terms(): { text?: string; [key: string]: unknown }[];
    json(): Array<{
      terms: Array<{
        text?: string;
        tags?: string[];
        [key: string]: unknown;
      }>;
      [key: string]: unknown;
    }>;
    compute(property: string): CompromiseDocument;
    tag(tag: string): CompromiseDocument;
    text(): string;
  }

  function nlp(text: string): CompromiseDocument;
  export default nlp;
}
