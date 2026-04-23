import { useState } from "react";
 
const COLORS = {
  bg: "#F7F3ED",
  paper: "#FFFDF9",
  ink: "#1C1A16",
  muted: "#7A7468",
  accent: "#D4601A",
  accentLight: "#F4E4D4",
  green: "#3A6B45",
  greenLight: "#E4F0E8",
  border: "#E2DDD6",
};
 
const ingredientSuggestions = [
  "eggs", "chicken breast", "ground beef", "pasta", "rice", "potatoes",
  "onion", "garlic", "tomatoes", "spinach", "broccoli", "carrots",
  "cheese", "milk", "butter", "olive oil", "beans", "lentils",
  "bread", "flour", "canned tomatoes", "soy sauce", "lemons",
];
 
export default function App() {
  const [ingredients, setIngredients] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [meals, setMeals] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedMeal, setExpandedMeal] = useState(null);
  const [dietPref, setDietPref] = useState("none");
 
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    if (val.length > 1) {
      const filtered = ingredientSuggestions.filter(
        (s) => s.includes(val.toLowerCase()) && !ingredients.includes(s)
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };
 
  const addIngredient = (item) => {
    const trimmed = item.trim().toLowerCase();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
    }
    setInputValue("");
    setSuggestions([]);
  };
 
  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && inputValue.trim()) {
      e.preventDefault();
      addIngredient(inputValue);
    }
  };
 
  const removeIngredient = (item) => {
    setIngredients(ingredients.filter((i) => i !== item));
  };
 
  const generateMeals = async () => {
    if (ingredients.length < 2) return;
    setLoading(true);
    setMeals(null);
    setError(null);
    setExpandedMeal(null);
 
    const dietNote = dietPref !== "none" ? `The user prefers ${dietPref} meals.` : "";
 
    const prompt = `You are a creative home cook assistant. The user has these leftover ingredients: ${ingredients.join(", ")}. ${dietNote}
 
Generate exactly 3 meal ideas they can make. Respond ONLY with valid JSON (no markdown, no backticks), in this format:
{
  "meals": [
    {
      "name": "Meal Name",
      "emoji": "🍳",
      "time": "20 min",
      "difficulty": "Easy",
      "description": "One sentence description.",
      "ingredients_used": ["ingredient1", "ingredient2"],
      "missing": ["optional ingredient"],
      "steps": ["Step 1", "Step 2", "Step 3", "Step 4"]
    }
  ]
}`;
 
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      const text = data.content.map((b) => b.text || "").join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setMeals(parsed.meals);
    } catch (err) {
      setError("Couldn't generate meals. Please try again.");
    } finally {
      setLoading(false);
    }
  };
 
  const difficultyColor = (d) =>
    d === "Easy" ? COLORS.green : d === "Medium" ? COLORS.accent : "#8B2FC9";
 
  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "'Georgia', serif" }}>
      {/* Header */}
      <div style={{
        background: COLORS.ink,
        color: COLORS.paper,
        padding: "24px 32px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        borderBottom: `4px solid ${COLORS.accent}`,
      }}>
        <span style={{ fontSize: 36 }}>🥘</span>
        <div>
          <div style={{ fontSize: 24, fontWeight: "bold", letterSpacing: "-0.5px" }}>
            Leftover Meal Planner
          </div>
          <div style={{ fontSize: 13, color: "#A09890", marginTop: 2 }}>
            Turn what's in your fridge into a real meal
          </div>
        </div>
      </div>
 
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px" }}>
 
        {/* Ingredient Input */}
        <div style={{
          background: COLORS.paper,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 12,
          padding: 24,
          marginBottom: 20,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          <label style={{ fontSize: 13, fontWeight: "bold", color: COLORS.muted, textTransform: "uppercase", letterSpacing: 1 }}>
            What's in your fridge?
          </label>
 
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12, minHeight: 36 }}>
            {ingredients.map((item) => (
              <span key={item} style={{
                background: COLORS.accentLight,
                color: COLORS.accent,
                borderRadius: 20,
                padding: "5px 12px",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "sans-serif",
              }}>
                {item}
                <button onClick={() => removeIngredient(item)} style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: COLORS.accent, fontSize: 16, lineHeight: 1, padding: 0,
                }}>×</button>
              </span>
            ))}
          </div>
 
          <div style={{ position: "relative", marginTop: 12 }}>
            <input
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type an ingredient and press Enter..."
              style={{
                width: "100%",
                padding: "10px 14px",
                border: `1px solid ${COLORS.border}`,
                borderRadius: 8,
                fontSize: 15,
                fontFamily: "sans-serif",
                background: COLORS.bg,
                color: COLORS.ink,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            {suggestions.length > 0 && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0, right: 0,
                background: COLORS.paper,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 8,
                marginTop: 4,
                zIndex: 10,
                overflow: "hidden",
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              }}>
                {suggestions.map((s) => (
                  <div key={s} onClick={() => addIngredient(s)} style={{
                    padding: "9px 14px",
                    cursor: "pointer",
                    fontFamily: "sans-serif",
                    fontSize: 14,
                    color: COLORS.ink,
                    borderBottom: `1px solid ${COLORS.border}`,
                  }}>
                    + {s}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 6, fontFamily: "sans-serif" }}>
            Press Enter or comma to add · {ingredients.length} ingredient{ingredients.length !== 1 ? "s" : ""} added
          </div>
        </div>
 
        {/* Diet Preference */}
        <div style={{
          background: COLORS.paper,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          <label style={{ fontSize: 13, fontWeight: "bold", color: COLORS.muted, textTransform: "uppercase", letterSpacing: 1 }}>
            Dietary Preference
          </label>
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            {["none", "vegetarian", "vegan", "low-carb", "quick (under 20 min)"].map((opt) => (
              <button key={opt} onClick={() => setDietPref(opt)} style={{
                padding: "7px 14px",
                borderRadius: 20,
                border: `1.5px solid ${dietPref === opt ? COLORS.accent : COLORS.border}`,
                background: dietPref === opt ? COLORS.accentLight : "transparent",
                color: dietPref === opt ? COLORS.accent : COLORS.muted,
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "sans-serif",
                fontWeight: dietPref === opt ? "bold" : "normal",
              }}>
                {opt === "none" ? "No preference" : opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>
        </div>
 
        {/* Generate Button */}
        <button
          onClick={generateMeals}
          disabled={ingredients.length < 2 || loading}
          style={{
            width: "100%",
            padding: "15px",
            background: ingredients.length < 2 || loading ? COLORS.border : COLORS.accent,
            color: ingredients.length < 2 || loading ? COLORS.muted : "white",
            border: "none",
            borderRadius: 10,
            fontSize: 16,
            fontWeight: "bold",
            cursor: ingredients.length < 2 || loading ? "not-allowed" : "pointer",
            fontFamily: "sans-serif",
            marginBottom: 28,
          }}
        >
          {loading ? "🍳 Finding meals..." : ingredients.length < 2 ? "Add at least 2 ingredients" : "✨ Generate Meal Ideas"}
        </button>
 
        {/* Error */}
        {error && (
          <div style={{ background: "#FEE2E2", color: "#B91C1C", padding: 14, borderRadius: 8, marginBottom: 20, fontFamily: "sans-serif", fontSize: 14 }}>
            {error}
          </div>
        )}
 
        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                height: 80,
                background: COLORS.paper,
                borderRadius: 12,
                border: `1px solid ${COLORS.border}`,
                opacity: 0.6,
              }} />
            ))}
          </div>
        )}
 
        {/* Meal Results */}
        {meals && (
          <div>
            <div style={{ fontSize: 13, color: COLORS.muted, fontFamily: "sans-serif", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>
              {meals.length} meal ideas for your ingredients
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {meals.map((meal, idx) => (
                <div key={idx} style={{
                  background: COLORS.paper,
                  border: `1px solid ${expandedMeal === idx ? COLORS.accent : COLORS.border}`,
                  borderRadius: 12,
                  overflow: "hidden",
                  boxShadow: expandedMeal === idx ? `0 4px 20px rgba(212,96,26,0.12)` : "0 2px 8px rgba(0,0,0,0.04)",
                }}>
                  <div
                    onClick={() => setExpandedMeal(expandedMeal === idx ? null : idx)}
                    style={{ padding: "18px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}
                  >
                    <span style={{ fontSize: 36 }}>{meal.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 18, fontWeight: "bold", color: COLORS.ink }}>{meal.name}</div>
                      <div style={{ fontSize: 13, color: COLORS.muted, fontFamily: "sans-serif", marginTop: 2 }}>{meal.description}</div>
                      <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, fontFamily: "sans-serif", color: COLORS.muted }}>⏱ {meal.time}</span>
                        <span style={{ fontSize: 12, fontFamily: "sans-serif", color: difficultyColor(meal.difficulty), fontWeight: "bold" }}>
                          ● {meal.difficulty}
                        </span>
                        <span style={{ fontSize: 12, fontFamily: "sans-serif", color: COLORS.green }}>
                          ✓ Uses {meal.ingredients_used?.length} of your ingredients
                        </span>
                      </div>
                    </div>
                    <span style={{ color: COLORS.muted, fontSize: 20, fontFamily: "sans-serif" }}>
                      {expandedMeal === idx ? "▲" : "▼"}
                    </span>
                  </div>
 
                  {expandedMeal === idx && (
                    <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${COLORS.border}` }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
                        <div style={{ background: COLORS.greenLight, borderRadius: 8, padding: 14 }}>
                          <div style={{ fontSize: 12, fontWeight: "bold", color: COLORS.green, textTransform: "uppercase", letterSpacing: 1, fontFamily: "sans-serif", marginBottom: 8 }}>
                            ✓ You have
                          </div>
                          {meal.ingredients_used?.map((ing) => (
                            <div key={ing} style={{ fontSize: 14, color: COLORS.ink, fontFamily: "sans-serif", marginBottom: 4 }}>• {ing}</div>
                          ))}
                        </div>
                        <div style={{ background: meal.missing?.length ? COLORS.accentLight : COLORS.greenLight, borderRadius: 8, padding: 14 }}>
                          <div style={{ fontSize: 12, fontWeight: "bold", color: meal.missing?.length ? COLORS.accent : COLORS.green, textTransform: "uppercase", letterSpacing: 1, fontFamily: "sans-serif", marginBottom: 8 }}>
                            {meal.missing?.length ? "🛒 Might need" : "🎉 No extras needed"}
                          </div>
                          {meal.missing?.length ? meal.missing.map((ing) => (
                            <div key={ing} style={{ fontSize: 14, color: COLORS.ink, fontFamily: "sans-serif", marginBottom: 4 }}>• {ing}</div>
                          )) : (
                            <div style={{ fontSize: 13, color: COLORS.green, fontFamily: "sans-serif" }}>You have everything!</div>
                          )}
                        </div>
                      </div>
 
                      <div style={{ marginTop: 16 }}>
                        <div style={{ fontSize: 12, fontWeight: "bold", color: COLORS.muted, textTransform: "uppercase", letterSpacing: 1, fontFamily: "sans-serif", marginBottom: 10 }}>
                          How to make it
                        </div>
                        {meal.steps?.map((step, si) => (
                          <div key={si} style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "flex-start" }}>
                            <span style={{
                              minWidth: 24, height: 24,
                              background: COLORS.accent,
                              color: "white",
                              borderRadius: "50%",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 12, fontWeight: "bold", fontFamily: "sans-serif",
                              marginTop: 1,
                            }}>{si + 1}</span>
                            <span style={{ fontSize: 14, color: COLORS.ink, fontFamily: "sans-serif", lineHeight: 1.5 }}>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
