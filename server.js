const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const SUPABASE_URL = 'https://vfwitbvxflshpzqmyhvwl.supabase.co/rest/v1/bookings';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmd2l0YnZ4ZnNocHpxbXlodndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0ODM4MjksImV4cCI6MjEwMzA1OTgyOX0.wFvFMC6TpKGQLrj89fYC2eztXtnX4tE-NRZ1KcTpKPs';

const server = http.createServer(async (req, res) => {
  // 1. تقديم صفحة HTML
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading index.html');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content, 'utf-8');
      }
    });
    return;
  }

  // 2. جلب الحجوزات من Supabase
  if (req.method === 'GET' && req.url === '/api/bookings') {
    try {
      const response = await fetch(`${SUPABASE_URL}?select=*`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      const data = await response.json();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // 3. إضافة حجز جديد إلى Supabase
  if (req.method === 'POST' && req.url === '/api/bookings') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const response = await fetch(SUPABASE_URL, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: body
        });
        const data = await response.json();
        res.writeHead(response.status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      } catch (e) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // 4. إلغاء حجز من Supabase
  if (req.method === 'DELETE' && req.url.startsWith('/api/bookings/')) {
    const id = req.url.split('/')[3];
    try {
      const response = await fetch(`${SUPABASE_URL}?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
