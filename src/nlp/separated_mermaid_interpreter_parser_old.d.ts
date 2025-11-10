/* eslint-disable @typescript-eslint/no-explicit-any */
declare class MermaidInterpreterParser {
  constructor();
  parse(mermaidCode: string): string; // Assuming parse takes a string and returns a string
  // Declare other methods/properties here with their types
}
declare class NLPParser {
  constructor();
  // parse(mermaidCode: string): string; // Assuming parse takes a string and returns a string
  // Declare other methods/properties here with their types
}
declare class ConversationController {
  constructor();
  createFromFile(filePath: string): object;
  initialize(filePath: string): null;
  getCurrentQuestion():any;
  processUserInput(userInput: string): {success: boolean, error: string};
  reloadFlowchart(filePath: string): null;
  getDebugInfo() :{ready:boolean, 
      interpreter: object,
      currentQuestion: object}
}

// declare function someUtilityFunction(input: any): number; // Declare other functions

// If your JS file uses `export default`
// declare const MermaidInterpreterParser: any;
// export default MermaidInterpreterParser;

// If your JS file exports multiple things, you can use `export =` or `export namespace`
// For commonjs/ESM interop, `export class` and `export function` are usually sufficient.

export { MermaidInterpreterParser, NLPParser, ConversationController };