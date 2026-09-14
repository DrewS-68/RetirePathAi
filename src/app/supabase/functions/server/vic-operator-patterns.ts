import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const app = new Hono();

const PATTERNS_KEY = 'vic_operator_url_patterns';

export interface OperatorPattern {
  operator: string;
  baseUrl: string;
  pattern: string; // URL pattern with placeholders: {state}, {village}, {villageSlug}
  verified: boolean; // Has this pattern been verified to work?
  exampleUrl?: string; // Example of a working URL
}

// GET /make-server-3bba8be8/vic-operator-patterns - Load patterns
app.get("/make-server-3bba8be8/vic-operator-patterns", async (c) => {
  try {
    console.log('📋 Loading VIC operator URL patterns...');
    
    const patterns = await kv.get(PATTERNS_KEY) || [];
    
    console.log(`✅ Loaded ${patterns.length} operator patterns`);
    
    return c.json({ patterns });
  } catch (error: any) {
    console.error("Error loading patterns:", error);
    return c.json({ error: error.message || "Failed to load patterns" }, 500);
  }
});

// POST /make-server-3bba8be8/vic-operator-patterns - Save patterns
app.post("/make-server-3bba8be8/vic-operator-patterns", async (c) => {
  try {
    const body = await c.req.json();
    const { patterns } = body;
    
    if (!Array.isArray(patterns)) {
      return c.json({ error: "patterns must be an array" }, 400);
    }
    
    console.log(`💾 Saving ${patterns.length} operator patterns...`);
    
    // Validate structure
    for (const pattern of patterns) {
      if (!pattern.operator || !pattern.baseUrl || !pattern.pattern) {
        return c.json({ error: "Each pattern must have operator, baseUrl, and pattern" }, 400);
      }
    }
    
    // Save to KV store
    await kv.set(PATTERNS_KEY, patterns);
    
    console.log(`✅ Saved ${patterns.length} operator patterns`);
    
    return c.json({ 
      success: true, 
      count: patterns.length,
      patterns 
    });
  } catch (error: any) {
    console.error("Error saving patterns:", error);
    return c.json({ error: error.message || "Failed to save patterns" }, 500);
  }
});

// POST /make-server-3bba8be8/vic-operator-patterns/add - Add a single pattern
app.post("/make-server-3bba8be8/vic-operator-patterns/add", async (c) => {
  try {
    const body = await c.req.json();
    const { operator, baseUrl, pattern, verified, exampleUrl } = body;
    
    if (!operator || !baseUrl || !pattern) {
      return c.json({ error: "operator, baseUrl, and pattern are required" }, 400);
    }
    
    console.log(`➕ Adding pattern for operator: ${operator}`);
    
    const patterns = await kv.get(PATTERNS_KEY) || [];
    
    // Check if operator already exists
    const existingIndex = patterns.findIndex((p: OperatorPattern) => p.operator === operator);
    
    const newPattern: OperatorPattern = {
      operator,
      baseUrl,
      pattern,
      verified: verified || false,
      exampleUrl
    };
    
    if (existingIndex >= 0) {
      patterns[existingIndex] = newPattern;
      console.log(`✅ Updated pattern for ${operator}`);
    } else {
      patterns.push(newPattern);
      console.log(`✅ Added new pattern for ${operator}`);
    }
    
    await kv.set(PATTERNS_KEY, patterns);
    
    return c.json({ 
      success: true,
      pattern: newPattern,
      totalPatterns: patterns.length
    });
  } catch (error: any) {
    console.error("Error adding pattern:", error);
    return c.json({ error: error.message || "Failed to add pattern" }, 500);
  }
});

export default app;
