import { classifySafety, classifyStress, extractLocation, analyzeText } from './semanticParser';

// Test cases for semantic parsing
export const testCases = {
  safety: [
    // Negations
    { text: "I'm not safe", expected: 'DANGER', description: 'Negated safety' },
    { text: "I am NOT okay", expected: 'DANGER', description: 'Negated okay' },
    
    // Danger indicators
    { text: "Help! I'm trapped in my apartment", expected: 'DANGER', description: 'Help request' },
    { text: "Still hearing sirens outside", expected: 'DANGER', description: 'Danger indicators' },
    { text: "The rockets are falling nearby", expected: 'DANGER', description: 'Direct danger' },
    
    // Safe indicators
    { text: "I'm safe in the shelter", expected: 'SAFE', description: 'Safe location' },
    { text: "We're okay at home", expected: 'SAFE', description: 'Confirmed safety' },
    { text: "I'm in the bunker and secure", expected: 'SAFE', description: 'Protected location' },
    
    // Unsure
    { text: "I think I'm safe", expected: 'UNSURE', description: 'Uncertainty' },
    { text: "Maybe okay, not sure", expected: 'UNSURE', description: 'Mixed signals' }
  ],
  
  stress: [
    // High stress / panic
    { text: "I can't breathe", expected: 'HIGH_STRESS', description: 'Panic symptom' },
    { text: "My heart is racing and I'm shaking", expected: 'HIGH_STRESS', description: 'Multiple symptoms' },
    { text: "Everything is spinning, I feel like I'm dying", expected: 'HIGH_STRESS', description: 'Severe panic' },
    { text: "I'm losing control", expected: 'HIGH_STRESS', description: 'Loss of control' },
    
    // Moderate stress
    { text: "I'm really worried and anxious", expected: 'MODERATE_STRESS', description: 'Anxiety' },
    { text: "Feeling very tense and scared", expected: 'MODERATE_STRESS', description: 'Fear and tension' },
    { text: "I'm not calm at all", expected: 'MODERATE_STRESS', description: 'Negated calm' },
    
    // Low stress
    { text: "I'm feeling better and more stable", expected: 'LOW_STRESS', description: 'Improvement' },
    { text: "I'm okay and managing fine", expected: 'LOW_STRESS', description: 'Stable state' },
    { text: "Things are under control now", expected: 'LOW_STRESS', description: 'Controlled state' }
  ],
  
  location: [
    // Clear locations
    { text: "I'm at 123 Main Street", expected: '123 Main Street', description: 'Street address' },
    { text: "I'm in the shelter", expected: 'the shelter', description: 'Prepositional phrase' },
    { text: "At home in Tel Aviv", expected: 'home in Tel Aviv', description: 'Multiple location info' },
    { text: "Currently at the hospital", expected: 'the hospital', description: 'Location with article' },
    
    // Just location words
    { text: "home", expected: 'home', description: 'Single word location' },
    { text: "My apartment building", expected: 'My apartment building', description: 'Location phrase' }
  ]
};

export function runTests() {
  console.log('🧪 Testing Semantic Parser\n');
  
  // Test safety classification
  console.log('📍 SAFETY CLASSIFICATION TESTS:');
  testCases.safety.forEach(test => {
    const result = classifySafety(test.text);
    const passed = result.category === test.expected;
    console.log(`${passed ? '✅' : '❌'} "${test.text}"`);
    console.log(`   Expected: ${test.expected}, Got: ${result.category} (${Math.round(result.confidence * 100)}%)`);
    console.log(`   Reasoning: ${result.reasoning}\n`);
  });
  
  // Test stress classification
  console.log('\n😰 STRESS CLASSIFICATION TESTS:');
  testCases.stress.forEach(test => {
    const result = classifyStress(test.text);
    const passed = result.category === test.expected;
    console.log(`${passed ? '✅' : '❌'} "${test.text}"`);
    console.log(`   Expected: ${test.expected}, Got: ${result.category} (${Math.round(result.confidence * 100)}%)`);
    console.log(`   Reasoning: ${result.reasoning}\n`);
  });
  
  // Test location extraction
  console.log('\n📍 LOCATION EXTRACTION TESTS:');
  testCases.location.forEach(test => {
    const result = extractLocation(test.text);
    const passed = result.extractedValue === test.expected;
    console.log(`${passed ? '✅' : '❌'} "${test.text}"`);
    console.log(`   Expected: "${test.expected}", Got: "${result.extractedValue}" (${Math.round(result.confidence * 100)}%)`);
    console.log(`   Method: ${result.extractionMethod}\n`);
  });
  
  // Test semantic analysis
  console.log('\n🔍 SEMANTIC ANALYSIS EXAMPLES:');
  const analysisExamples = [
    "I'm not safe and hearing sirens",
    "My heart won't stop racing",
    "I'm at the shelter on King Street"
  ];
  
  analysisExamples.forEach(text => {
    const analysis = analyzeText(text);
    console.log(`\n"${text}":`);
    console.log('  Sentiment:', analysis.sentiment);
    console.log('  Negations:', analysis.negations);
    console.log('  Places:', analysis.entities.places);
    console.log('  Tags:', analysis.tags.filter(tag => tag !== 'Term'));
  });
}