const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({
  user: 'chrislyons',
  host: 'localhost',
  database: 'osd_events',
  password: 'yui1',
  port: 5432,
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API route to fetch approved events
app.get('/api/events', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM events WHERE status IN ('approved', 'test') ORDER BY event_date DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send('Server error');
  }
});

// API route to fetch pending events
app.get('/api/events/pending', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM events WHERE status = 'pending' ORDER BY event_date DESC"
    );
    console.log('Pending events:', result.rows);  // Debugging
    res.json(result.rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send('Server error');
  }
});

// Add this below the GET routes in app.js
app.post('/api/events', async (req, res) => {
    const { event_name, venue, city, event_date, description, ticket_link } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO events (event_name, venue, city, event_date, description, ticket_link, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [event_name, venue, city, event_date, description, ticket_link, 'pending']
        );
        res.status(201).json(result.rows[0]);  // Return the created event
    } catch (err) {
        console.error('Error adding event:', err);
        res.status(500).send('Failed to add event');
    }
});


// Update event status by ID
app.put('/api/events/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const result = await pool.query(
            'UPDATE events SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rows.length > 0) {
            res.json(result.rows[0]);  // Return updated event
        } else {
            res.status(404).send('Event not found');
        }
    } catch (err) {
        console.error('Error updating event:', err);
        res.status(500).send('Failed to update event');
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
