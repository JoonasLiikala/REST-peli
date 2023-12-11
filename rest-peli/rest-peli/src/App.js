import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  // Tilamuuttujat
  const [questions, setQuestions] = useState([]); // Kysymyslista
  const [newQuestion, setNewQuestion] = useState(''); // Uuden kysymyksen lomakkeen kenttä
  const [newAnswer, setNewAnswer] = useState(''); // Uuden vastauksen lomakkeen kenttä
  const [currentQuestion, setCurrentQuestion] = useState(null); // Näytettävä satunnainen kysymys
  const [userAnswer, setUserAnswer] = useState(''); // Käyttäjän antama vastaus
  const [answerResult, setAnswerResult] = useState(''); // Vastauksen tulosviesti

  useEffect(() => {
    // Haetaan kaikki kysymykset palvelimelta, kun komponentti renderöidään ensimmäisen kerran
    axios.get('http://localhost:3001/getQuestions').then(res => {
      setQuestions(res.data);
    });

    // Haetaan satunnainen kysymys
    axios.get('http://localhost:3001/getRandomQuestion').then(res => {
      setCurrentQuestion(res.data);
    });
  }, []);

  // Käsittele uuden kysymyksen lisäämistä
  const handleAddQuestion = () => {
    // Lisätään uusi kysymys palvelimelle
    axios
      .post('http://localhost:3001/addQuestion', {
        question: newQuestion,
        answer: newAnswer,
      })
      .then(res => {
        // Päivitetään kysymyslista
        setNewQuestion('');
        setNewAnswer('');
        setQuestions([...questions, { id: res.data.questionId, question: newQuestion, answer: newAnswer }]);
      });
  };

  // Käsittele kysymykseen vastaamista
  const handleAnswerQuestion = () => {
    // Lähetetään vastaus palvelimelle
    axios
      .post('http://localhost:3001/answerQuestion', {
        questionId: currentQuestion.id,
        userAnswer: userAnswer,
      })
      .then(res => {
        // Näytetään vastauksen tulos
        setAnswerResult(res.data.isCorrect ? 'Oikein!' : `Väärin. Oikea vastaus: ${res.data.correctAnswer}`);
      });
  };

  return (
    <div>
      <h1>REST-peli</h1>
      <div>
        <h2>Satunnainen kysymys:</h2>
        {currentQuestion && (
          <div>
            <p><strong>{currentQuestion.question}</strong></p>
            <label>Vastaus:</label>
            <input
              type="text"
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
            />
            <button onClick={handleAnswerQuestion}>Vastaa</button>
            <p>{answerResult}</p>
          </div>
        )}
      </div>
      <div>
        <h2>Kysymykset:</h2>
        <ul>
          {questions.map(q => (
            <li key={q.id}>
              <strong>{q.question}</strong> - Vastaus: {q.answer}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Lisää kysymys:</h2>
        <label>Kysymys:</label>
        <input
          type="text"
          value={newQuestion}
          onChange={e => setNewQuestion(e.target.value)}
        />
        <br />
        <label>Vastaus:</label>
        <input
          type="text"
          value={newAnswer}
          onChange={e => setNewAnswer(e.target.value)}
        />
        <br />
        <button onClick={handleAddQuestion}>Lisää kysymys</button>
      </div>
    </div>
  );
}

export default App;