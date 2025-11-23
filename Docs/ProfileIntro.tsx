// src/components/ProfileIntro.tsx
//guided user profile questions to parse information to save
//what should I call you? or what is your name?
//what are your preferred pronouns?
//where is your closest safe space? - stairway, public miklat, private mamad
//what is your preferred language? - hebrew, arabic, english
//what are your accessibility needs? - large text, high contrast, screen reader

import React from "react";

// Assuming UserProfile type is still needed within this component
interface UserProfile {
  name: string;
  age: number;
  primaryConcerns: string[];
  gender: string;
  language: "hebrew" | "arabic" | "english";
  accessibilityPreferences: string[];
}

// You might want to pass props to ProfileIntro later, but for now,
// let's make it a simple component that renders something.
const ProfileIntro: React.FC = () => {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "20px",
        margin: "20px",
        backgroundColor: "#910b76ff", // <--- ADDED THIS LINE HERE
      }}
    >
      <h2>Welcome to Profile Setup!</h2>
      <p>This is where the user profile introduction will go.</p>
      {/* You will add your actual profile setup UI here */}
    </div>
  );
};
console.log("ProfileIntro is rendering!");
export default ProfileIntro; // This line is crucial!
