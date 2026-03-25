const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const multer = require('multer');
const path = require('path');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || 'cvstudio-super-secret-key-2024';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database setup
const db = new sqlite3.Database('./cvstudio.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      name TEXT,
      password TEXT,
      google_id TEXT,
      picture TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS cvs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT,
      data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS cover_letters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT,
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
  }
});

// Auth Routes
app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token missing' });

  try {
    // Note: in a real app, verify the token against Google servers
    // But since this is local testing sometimes we bypass or mock:
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;

    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      
      if (user) {
        const jwtToken = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '7d' });
        return res.json({ token: jwtToken, user });
      } else {
        db.run('INSERT INTO users (email, name, google_id, picture) VALUES (?, ?, ?, ?)', [email, name, sub, picture], function(err) {
          if (err) return res.status(500).json({ error: err.message });
          const newUser = { id: this.lastID, email, name, picture };
          const jwtToken = jwt.sign({ id: newUser.id, email }, SECRET_KEY, { expiresIn: '7d' });
          res.json({ token: jwtToken, user: newUser });
        });
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid Google token' });
  }
});

// Setup auth middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// CV Routes
app.get('/api/cvs', authenticate, (req, res) => {
  db.all('SELECT * FROM cvs WHERE user_id = ? ORDER BY updated_at DESC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(row => ({ ...row, data: JSON.parse(row.data) })));
  });
});

app.post('/api/cvs', authenticate, (req, res) => {
  const { title, data } = req.body;
  db.run('INSERT INTO cvs (user_id, title, data) VALUES (?, ?, ?)', [req.user.id, title, JSON.stringify(data)], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, title, data });
  });
});

app.put('/api/cvs/:id', authenticate, (req, res) => {
  const { title, data } = req.body;
  db.run('UPDATE cvs SET title = ?, data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?', 
    [title, JSON.stringify(data), req.params.id, req.user.id], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'CV not found' });
      res.json({ success: true });
    }
  );
});

// Removed AI routes as per user request to be API-free

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
