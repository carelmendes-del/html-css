const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const multer = require('multer');
const path = require('path');
const { buildCVPrompt, buildCartaPrompt, buildChatPrompt, buildReviewPrompt, buildProfilePrompt } = require('./prompt');
const { chamarIA } = require('./api');
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

// Configure Multer for file uploads (e.g. profile pictures)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

app.post('/api/upload', authenticate, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum ficheiro enviado' });
  }
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

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

app.get('/api/cvs/:id', authenticate, (req, res) => {
  db.get('SELECT * FROM cvs WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'CV not found' });
    res.json({ ...row, data: JSON.parse(row.data) });
  });
});

app.delete('/api/cvs/:id', authenticate, (req, res) => {
  db.run('DELETE FROM cvs WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'CV not found' });
    res.json({ success: true });
  });
});

// Cover Letter Routes
app.get('/api/cover-letters', authenticate, (req, res) => {
  db.all('SELECT * FROM cover_letters WHERE user_id = ? ORDER BY created_at DESC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(row => {
      try { return { ...row, content: JSON.parse(row.content) }; } 
      catch { return row; }
    }));
  });
});

app.get('/api/cover-letters/:id', authenticate, (req, res) => {
  db.get('SELECT * FROM cover_letters WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Cover letter not found' });
    try {
      res.json({ ...row, content: JSON.parse(row.content) });
    } catch {
      res.json(row);
    }
  });
});

app.post('/api/cover-letters', authenticate, (req, res) => {
  const { title, content } = req.body;
  const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
  db.run('INSERT INTO cover_letters (user_id, title, content) VALUES (?, ?, ?)', [req.user.id, title, contentStr], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, title, content });
  });
});

app.put('/api/cover-letters/:id', authenticate, (req, res) => {
  const { title, content } = req.body;
  const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
  db.run('UPDATE cover_letters SET title = ?, content = ? WHERE id = ? AND user_id = ?', 
    [title, contentStr, req.params.id, req.user.id], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Cover letter not found' });
      res.json({ success: true });
    }
  );
});

app.delete('/api/cover-letters/:id', authenticate, (req, res) => {
  db.run('DELETE FROM cover_letters WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Cover letter not found' });
    res.json({ success: true });
  });
});

// AI Routes (Integração com Anthropic)
app.post('/api/ai/chat', authenticate, async (req, res) => {
  try {
    const { historicoConversa } = req.body;
    if (!historicoConversa || !Array.isArray(historicoConversa)) {
      return res.status(400).json({ error: 'historicoConversa é obrigatório e deve ser um array.' });
    }
    const prompt = buildChatPrompt(historicoConversa);
    const response = await chamarIA(prompt);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/profile', authenticate, async (req, res) => {
  try {
    const { dados } = req.body;
    const prompt = buildProfilePrompt(dados);
    const response = await chamarIA(prompt);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/generate-cv', authenticate, async (req, res) => {
  try {
    const { dados, vaga } = req.body;
    const prompt = buildCVPrompt(dados, vaga);
    const cvJson = await chamarIA(prompt);
    res.json(cvJson);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/generate-cover-letter', authenticate, async (req, res) => {
  try {
    const { dados, vaga, empresa } = req.body;
    const prompt = buildCartaPrompt(dados, vaga, empresa);
    const result = await chamarIA(prompt);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/review', authenticate, async (req, res) => {
  try {
    const { cvGerado } = req.body;
    // Se o frontend enviar formato objeto, passamos para string
    const stringData = typeof cvGerado === 'string' ? cvGerado : JSON.stringify(cvGerado, null, 2);
    const prompt = buildReviewPrompt(stringData);
    const reviewResult = await chamarIA(prompt);
    res.json(reviewResult);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
