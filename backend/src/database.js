import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', 'kenworth.db');
const db = new sqlite3.Database(dbPath);

// Promisify database operations
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const initializeDatabase = async () => {
  try {
    // Create assignments table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        department_name TEXT NOT NULL,
        foreman_name TEXT NOT NULL,
        foreman_id TEXT,
        technician_name TEXT NOT NULL,
        technician_id TEXT NOT NULL,
        technician_notes TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if we have initial data
    const count = await dbGet('SELECT COUNT(*) as count FROM assignments');
    
    if (count.count === 0) {
      console.log('🔧 Initializing database with default assignments...');
      await seedDatabase();
    }

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
};

const seedDatabase = async () => {
  const initialData = [
    // 1st Shift - Shane Doty
    { dept: "1st Shift", foreman: "Shane Doty", foremanId: "186", name: "Phil Cummins", id: "101", notes: "" },
    { dept: "1st Shift", foreman: "Shane Doty", foremanId: "186", name: "Laryssa Jones", id: "159", notes: "" },
    { dept: "1st Shift", foreman: "Shane Doty", foremanId: "186", name: "Tim Kelley", id: "173", notes: "" },
    { dept: "1st Shift", foreman: "Shane Doty", foremanId: "186", name: "Luke Border", id: "751", notes: "" },
    { dept: "1st Shift", foreman: "Shane Doty", foremanId: "186", name: "Noah Ryan", id: "156", notes: "" },
    { dept: "1st Shift", foreman: "Shane Doty", foremanId: "186", name: "Trent Weatherington", id: "735", notes: "ND" },
    
    // 1st Shift - Tyler Merriman
    { dept: "1st Shift", foreman: "Tyler Merriman", foremanId: "782", name: "Benjamin Cooke", id: "140", notes: "ND" },
    { dept: "1st Shift", foreman: "Tyler Merriman", foremanId: "782", name: "Devin Stilwell", id: "195", notes: "" },
    { dept: "1st Shift", foreman: "Tyler Merriman", foremanId: "782", name: "Bailey Hughes", id: "180", notes: "" },
    { dept: "1st Shift", foreman: "Tyler Merriman", foremanId: "782", name: "Donny Bell", id: "125", notes: "" },
    
    // 1st Shift - Dustin Russell
    { dept: "1st Shift", foreman: "Dustin Russell", foremanId: "780", name: "Will Parrish", id: "168", notes: "" },
    { dept: "1st Shift", foreman: "Dustin Russell", foremanId: "780", name: "Kyler Moody", id: "706", notes: "" },
    { dept: "1st Shift", foreman: "Dustin Russell", foremanId: "780", name: "Remington Nold", id: "754", notes: "ND" },
    { dept: "1st Shift", foreman: "Dustin Russell", foremanId: "780", name: "Manny Ponce", id: "272", notes: "" },
    { dept: "1st Shift", foreman: "Dustin Russell", foremanId: "780", name: "Shawn Schmidt", id: "103", notes: "" },
    
    // 2nd Shift - Danny Cross
    { dept: "2nd Shift", foreman: "Danny Cross", foremanId: "", name: "Steve Jostock", id: "148", notes: "" },
    { dept: "2nd Shift", foreman: "Danny Cross", foremanId: "", name: "Jim Carroll", id: "171", notes: "" },
    { dept: "2nd Shift", foreman: "Danny Cross", foremanId: "", name: "Mark Haehn", id: "189", notes: "" },
    { dept: "2nd Shift", foreman: "Danny Cross", foremanId: "", name: "Perry Krout", id: "155", notes: "" },
    
    // Field Service - Chris Valyo
    { dept: "Field Service", foreman: "Chris Valyo", foremanId: "9133", name: "Austin Beye", id: "9161", notes: "ST1" },
    { dept: "Field Service", foreman: "Chris Valyo", foremanId: "9133", name: "Brian Johnson", id: "9111", notes: "ST7" },
    
    // Body Shop - Devin Kahle
    { dept: "Body Shop", foreman: "Devin Kahle", foremanId: "151", name: "Ray Archer", id: "102", notes: "" },
    { dept: "Body Shop", foreman: "Devin Kahle", foremanId: "151", name: "Colin Stanley", id: "172", notes: "" },
    { dept: "Body Shop", foreman: "Devin Kahle", foremanId: "151", name: "Danny Marr", id: "190", notes: "" },
    { dept: "Body Shop", foreman: "Devin Kahle", foremanId: "151", name: "Ricky Tetreault", id: "103", notes: "" },
    { dept: "Body Shop", foreman: "Devin Kahle", foremanId: "151", name: "Austin Palmer", id: "716", notes: "" },
    { dept: "Body Shop", foreman: "Devin Kahle", foremanId: "151", name: "Rick Parker", id: "179", notes: "" },
    { dept: "Body Shop", foreman: "Devin Kahle", foremanId: "151", name: "Drew Stanley", id: "198", notes: "" },
    { dept: "Body Shop", foreman: "Devin Kahle", foremanId: "151", name: "Josh Adair", id: "702", notes: "" },
    
    // PacLease - William Callison
    { dept: "PacLease", foreman: "William Callison", foremanId: "709", name: "Cayden Brandt", id: "127", notes: "" },
    { dept: "PacLease", foreman: "William Callison", foremanId: "709", name: "Federico Lopez", id: "142", notes: "" },
    { dept: "PacLease", foreman: "William Callison", foremanId: "709", name: "Logan Curless", id: "711", notes: "" },
    { dept: "PacLease", foreman: "William Callison", foremanId: "709", name: "Owen Tingley", id: "713", notes: "" },
    { dept: "PacLease", foreman: "William Callison", foremanId: "709", name: "Noe Fuentes", id: "759", notes: "" },
    { dept: "PacLease", foreman: "William Callison", foremanId: "709", name: "Gabe Adams", id: "764", notes: "" },
    
    // Recon - Chris Schreiner
    { dept: "Recon", foreman: "Chris Schreiner", foremanId: "756", name: "Devyn Thomas", id: "753", notes: "" },
    { dept: "Recon", foreman: "Chris Schreiner", foremanId: "756", name: "James Drake", id: "752", notes: "" },
    { dept: "Recon", foreman: "Chris Schreiner", foremanId: "756", name: "Kimble Thompson", id: "761", notes: "" },
    { dept: "Recon", foreman: "Chris Schreiner", foremanId: "756", name: "Michael Miller", id: "762", notes: "" },
    { dept: "Recon", foreman: "Chris Schreiner", foremanId: "756", name: "Aiden Adams", id: "765", notes: "" }
  ];

  for (const item of initialData) {
    await dbRun(
      `INSERT INTO assignments (department_name, foreman_name, foreman_id, technician_name, technician_id, technician_notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [item.dept, item.foreman, item.foremanId, item.name, item.id, item.notes]
    );
  }
};

export { dbRun, dbGet, dbAll };