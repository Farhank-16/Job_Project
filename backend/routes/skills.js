const express = require('express');
const router  = express.Router();
const db      = require('../config/database');

// Static route — must come before /:id
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT DISTINCT category FROM skills WHERE is_active = TRUE AND category IS NOT NULL ORDER BY category'
    );
    res.json({ categories: rows.map(r => r.category) });
  } catch (error) {
    console.error('Get Categories Error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query  = 'SELECT * FROM skills WHERE is_active = TRUE';
    const params = [];

    if (category) { query += ' AND category = ?'; params.push(category); }
    query += ' ORDER BY name';

    const [skills] = await db.execute(query, params);
    res.json({ skills });
  } catch (error) {
    console.error('Get Skills Error:', error);
    res.status(500).json({ error: 'Failed to get skills' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [skills] = await db.execute(
      'SELECT * FROM skills WHERE id = ? AND is_active = TRUE',
      [req.params.id]
    );
    if (!skills.length) return res.status(404).json({ error: 'Skill not found' });
    res.json({ skill: skills[0] });
  } catch (error) {
    console.error('Get Skill Error:', error);
    res.status(500).json({ error: 'Failed to get skill' });
  }
});

module.exports = router;