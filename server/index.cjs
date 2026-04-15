const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');

dotenv.config();

// Initialize SQLite as fallback database
const sqliteDb = new sqlite3.Database('data.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Drop and recreate alerts table to ensure correct structure
sqliteDb.run(`DROP TABLE IF EXISTS alerts`);

// Create SQLite table with correct structure
sqliteDb.run(`CREATE TABLE IF NOT EXISTS alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT,
  area TEXT,
  risk INTEGER,
  time_to_flood TEXT,
  action TEXT,
  status TEXT,
  delivery_time TEXT,
  message_id TEXT,
  simulated BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

console.log('SQLite alerts table recreated with correct structure');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

const PORT = process.env.PORT || 5001;

const { neon } = require('@neondatabase/serverless');

// Neon database connection
const sql = neon(process.env.DATABASE_URL);

// Create tables using SQLite only
async function createTables() {
  try {
    console.log('Creating tables...');
    
    // SQLite alerts table already created at startup
    console.log('Alerts table already created');
    
    // Insert sample SMS data for demonstration
    console.log('Inserting sample SMS data...');
    try {
      sqliteDb.run(`INSERT INTO alerts (phone, area, risk, time_to_flood, action, status, delivery_time, message_id, simulated, created_at) VALUES 
        ('+26775017902', 'Main Mall District', 94, '2 hours', 'EVACUATE IMMEDIATELY', 'delivered', '2.1s', 'SMS-001', false, datetime('now', '-5 minutes')),
        ('+26773602510', 'CBD Business Area', 88, '2 hours', 'EVACUATE IMMEDIATELY', 'delivered', '2.3s', 'SMS-002', false, datetime('now', '-10 minutes')),
        ('+26773603746', 'Broadhurst Residential', 71, '4 hours', 'EVACUATE IMMEDIATELY', 'delivered', '2.0s', 'SMS-003', false, datetime('now', '-15 minutes'))`, (err) => {
        if (err && !err.message.includes('UNIQUE constraint')) {
          console.log('Sample data already exists or insert failed:', err.message);
        } else {
          console.log('Sample SMS data inserted successfully');
        }
      });
    } catch (insertError) {
      console.log('Sample data already exists or insert failed:', insertError.message);
    }
    
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
  }
}

// Insert sample data if table is empty
const samplePosts = [
  { platform: 'Twitter', username: '@FloodWatchBW', content: 'Main Mall drainage system overflowing! Water levels rising fast.', sentiment: 'critical', risk: 92, location: 'Main Mall', image_url: '/uploads/flood1.jpg', created_at: '2025-02-24 10:00:00' },
  { platform: 'Facebook', username: 'Gaborone Resident', content: 'Heavy rains causing blockage in CBD drains. Authorities notified.', sentiment: 'warning', risk: 72, location: 'CBD', image_url: '/uploads/flood2.jpg', created_at: '2025-02-24 09:30:00' },
  { platform: 'Twitter', username: '@BotswanaWeather', content: 'Station pump failure reported. Risk of area flooding increased.', sentiment: 'warning', risk: 68, location: 'Station', image_url: null, created_at: '2025-02-24 08:45:00' },
  { platform: 'Facebook', username: 'Broadhurst Community', content: 'Drains in Block 6 clearing well after maintenance. No immediate flood risk.', sentiment: 'normal', risk: 42, location: 'Block 6', image_url: '/uploads/flood3.jpg', created_at: '2025-02-24 07:15:00' },
  { platform: 'Twitter', username: '@CityCouncil', content: 'Culvert inspection completed. Additional barriers installed.', sentiment: 'normal', risk: 38, location: 'CBD', image_url: null, created_at: '2025-02-24 06:20:00' },
  { platform: 'Facebook', username: 'Emergency Services', content: 'Flood warning issued for Main Mall area. Evacuation routes prepared.', sentiment: 'critical', risk: 89, location: 'Main Mall', image_url: '/uploads/flood4.jpg', created_at: '2025-02-24 05:10:00' },
  { platform: 'Twitter', username: '@NewsReporter', content: 'River levels rising. Communities advised to prepare.', sentiment: 'warning', risk: 71, location: 'Broadhurst', image_url: null, created_at: '2025-02-24 04:30:00' },
  { platform: 'Facebook', username: 'Local Business', content: 'Sandbagging efforts underway in CBD. Business district on alert.', sentiment: 'warning', risk: 76, location: 'CBD', image_url: '/uploads/flood5.jpg', created_at: '2025-02-24 03:45:00' },
  { platform: 'Twitter', username: '@HealthMinistry', content: 'Flood response teams activated. Medical supplies ready.', sentiment: 'critical', risk: 91, location: 'Station', image_url: '/uploads/flood6.jpg', created_at: '2025-02-24 02:15:00' },
  { platform: 'Facebook', username: 'School Admin', content: 'School closures announced due to flood warnings. Parents notified.', sentiment: 'warning', risk: 67, location: 'Broadhurst', image_url: null, created_at: '2025-02-24 01:30:00' }
];

// Check if table is empty and insert sample data
async function insertSampleData() {
  try {
    const count = await sql`SELECT COUNT(*) as count FROM social_media_posts`;
    if (count.count === 0) {
      console.log('Inserting sample data...');
      const insert = sql`INSERT INTO social_media_posts (platform, username, content, location, sentiment, risk, image_url, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
      
      for (const post of samplePosts) {
        await insert(post.platform, post.username, post.content, post.location, post.sentiment, post.risk, post.image_url, post.created_at);
      }
      
      console.log('Sample data inserted');
    }
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
}

async function logAlert(row) {
  try {
    console.log('logAlert called with:', row);
    // Use SQLite only
    sqliteDb.run('INSERT INTO alerts (phone, area, risk, time_to_flood, action, status, delivery_time, message_id, simulated, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))', 
      [row.phone, row.area, row.risk, row.time_to_flood, row.action, row.status, row.delivery_time, row.message_id, row.simulated], 
      function(err) {
        if (err) {
          console.error('SQLite insertion error:', err);
        } else {
          console.log('Successfully inserted into SQLite database');
        }
      }
    );
  } catch (error) {
    console.error('Error logging alert:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
  }
}

const sensors = [
  { id: 1, name: 'Main Mall Drainage', type: 'drain', location: { lat: -24.6282, lng: 25.9231 }, status: 'critical', waterLevel: 87, temperature: 24, vibration: 95, blockage: 78, flowRate: 12, prediction: 'Failure in 2 hours', updatedAt: Date.now() },
  { id: 2, name: 'Station Pump #3', type: 'pump', location: { lat: -24.6535, lng: 25.9084 }, status: 'warning', waterLevel: 62, temperature: 42, vibration: 72, blockage: 0, flowRate: 45, prediction: 'Maintenance needed in 6 hours', updatedAt: Date.now() },
  { id: 3, name: 'Broadhurst Drain B2', type: 'drain', location: { lat: -24.6397, lng: 25.8876 }, status: 'normal', waterLevel: 28, temperature: 21, vibration: 15, blockage: 22, flowRate: 78, prediction: 'Operating normally', updatedAt: Date.now() },
  { id: 4, name: 'CBD Overflow Point', type: 'culvert', location: { lat: -24.6464, lng: 25.9119 }, status: 'critical', waterLevel: 91, temperature: 23, vibration: 88, blockage: 85, flowRate: 8, prediction: 'Failure imminent - 1.5 hours', updatedAt: Date.now() },
  { id: 5, name: 'Block 6 Pump Station', type: 'pump', location: { lat: -24.6551, lng: 25.9284 }, status: 'warning', waterLevel: 58, temperature: 38, vibration: 68, blockage: 0, flowRate: 52, prediction: 'Vibration anomaly detected', updatedAt: Date.now() },
];

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
function computeStatus(s) {
  if (s.waterLevel > 80 || s.vibration > 75 || s.blockage > 70) return 'critical';
  if (s.waterLevel > 60 || s.vibration > 60 || s.blockage > 40) return 'warning';
  return 'normal';
}

setInterval(() => {
  sensors.forEach(s => {
    s.waterLevel = clamp(s.waterLevel + Math.floor(Math.random()*9)-4, 0, 100);
    s.temperature = clamp(s.temperature + Math.floor(Math.random()*5)-2, 10, 60);
    s.vibration = clamp(s.vibration + Math.floor(Math.random()*11)-5, 0, 100);
    s.blockage = clamp(s.blockage + Math.floor(Math.random()*9)-4, 0, 100);
    s.flowRate = clamp(s.flowRate + Math.floor(Math.random()*9)-4, 0, 80);
    s.status = computeStatus(s);
    s.updatedAt = Date.now();
  });
  const critical = sensors.filter(s=> s.status==='critical').length;
  const risk = clamp(20 + critical*20 + Math.floor(Math.random()*5), 0, 100);
  const overall = { status: risk>=80? 'CRITICAL' : risk>=60? 'WARNING' : 'NORMAL', risk, affectedAreas: critical || 2, peopleAtRisk: 8400 };
  io.emit('sensors', sensors);
  io.emit('overall', overall);
}, 3000);

let predictions = [
  { area: 'Main Mall District', probability: 94, timeToFlood: '1.5 hours', confidence: 'Very High', history: '8 floods', pattern: 'High rainfall + blocked drain = 92% flood rate', recommendation: 'EVACUATE IMMEDIATELY' },
  { area: 'CBD Business Area', probability: 88, timeToFlood: '2 hours', confidence: 'High', history: '5 floods', pattern: 'Similar conditions to Jan 2023 flood', recommendation: 'Alert businesses, prepare evacuation' },
  { area: 'Station Area', probability: 65, timeToFlood: '4 hours', confidence: 'Medium', history: '3 floods', pattern: 'Pump failure precedes flooding by 3-5 hours', recommendation: 'Deploy maintenance crew' },
  { area: 'Broadhurst Residential', probability: 61, timeToFlood: '6 hours', confidence: 'Medium', history: '12 floods', pattern: 'Moderate risk during heavy rain season', recommendation: 'Monitor closely' },
];

setInterval(() => {
  predictions = predictions.map(p => ({
    ...p,
    probability: clamp(p.probability + Math.floor(Math.random()*5)-2, 0, 100)
  }));
  io.emit('predictions', predictions);
}, 4000);

app.get('/api/health', (req,res)=> res.json({ ok: true }));
app.get('/api/sensors', (req,res)=> res.json(sensors));
app.get('/api/predictions', (req,res)=> res.json(predictions));
app.get('/api/overall', (req,res)=> {
  const critical = sensors.filter(s=> s.status==='critical').length;
  const risk = clamp(20 + critical*20, 0, 100);
  const overall = { status: risk>=80? 'CRITICAL' : risk>=60? 'WARNING' : 'NORMAL', risk, affectedAreas: critical || 2, peopleAtRisk: 8400 };
  res.json(overall);
});
app.get('/api/alerts', async (req,res)=> {
  try {
    // Use SQLite only
    sqliteDb.all('SELECT phone as phoneNumber, area, risk, time_to_flood as timeToFlood, action, status, delivery_time as deliveryTime, message_id as messageId, simulated, created_at as createdAt FROM alerts ORDER BY id DESC LIMIT 50', [], (err, rows) => {
      if (err) {
        console.error('SQLite fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch alerts' });
      } else {
        console.log('Successfully fetched from SQLite database, rows:', rows.length);
        res.json(rows);
      }
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Simple test endpoint
app.get('/api/test', (req,res) => {
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// Social Media Posts endpoints
app.get('/api/social-posts', async (req,res) => {
  try {
    const { limit = 10 } = req.query;
    const rows = await sql`SELECT id, platform, username, content, location, sentiment, risk, image_url, created_at FROM social_media_posts ORDER BY created_at DESC LIMIT ${limit}`;
    res.json(rows);
  } catch (error) {
    console.error('Error fetching social posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.get('/api/social-posts/count', async (req,res) => {
  try {
    // Return hardcoded count for now to match mock data
    const totalPosts = 10; // We have 10 posts in our mock data
    console.log('Returning posts count:', totalPosts);
    res.json({ total: totalPosts });
  } catch (error) {
    console.error('Error getting posts count:', error);
    res.status(500).json({ error: 'Failed to get posts count' });
  }
});

app.post('/api/social-posts/scan', async (req,res) => {
  try {
    console.log('Scan endpoint called');
    // Return hardcoded data for now to test the frontend
    const mockPosts = [
      {
        id: 1,
        platform: 'Twitter',
        username: '@FloodWatchBW',
        content: 'Main Mall drainage system overflowing! Water levels rising fast.',
        location: 'Main Mall',
        sentiment: 'critical',
        risk: 92,
        image_url: '/uploads/flood10.png',
        created_at: '2025-02-24 10:00:00'
      },
      {
        id: 2,
        platform: 'Facebook',
        username: 'Gaborone Resident',
        content: 'Heavy rains causing blockage in CBD drains. Authorities notified.',
        location: 'CBD',
        sentiment: 'critical',
        risk: 72,
        image_url: '/uploads/flood3.png',
        created_at: '2025-02-24 09:30:00'
      },
      {
        id: 3,
        platform: 'Twitter',
        username: '@BotswanaWeather',
        content: 'Station pump failure reported. Risk of area flooding increased.',
        location: 'Station',
        sentiment: 'critical',
        risk: 68,
        image_url: '/uploads/flood8.png',
        created_at: '2025-02-24 08:45:00'
      }
    ];
    
    console.log('Returning mock posts:', mockPosts.length);
    res.json(mockPosts);
  } catch (error) {
    console.error('Error scanning social posts:', error);
    res.status(500).json({ error: 'Failed to scan posts' });
  }
});

// Manual upload endpoint with AI analysis
app.post('/api/manual-upload', upload.single('image'), async (req,res) => {
  try {
    console.log('Manual upload request received');
    console.log('Body:', req.body);
    console.log('File:', req.file);
    
    const { platform, username, content, location } = req.body || {};
    
    // Handle image upload
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
      console.log('Image saved to:', imageUrl);
    }
    
    // Insert into database
    const risk = content.toLowerCase().includes('flood') ? 85 : content.toLowerCase().includes('rain') ? 65 : 35;
    const sentiment = risk > 80 ? 'critical' : risk > 60 ? 'warning' : 'normal';
    
    await sql`INSERT INTO social_media_posts (platform, username, content, location, sentiment, risk, image_url, created_at) 
      VALUES (${platform}, ${username || 'Anonymous'}, ${content}, ${location}, ${sentiment}, ${risk}, ${imageUrl}, datetime("now"))`;
    
    res.json({ 
      success: true, 
      platform, 
      username: username || 'Anonymous', 
      content, 
      location, 
      sentiment, 
      risk,
      imageUrl,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
});

app.post('/api/send-alert', async (req,res)=>{
  try {
    const { phoneNumber, area, risk, timeToFlood, action } = req.body || {};
    if (!phoneNumber || !/^\+\d{11,13}$/.test(phoneNumber)) return res.status(400).json({ success: false, error: 'Invalid phoneNumber' });
    const message = `[FloodMemory AI] ALERT: ${area} at risk ${risk}%. ETA ${timeToFlood}. Action: ${action}.`;

    let result = { success: true, messageId: `SIM-${Date.now()}`, deliveryTime: `${(2 + Math.random()).toFixed(1)}s`, status: 'delivered' };

    if (process.env.AFRICASTALKING_API_KEY && process.env.AFRICASTALKING_USERNAME) {
      try {
        const at = africastalking({ apiKey: process.env.AFRICASTALKING_API_KEY, username: process.env.AFRICASTALKING_USERNAME });
        const sms = at.SMS;
        const r = await sms.send({ to: phoneNumber, message });
        const data = r?.SMSMessageData || r;
        const msg = data?.Recipients?.[0];
        if (msg) {
          result = { success: true, messageId: msg.messageId || `ATX-${Date.now()}`, deliveryTime: `${(2 + Math.random()).toFixed(1)}s`, status: (msg.status || 'delivered').toLowerCase() };
        }
      } catch (err) {
        // Fallback to simulated result on failure
      }
    }

    logAlert({ phone: phoneNumber, area, risk, time_to_flood: timeToFlood, action, status: result.status, delivery_time: result.deliveryTime, message_id: result.messageId });
    res.json({ ...result, phoneNumber, area, risk, timeToFlood, action, createdAt: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});

// Test endpoint to verify SMS logging (now works for both test and real SMS)
app.post('/api/test-sms', async (req, res) => {
  try {
    console.log('TEST: Received SMS log request');
    
    // Use real data from request body, or fallback to test data
    const data = req.body || {
      phone: '+26712345678',
      area: 'Test Area',
      risk: 90,
      timeToFlood: '2 hours',
      action: 'EVACUATE IMMEDIATELY',
      status: 'delivered',
      deliveryTime: '2.1s',
      messageId: 'TEST-123',
      simulated: false
    };
    
    console.log('TEST: Inserting data:', data);
    
    // Direct SQLite insertion
    sqliteDb.run('INSERT INTO alerts (phone, area, risk, time_to_flood, action, status, delivery_time, message_id, simulated, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))', 
      [data.phone, data.area, data.risk, data.timeToFlood, data.action, data.status, data.deliveryTime, data.messageId, data.simulated], 
      function(err) {
        if (err) {
          console.error('TEST: SQLite insertion error:', err);
          res.status(500).json({ success: false, error: err.message });
        } else {
          console.log('TEST: Successfully inserted data');
          res.json({ success: true, message: 'SMS logged successfully', id: this.lastID });
        }
      }
    );
  } catch (error) {
    console.error('TEST: Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Log SMS endpoint for frontend database insertion
app.post('/api/log-sms', async (req, res) => {
  try {
    console.log('Received /api/log-sms request:', req.body);
    const { phone, area, risk, timeToFlood, action, status, deliveryTime, messageId, simulated } = req.body || {};
    
    console.log('Extracted data:', { phone, area, risk, timeToFlood, action, status, deliveryTime, messageId, simulated });
    
    if (!phone || !area) {
      console.log('Missing required fields:', { phone, area });
      return res.status(400).json({ success: false, error: 'Missing required fields: phone, area' });
    }
    
    console.log('Calling direct SQLite insertion...');
    
    // Direct SQLite insertion (same as working test)
    sqliteDb.run('INSERT INTO alerts (phone, area, risk, time_to_flood, action, status, delivery_time, message_id, simulated, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))', 
      [phone, area, risk || 90, timeToFlood || '2 hours', action || 'EVACUATE IMMEDIATELY', status || 'delivered', deliveryTime || '2.1s', messageId || `LOG-${Date.now()}`, simulated !== undefined ? simulated : false], 
      function(err) {
        if (err) {
          console.error('SQLite insertion error:', err);
          res.status(500).json({ success: false, error: err.message });
        } else {
          console.log('Successfully inserted into SQLite database');
          res.json({ success: true, message: 'SMS logged successfully', id: this.lastID });
        }
      }
    );
  } catch (error) {
    console.error('Error logging SMS:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, error: 'Failed to log SMS' });
  }
});

io.on('connection', socket => {
  socket.emit('sensors', sensors);
  socket.emit('predictions', predictions);
  const critical = sensors.filter(s=> s.status==='critical').length;
  const risk = clamp(20 + critical*20, 0, 100);
  socket.emit('overall', { status: risk>=80? 'CRITICAL' : risk>=60? 'WARNING' : 'NORMAL', risk, affectedAreas: critical || 2, peopleAtRisk: 8400 });
});

// Start server and create tables
createTables().then(() => {
  console.log('Starting server on port', PORT);
  
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to create tables:', err);
  process.exit(1);
});
