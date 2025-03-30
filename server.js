const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// MySQL connection configuration
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'test',
  database: 'budgetplanner'
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
});

// API endpoint for getting budget info
app.post('/home', (req, res) => {
  const { month, year } = req.body;
  const query = 'SELECT expense, category, createdDateTime FROM budget WHERE MONTH(createdDateTime) = ? AND YEAR(createdDateTime) = ?';
  db.query(query, [month], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ results });
    }
  });
});

// API endpoint for inserting spending/earnings
app.post('/insertbudget', (req, res) => {
  const { expense, category, createdDateTime } = req.body;
  const query = 'INSERT INTO budget (expense, category, createdDateTime) VALUES (?, ?, ?)';
  db.query(query, [expense, category, createdDateTime], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Spendings/Earnings insert succesfully.' });
    }
  });
});

//API endpoint for searching spending/earnings based on category
app.post('/searchBudgetCategory', (req, res) => {
  const { category } = req.body;
  const query = 'SELECT expense, category, createdDateTime FROM budget WHERE category LIKE ?';
  db.query(query, [`%${category}%`], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ results });
    }
  });
});


// API endpoint for deleting spending/earnings
app.post('/deletebudget', (req, res) => {
  const {  } = req.body;
  const query = '';
  db.query(query, [], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Spendings/Earnings delete succesfully.' });
    }
  });
});


// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
