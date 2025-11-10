// Type definition for Compromise.js document (external library without TS types)
export interface CompromiseDoc {
  json(): unknown[];
  match(pattern: string): CompromiseDoc;
  found: boolean;
  has(pattern: string): boolean;
  out(format: string): string[];
  terms(): CompromiseDoc;
  // Add other methods as needed
}

interface QuestionData {
  id: string;
  text: string;
  type: string;
}

declare class MermaidInterpreterParser {
  constructor();
  parse(mermaidCode: string): string;
}

declare class NLPParser {
  constructor();
}

declare class ConversationController {
  constructor();
  createFromFile(filePath: string): object;
  initialize(filePath: string): null;
  getCurrentQuestion(): QuestionData | null;
  processUserInput(userInput: string): {success: boolean, error: string};
  reloadFlowchart(filePath: string): null;
  getDebugInfo(): {
    ready: boolean,
    interpreter: object,
    currentQuestion: object
  }
}

// declare function someUtilityFunction(input: any): number; // Declare other functions

// If your JS file uses `export default`
// declare const MermaidInterpreterParser: any;
// export default MermaidInterpreterParser;

// If your JS file exports multiple things, you can use `export =` or `export namespace`
// For commonjs/ESM interop, `export class` and `export function` are usually sufficient.

export { MermaidInterpreterParser, NLPParser, ConversationController };