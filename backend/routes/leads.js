const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Lead = require('../models/Lead');
const auth = require('../middleware/auth');

// @route   POST api/leads
// @desc    Create a new lead (from contact form)
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, source, status, notes } = req.body;
    
    const initialNotes = notes ? [{ text: notes }] : [];
    
    const newLead = new Lead({
      name,
      email,
      source: source || 'Manual Input',
      status: status || 'New',
      notes: initialNotes
    });

    const lead = await newLead.save();

    // Auto-save to backend/leads.json for seed persistence
    try {
      const leadsPath = path.join(__dirname, '../leads.json');
      let leadsList = [];
      if (fs.existsSync(leadsPath)) {
        leadsList = JSON.parse(fs.readFileSync(leadsPath, 'utf8'));
      } else {
        // Initial defaults
        leadsList = [
          { name: 'Ravi Teja Annam', email: 'raviteja.annam@vanguardtech.com', source: 'Website', status: 'New' },
          { name: 'Sravani Kondapalli', email: 'sravani.k@vertexline.co', source: 'Facebook', status: 'Contacted' },
          { name: 'Kalyan Ram Chebrolu', email: 'kalyan.ramc@apexmedia.io', source: 'Referral', status: 'Converted' },
          { name: 'Harika Pendyala', email: 'hpendyala@novasolutions.co', source: 'Facebook', status: 'Contacted' },
          { name: 'Srinivas Rao Guntur', email: 'srinivas.g@stratabound.io', source: 'Referral', status: 'New' },
          { name: 'Ananya Yelamanchili', email: 'ananya.y@luminagroup.co', source: 'Facebook', status: 'New' },
          { name: 'Venkatesh Mylavarapu', email: 'vmylavarapu@ironwoodcorp.io', source: 'Referral', status: 'Contacted' }
        ];
      }
      leadsList.push({
        name,
        email,
        source: source || 'Manual Input',
        status: status || 'New'
      });
      fs.writeFileSync(leadsPath, JSON.stringify(leadsList, null, 2), 'utf8');
    } catch (fsErr) {
      console.error('Error saving to seed leads list:', fsErr.message);
    }

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
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
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
    const lead = await Lead.findById(req.params.id);
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
