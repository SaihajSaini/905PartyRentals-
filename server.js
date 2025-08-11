const fs = require('fs');
const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

const PRICES = {
  'Popcorn Machine': 60,
  'Cotton Candy Machine': 60,
  'Bouncy Castle': 130,
  'Ball Pit': 150
};
const DELIVERY_FEE = 50;

const dataDir = path.join(__dirname, 'data');
const bookingsFile = path.join(dataDir, 'bookings.json');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(bookingsFile)) fs.writeFileSync(bookingsFile, '[]');

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/api/book', async (req, res) => {
  const b = req.body || {};
  if (!b.name || !b.email || !b.phone || !b.eventDate || !Array.isArray(b.items) || b.items.length === 0) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  const lineItems = b.items.map(i => ({ name: i, price: PRICES[i] || 0 }));
  const subtotal = lineItems.reduce((s, li) => s + li.price, 0);
  const delivery = b.wantDelivery ? DELIVERY_FEE : 0;
  const total = subtotal + delivery;
  const booking = { ...b, id: Date.now(), total };

  const all = JSON.parse(fs.readFileSync(bookingsFile));
  all.push(booking);
  fs.writeFileSync(bookingsFile, JSON.stringify(all, null, 2));

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, TO_EMAIL } = process.env;
  if (SMTP_HOST && SMTP_USER && SMTP_PASS && TO_EMAIL) {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
    await transporter.sendMail({
      from: `"905PartyRentals" <${SMTP_USER}>`,
      to: TO_EMAIL,
      subject: `New booking — $${total}`,
      text: JSON.stringify(booking, null, 2)
    });
  }

  res.json({ ok: true, total });
});

app.listen(PORT, () => console.log(`✅ 905PartyRentals running: http://localhost:${PORT}`));
