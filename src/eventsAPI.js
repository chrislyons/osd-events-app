const express = require('express');
const router = express.Router();
const pool = require('./db');  // PostgreSQL connection pool

// GET all events
router.get('/events', async (req, res) => {
    try {
        const result = await pool.query('SELECT *, TO_CHAR(event_date, \'YYYY-MM-DD\') as formatted_date FROM events ORDER BY event_date ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send('Error retrieving events');
    }
});

// POST new event
router.post('/events', async (req, res) => {
    const { event_name, venue, city, event_date, description, ticket_link } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO events (event_name, venue, city, event_date, description, ticket_link) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [event_name, venue, city, event_date, description, ticket_link]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error inserting event:', err);
        res.status(500).send('Failed to submit event.');
    }
});

module.exports = router;
