const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const db = new sqlite3.Database('./products.db');

// Initialisation BDD
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    price REAL
  )`);
});

// API: Liste des produits
app.get('/api/products', (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// API: Ajouter produit
app.post('/api/products', (req, res) => {
  const { name, description, price } = req.body;
  db.run("INSERT INTO products (name, description, price) VALUES (?, ?, ?)",
    [name, description, price], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    });
});

// API: Supprimer produit
app.delete('/api/products/:id', (req, res) => {
  db.run("DELETE FROM products WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// API: Modifier produit
app.put('/api/products/:id', (req, res) => {
  const { name, description, price } = req.body;
  db.run("UPDATE products SET name = ?, description = ?, price = ? WHERE id = ?",
    [name, description, price, req.params.id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});