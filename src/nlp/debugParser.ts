import nlp from "compromise";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

const getTermData = (
  value: unknown,
): { text: string; tags: string[] } | null => {
  if (!isRecord(value)) {
    return null;
  }
  const text = typeof value.text === "string" ? value.text : "";
  const tags = toStringArray(value.tags);
  return { text, tags };
};

export function debugParse(text: string) {
  console.log(`\n🔍 Debugging: "${text}"`);

  const doc = nlp(text);

  // Show the raw parsing data
  console.log("\n📊 Raw JSON:");
  console.log(JSON.stringify(doc.json(), null, 2));

  // Show what Compromise thinks each word is
  console.log("\n🏷️  Tags for each word:");
  doc.terms().forEach((term) => {
    const jsonData = term.json();
    const data = Array.isArray(jsonData) ? getTermData(jsonData[0]) : null;
    if (data != null) {
      console.log(`  "${data.text}": [${data.tags.join(", ")}]`);
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
  if (stressedTerm.found) {
    console.log('\n✅ Found "stressed":');
    const stressedJson = stressedTerm.json();
    const stressedData = Array.isArray(stressedJson) ? stressedJson[0] : null;
    if (isRecord(stressedData) && Array.isArray(stressedData.terms)) {
      const [firstTerm] = stressedData.terms;
      if (isRecord(firstTerm)) {
        console.log("  Tags:", toStringArray(firstTerm.tags));
      }
    }
  }

  // Try to force correct tagging
  console.log("\n🔧 Attempting to fix tagging:");
  const fixedDoc = nlp(text);
  fixedDoc.match("stressed").tag("Adjective");
  fixedDoc.match("very").tag("Adverb");

  console.log("  After tagging:");
  fixedDoc.terms().forEach((term) => {
    const jsonData = term.json();
    const data = Array.isArray(jsonData) ? getTermData(jsonData[0]) : null;
    if (data != null) {
      console.log(`  "${data.text}": [${data.tags.join(", ")}]`);
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
