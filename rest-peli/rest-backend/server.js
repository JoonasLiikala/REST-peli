const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');

// Lataa ympäristömuuttujat .env-tiedostosta
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Salli CORS, jotta frontend voi tehdä pyyntöjä backendiin
app.use(cors());

// Luo tietokantayhteys
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'rest_game_db',
});

// Yhdistetään tietokantaan
db.connect(err => {
  if (err) {
    console.error('Virhe tietokantaan yhdistettäessä: ' + err.stack);
    return;
  }
  console.log('Yhdistetty tietokantaan ID ' + db.threadId);
});

app.use(bodyParser.json());

// Hae kaikki kysymykset
app.get('/getQuestions', (req, res) => {
  const sql = 'SELECT * FROM questions';
  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Tietokantavirhe' });
      return;
    }
    res.json(result);
  });
});

// Hae satunnainen kysymys
app.get('/getRandomQuestion', (req, res) => {
  const sql = 'SELECT * FROM questions ORDER BY RAND() LIMIT 1';
  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Tietokantavirhe' });
      return;
    }
    res.json(result[0]);
  });
});

// Vastaa kysymykseen
app.post('/answerQuestion', (req, res) => {
  const { questionId, userAnswer } = req.body;
  const sql = 'SELECT * FROM questions WHERE id = ?';
  db.query(sql, [questionId], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Tietokantavirhe' });
      return;
    }
    
    if (result.length > 0) {
      const correctAnswer = result[0].answer;

      // Tarkista vastaus
      const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
      res.json({ isCorrect, correctAnswer });
    } else {
      res.status(404).json({ error: 'Kysymystä ei löytynyt' });
    }
  });
});

// Lisää uusi kysymys
app.post('/addQuestion', (req, res) => {
  const { question, answer } = req.body;
  const sql = 'INSERT INTO questions (question, answer) VALUES (?, ?)';
  db.query(sql, [question, answer], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Tietokantavirhe' });
      return;
    }
    res.json({ message: 'Kysymys lisätty', questionId: result.insertId });
  });
});

app.listen(port, () => {
  console.log(`Palvelin käynnissä portissa ${port}`);
});