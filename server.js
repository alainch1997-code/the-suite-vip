const http = require('http');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const PORT = process.env.PORT || 3000;
const SUPABASE_URL = 'https://vfwitbvxflshpzqmyhvwl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmd2l0YnZ4ZnNocHpxbXlodndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0ODM4MjksImV4cCI6MjEwMzA1OTgyOX0.wFvFMC6TpKGQLrj89fYC2eztXtnX4tE-NRZ1KcTpKPs';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const server = http.createServer(async (req, res) => {
  // 1. تقديم ملف index.html
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

  // 2. جلب كافة الحجوزات
  if (req.method === 'GET' && req.url === '/api/bookings') {
    try {
      const { data, error } = await supabase.from('bookings').select('*');
      if (error) throw error;
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data || []));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: e.message }));
    }
    return;
  }

  // 3. إضافة حجز جديد
  if (req.method === 'POST' && req.url === '/api/bookings') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const bookingData = JSON.parse(body);
        const { data, error } = await supabase.from('bookings').insert([bookingData]).select();
        
        if (error) throw error;

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: e.message }));
      }
    });
    return;
  }

  // 4. إلغاء حجز
  if (req.method === 'DELETE' && req.url.startsWith('/api/bookings/')) {
    const id = req.url.split('/')[3];
    try {
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (error) throw error;

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: e.message }));
    }
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
