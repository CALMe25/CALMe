import nlp from "compromise";

export function debugParse(text: string) {
  console.log(`\n🔍 Debugging: "${text}"`);

  const doc = nlp(text);

  // Show the raw parsing data
  console.log("\n📊 Raw JSON:");
  console.log(JSON.stringify(doc.json(), null, 2));

  // Show what Compromise thinks each word is
  console.log("\n🏷️  Tags for each word:");
  doc.terms().forEach((term) => {
    const data = term.json()[0];
    if (data !== null && data !== undefined) {
      const tags = data.tags ?? [];
      const text = data.text ?? "";
      console.log(`  "${text}": [${tags.join(", ")}]`);
    }
  });

  // Try different matching patterns
  console.log("\n🎯 Pattern Matches:");
  console.log("  #Adjective:", doc.match("#Adjective").out("array"));
  console.log("  #Adverb:", doc.match("#Adverb").out("array"));
  console.log("  #Adverb+:", doc.match("#Adverb+").out("array"));
  console.log(
    "  #Adverb+ #Adjective:",
    doc.match("#Adverb+ #Adjective").out("array"),
  );
  console.log("  stressed:", doc.has("stressed"));
  console.log("  very:", doc.has("very"));

  // Check if "stressed" is being recognized
  const stressedTerm = doc.match("stressed");
  if (stressedTerm.found === true) {
    console.log('\n✅ Found "stressed":');
    const jsonData = stressedTerm.json()[0];
    if (jsonData !== null && jsonData !== undefined && jsonData.terms[0] !== null && jsonData.terms[0] !== undefined) {
      console.log("  Tags:", jsonData.terms[0].tags ?? []);
    }
  }

  // Try to force correct tagging
  console.log("\n🔧 Attempting to fix tagging:");
  const fixedDoc = nlp(text);
  fixedDoc.match("stressed").tag("Adjective");
  fixedDoc.match("very").tag("Adverb");

  console.log("  After tagging:");
  fixedDoc.terms().forEach((term) => {
    const data = term.json()[0];
    if (data !== null && data !== undefined) {
      const tags = data.tags ?? [];
      const text = data.text ?? "";
      console.log(`  "${text}": [${tags.join(", ")}]`);
    }
  });

  console.log(
    "\n  #Adverb+ #Adjective:",
    fixedDoc.match("#Adverb+ #Adjective").out("array"),
  );
}

// Run debug on problem case
debugParse("very very stressed");
debugParse("I am very very stressed");
debugParse("stressed");
debugParse("really anxious");
