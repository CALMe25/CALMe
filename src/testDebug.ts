import { classifyStress } from './nlp/semanticParser';

// Test our classifier with various inputs
console.log('=== TESTING STRESS CLASSIFIER ===\n');

const testCases = [
  'high stress',
  'very very stressed',
  'I am very very stressed',
  'stressed',
  'I feel extremely anxious',
  'really really worried',
  'I\'m okay',
  'not calm at all',
  'I can\'t breathe'
];

testCases.forEach(text => {
  const result = classifyStress(text);
  console.log(`"${text}":`);
  console.log(`  Category: ${result.category} (${Math.round(result.confidence * 100)}%)`);
  console.log(`  Reasoning: ${result.reasoning}\n`);
});