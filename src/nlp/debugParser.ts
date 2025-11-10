// @ts-expect-error - Compromise doesn't have TypeScript definitions
import nlp from 'compromise';

export function debugParse(text: string) {
  console.log(`\n🔍 Debugging: "${text}"`);

  const doc = nlp(text);

  // Show the raw parsing data
  console.log('\n📊 Raw JSON:');
  console.log(JSON.stringify(doc.json(), null, 2));

  // Show what Compromise thinks each word is
  console.log('\n🏷️  Tags for each word:');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doc.terms().forEach((term: any) => {
    const data = term.json()[0];
    console.log(`  "${data.text}": [${data.tags.join(', ')}]`);
  });
  
  // Try different matching patterns
  console.log('\n🎯 Pattern Matches:');
  console.log('  #Adjective:', doc.match('#Adjective').out('array'));
  console.log('  #Adverb:', doc.match('#Adverb').out('array'));
  console.log('  #Adverb+:', doc.match('#Adverb+').out('array'));
  console.log('  #Adverb+ #Adjective:', doc.match('#Adverb+ #Adjective').out('array'));
  console.log('  stressed:', doc.has('stressed'));
  console.log('  very:', doc.has('very'));
  
  // Check if "stressed" is being recognized
  const stressedTerm = doc.match('stressed');
  if (stressedTerm.found) {
    console.log('\n✅ Found "stressed":');
    console.log('  Tags:', stressedTerm.json()[0].terms[0].tags);
  }
  
  // Try to force correct tagging
  console.log('\n🔧 Attempting to fix tagging:');
  const fixedDoc = nlp(text);
  fixedDoc.match('stressed').tag('Adjective');
  fixedDoc.match('very').tag('Adverb');
  
  console.log('  After tagging:');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fixedDoc.terms().forEach((term: any) => {
    const data = term.json()[0];
    console.log(`  "${data.text}": [${data.tags.join(', ')}]`);
  });
  
  console.log('\n  #Adverb+ #Adjective:', fixedDoc.match('#Adverb+ #Adjective').out('array'));
}

// Run debug on problem case
debugParse('very very stressed');
debugParse('I am very very stressed');
debugParse('stressed');
debugParse('really anxious');