import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const app = new Hono();

const WHITELIST_KEY = 'vic_operator_whitelist';

// GET /make-server-3bba8be8/vic-operator-whitelist - Load whitelist
app.get("/make-server-3bba8be8/vic-operator-whitelist", async (c) => {
  try {
    console.log('📋 Loading VIC operator whitelist...');
    
    const operators = await kv.get(WHITELIST_KEY) || [];
    
    console.log(`✅ Loaded ${operators.length} operators from whitelist`);
    
    return c.json({ operators });
  } catch (error: any) {
    console.error("Error loading whitelist:", error);
    return c.json({ error: error.message || "Failed to load whitelist" }, 500);
  }
});

// POST /make-server-3bba8be8/vic-operator-whitelist - Save whitelist
app.post("/make-server-3bba8be8/vic-operator-whitelist", async (c) => {
  try {
    const body = await c.req.json();
    const { operators } = body;
    
    if (!Array.isArray(operators)) {
      return c.json({ error: "operators must be an array" }, 400);
    }
    
    console.log(`💾 Saving ${operators.length} operators to whitelist...`);
    
    // Validate all are strings
    const invalidOperators = operators.filter(op => typeof op !== 'string' || op.trim() === '');
    if (invalidOperators.length > 0) {
      return c.json({ error: "All operators must be non-empty strings" }, 400);
    }
    
    // Save to KV store
    await kv.set(WHITELIST_KEY, operators);
    
    console.log(`✅ Saved ${operators.length} operators to whitelist`);
    
    return c.json({ 
      success: true, 
      count: operators.length,
      operators 
    });
  } catch (error: any) {
    console.error("Error saving whitelist:", error);
    return c.json({ error: error.message || "Failed to save whitelist" }, 500);
  }
});

export default app;
