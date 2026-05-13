const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

/* ================= FIRMY ================= */

app.get('/companies', (req, res) => {
  db.all("SELECT * FROM companies", (err, rows) => {
    if (err) return res.status(500).send(err.message);

    res.json(rows);
  });
});

app.post('/companies', (req, res) => {
  const { name } = req.body;

  if (!name) return res.status(400).send("Brak nazwy firmy");

  db.run(
    "INSERT INTO companies (name) VALUES (?)",
    [name],
    (err) => {
      if (err) return res.status(500).send(err.message);
      res.send("OK");
    }
  );
});

app.delete('/companies/:id', (req, res) => {
  const id = req.params.id;

  // NIE USUWAMY FIRMY FIZYCZNIE (ważne!)
  // tylko “odpinamy” ją od systemu przez rename

  db.run(
    "UPDATE companies SET name = ? WHERE id = ?",
    [`[USUNIĘTA FIRMA #${id}]`, id],
    (err) => {
      if (err) return res.status(500).send(err.message);
      res.send("OK");
    }
  );
});

/* ================= ZASOBY ================= */

app.get('/resources', (req, res) => {
  db.all("SELECT * FROM resources", (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.json(rows);
  });
});

app.post('/resources', (req, res) => {
  const { name } = req.body;

  if (!name) return res.status(400).send("Brak nazwy");

  db.run(
    "INSERT INTO resources (name) VALUES (?)",
    [name],
    (err) => {
      if (err) return res.status(500).send(err.message);
      res.send("OK");
    }
  );
});

app.delete('/resources/:id', (req, res) => {
  const id = req.params.id;

  db.run(
    "UPDATE resources SET name = ? WHERE id = ?",
    [`[USUNIĘTA SALA #${id}]`, id],
    (err) => {
      if (err) return res.status(500).send(err.message);
      res.send("OK");
    }
  );
});

/* ================= REZERWACJE ================= */

app.get('/reservations', (req, res) => {
  db.all(`
    SELECT
      reservations.*,
      companies.name AS company_name,
      resources.name AS resource_name
    FROM reservations
    LEFT JOIN companies ON reservations.company_id = companies.id
    LEFT JOIN resources ON reservations.resource_id = resources.id
    ORDER BY start_time ASC
  `, (err, rows) => {
    if (err) return res.status(500).send(err.message);

    // 🔥 SAFE FALLBACK (nigdy null)
    const fixed = rows.map(r => ({
      ...r,
      company_name: r.company_name || `[USUNIĘTA FIRMA #${r.company_id}]`,
      resource_name: r.resource_name || `[USUNIĘTA SALA #${r.resource_id}]`
    }));

    res.json(fixed);
  });
});

app.post('/reservations', (req, res) => {
  const { company_id, resource_id, start_time, end_time } = req.body;

  if (!company_id || !resource_id || !start_time || !end_time) {
    return res.status(400).send("Brak danych");
  }

  if (new Date(start_time) >= new Date(end_time)) {
    return res.status(400).send("Błędny czas");
  }

  const checkSql = `
    SELECT * FROM reservations
    WHERE resource_id = ?
    AND (start_time < ? AND end_time > ?)
  `;

  db.all(checkSql, [resource_id, end_time, start_time], (err, rows) => {
    if (err) return res.status(500).send(err.message);

    if (rows.length > 0) {
      return res.status(400).send("Kolizja");
    }

    db.run(`
      INSERT INTO reservations
      (company_id, resource_id, start_time, end_time)
      VALUES (?, ?, ?, ?)
    `,
    [company_id, resource_id, start_time, end_time],
    (err) => {
      if (err) return res.status(500).send(err.message);
      res.send("OK");
    });
  });
});

app.put('/reservations/:id', (req, res) => {
  const { start_time, end_time } = req.body;

  db.run(`
    UPDATE reservations
    SET start_time = ?, end_time = ?
    WHERE id = ?
  `,
  [start_time, end_time, req.params.id],
  (err) => {
    if (err) return res.status(500).send(err.message);
    res.send("OK");
  });
});

app.delete('/reservations/:id', (req, res) => {
  db.run(
    "DELETE FROM reservations WHERE id = ?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).send(err.message);
      res.send("OK");
    }
  );
});

app.listen(3000, () => {
  console.log("http://localhost:3000");
});