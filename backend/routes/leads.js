const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
const path = require('path');
const Lead = require('../models/Lead');
const auth = require('../middleware/auth');

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const persistLeadForSeed = async ({ name, email, source, status }) => {
  try {
    const leadsPath = path.join(__dirname, '../leads.json');
    let leadsList = [];

    try {
      const file = await fs.readFile(leadsPath, 'utf8');
      leadsList = JSON.parse(file);
    } catch (readErr) {
      if (readErr.code !== 'ENOENT') throw readErr;
    }

    leadsList.push({ name, email, source, status });
    await fs.writeFile(leadsPath, JSON.stringify(leadsList, null, 2), 'utf8');
  } catch (fsErr) {
    console.error('Error saving to seed leads list:', fsErr.message);
  }
};

// @route   POST api/leads
// @desc    Create a new lead (from contact form)
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, source, status, notes } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    
    const initialNotes = notes?.trim() ? [{ text: notes.trim() }] : [];
    const leadSource = source?.trim() || 'Manual Input';
    const leadStatus = status || 'New';
    
    const newLead = new Lead({
      name: name.trim(),
      email: email.trim(),
      source: leadSource,
      status: leadStatus,
      notes: initialNotes
    });

    const lead = await newLead.save();

    persistLeadForSeed({
      name: lead.name,
      email: lead.email,
      source: lead.source,
      status: lead.status
    });

    res.status(201).json(lead);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/leads
// @desc    Get all leads
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || DEFAULT_LIMIT, 1), MAX_LIMIT);
    const skip = (page - 1) * limit;
    const query = {};

    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    }

    if (req.query.search) {
      const pattern = new RegExp(escapeRegex(req.query.search.trim()), 'i');
      query.$or = [{ name: pattern }, { email: pattern }, { source: pattern }];
    }

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .select('name email source status createdAt updatedAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Lead.countDocuments(query)
    ]);

    res.json({
      data: leads,
      pagination: {
        total,
        page,
        limit,
        pages: Math.max(Math.ceil(total / limit), 1)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/leads/:id
// @desc    Get single lead by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).lean();
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json(lead);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/leads/:id
// @desc    Update lead status and/or add note
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { status, note } = req.body;

  try {
    let lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    if (status) lead.status = status;
    if (note) {
      lead.notes.push({ text: note });
    }

    await lead.save();
    res.json(lead);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/leads/:id
// @desc    Delete a lead
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    await lead.deleteOne();
    res.json({ message: 'Lead removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
