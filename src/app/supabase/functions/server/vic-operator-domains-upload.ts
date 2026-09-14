import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Check if operator domains CSV exists
app.get('/make-server-3bba8be8/vic-operator-domains/check', async (c) => {
  try {
    const csvData = await kv.get('vic-operator-domains-csv');
    
    if (!csvData) {
      return c.json({ exists: false, count: 0 });
    }

    const lines = csvData.trim().split('\n');
    const count = Math.max(0, lines.length - 1); // Subtract header

    return c.json({ exists: true, count });
  } catch (error: any) {
    console.error('Check error:', error);
    return c.json({ exists: false, count: 0 });
  }
});

// Upload operator domains CSV to KV store
app.post('/make-server-3bba8be8/vic-operator-domains/upload', async (c) => {
  try {
    const body = await c.req.json();
    const csvData = body.csvData;

    if (!csvData || typeof csvData !== 'string') {
      return c.json({ success: false, error: 'Invalid CSV data' }, 400);
    }

    // Basic validation
    const lines = csvData.trim().split('\n');
    if (lines.length < 2) {
      return c.json({ success: false, error: 'CSV appears to be empty' }, 400);
    }

    // Check header
    const header = lines[0].toLowerCase();
    if (!header.includes('operator') || !header.includes('domain')) {
      return c.json({ 
        success: false, 
        error: 'CSV must have "operator" and "domain" columns' 
      }, 400);
    }

    // Store in KV
    await kv.set('vic-operator-domains-csv', csvData);

    console.log(`✅ Stored operator domains CSV (${lines.length - 1} operators)`);

    return c.json({
      success: true,
      message: `Successfully stored ${lines.length - 1} operator domains`,
      count: lines.length - 1
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return c.json({ 
      success: false, 
      error: error.message || 'Failed to upload CSV' 
    }, 500);
  }
});

export default app;