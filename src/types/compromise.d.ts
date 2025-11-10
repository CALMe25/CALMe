// Type definitions for compromise.js methods used in this project
declare module "compromise" {
  interface Term {
    text?: string;
    tags?: string[];
    normal?: string;
    implicit?: string;
    [key: string]: unknown;
  }

  interface Sentence {
    terms: Term[];
    text?: string;
    [key: string]: unknown;
  }

  interface CompromiseDocument {
    match(pattern: string): CompromiseDocument;
    out(format: "array"): string[];
    out(format: "text"): string;
    out(format: "json"): Sentence[];
    out(format: string): unknown;
    has(tag: string): boolean;
    found: boolean;
    length: number;
    terms(): { text: string; tags?: string[]; normal?: string }[];
    json(): Sentence[];
    compute(property: string): CompromiseDocument;
    tag(tag: string): CompromiseDocument;
    text(): string;
    if(condition: string): CompromiseDocument;
    not(pattern: string): CompromiseDocument;
    sentences(): CompromiseDocument;
    forEach(callback: (doc: CompromiseDocument) => void): void;
    toLowerCase(): CompromiseDocument;
    toUpperCase(): CompromiseDocument;
    toTitleCase(): CompromiseDocument;
    values(): CompromiseDocument;
    places(): { text: string }[];
    people(): { text: string }[];
    numbers(): { text: string }[];
    map(fn: (doc: CompromiseDocument) => string): string[];
    filter(fn: (doc: CompromiseDocument) => boolean): CompromiseDocument;
  }

  interface NlpStatic {
    (text: string): CompromiseDocument;
    plugin(plugin: unknown): void;
  }

  const nlp: NlpStatic;
  export default nlp;
}
