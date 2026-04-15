const Database = require('better-sqlite3');
const db = new Database('data.db');

// Update image URLs to match actual files
const updates = [
  { id: 1, url: '/uploads/flood10.png' },
  { id: 2, url: '/uploads/flood3.png' },
  { id: 4, url: '/uploads/flood4.png' },
  { id: 6, url: '/uploads/flood5.png' },
  { id: 8, url: '/uploads/flood6.png' },
  { id: 9, url: '/uploads/flood7.png' },
  { id: 11, url: '/uploads/flood8.png' }
];

const stmt = db.prepare('UPDATE social_media_posts SET image_url = ? WHERE id = ?');
updates.forEach(update => {
  stmt.run(update.url, update.id);
});

console.log('Updated image URLs in database');
db.close();
