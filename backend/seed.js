require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const Lead = require('./models/Lead');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    // Clear existing
    await Admin.deleteMany({});
    await Lead.deleteMany({});
    console.log('Cleared existing data.');

    // Seed Admin
    const admin = new Admin({
      username: 'admin',
      password: 'password123'
    });
    await admin.save();
    console.log('Admin user created (admin / password123)');

    // Seed leads
    const leadsPath = path.join(__dirname, 'leads.json');
    let leads = [];
    if (fs.existsSync(leadsPath)) {
      try {
        leads = JSON.parse(fs.readFileSync(leadsPath, 'utf8'));
        console.log('Loaded leads from leads.json');
      } catch (err) {
        console.error('Error parsing leads.json, falling back to defaults:', err.message);
      }
    }

    if (!leads || leads.length === 0) {
      leads = [
        { name: 'Ravi Teja Annam', email: 'raviteja.annam@vanguardtech.com', source: 'Website', status: 'New' },
        { name: 'Sravani Kondapalli', email: 'sravani.k@vertexline.co', source: 'Facebook', status: 'Contacted' },
        { name: 'Kalyan Ram Chebrolu', email: 'kalyan.ramc@apexmedia.io', source: 'Referral', status: 'Converted' },
        { name: 'Harika Pendyala', email: 'hpendyala@novasolutions.co', source: 'Facebook', status: 'Contacted' },
        { name: 'Srinivas Rao Guntur', email: 'srinivas.g@stratabound.io', source: 'Referral', status: 'New' },
        { name: 'Ananya Yelamanchili', email: 'ananya.y@luminagroup.co', source: 'Facebook', status: 'New' },
        { name: 'Venkatesh Mylavarapu', email: 'vmylavarapu@ironwoodcorp.io', source: 'Referral', status: 'Contacted' },
      ];
      try {
        fs.writeFileSync(leadsPath, JSON.stringify(leads, null, 2), 'utf8');
        console.log('Created leads.json with initial defaults.');
      } catch (err) {
        console.error('Error writing leads.json:', err.message);
      }
    }

    await Lead.insertMany(leads);
    console.log(`Seeded ${leads.length} leads.`);

    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
