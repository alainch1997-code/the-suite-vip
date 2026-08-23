const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const SUPABASE_URL = 'https://vfwitbvxflshpzqmyhvwl.supabase.co/rest/v1/bookings';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmd2l0YnZ4ZnNocHpxbXlodndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0ODM4MjksImV4cCI6MjEwMzA1OTgyOX0.wFvFMC6TpKGQLrj89fYC2eztXtnX4tE-NRZ1KcTpKPs';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': 'Bearer ' + SUPABASE_KEY,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// جلب المواعيد من Supabase عبر السيرفر
app.get('/api/bookings', async (req, res) => {
  try {
    const response = await fetch(SUPABASE_URL + '?select=*', { headers });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// حفظ موعد جديد بـ Supabase
app.post('/api/bookings', async (req, res) => {
  try {
    const response = await fetch(SUPABASE_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save booking' });
  }
});

// إلغاء موعد من Supabase
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const response = await fetch(`${SUPABASE_URL}?id=eq.${req.params.id}`, {
      method: 'DELETE',
      headers
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
