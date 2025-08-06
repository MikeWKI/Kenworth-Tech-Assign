import express from 'express';
import { dbRun, dbGet, dbAll } from './database.js';

const router = express.Router();

// Verify PIN
router.post('/verify-pin', (req, res) => {
  const { pin } = req.body;
  const correctPin = '1971';
  
  if (pin === correctPin) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid PIN' });
  }
});

// Get all assignments
router.get('/assignments', async (req, res) => {
  try {
    const assignments = await dbAll(`
      SELECT department_name, foreman_name, foreman_id, 
             technician_name, technician_id, technician_notes
      FROM assignments 
      ORDER BY department_name, foreman_name, technician_name
    `);

    // Transform data to match frontend format
    const organized = {};
    
    assignments.forEach(row => {
      if (!organized[row.department_name]) {
        organized[row.department_name] = { foremen: [] };
      }
      
      let foreman = organized[row.department_name].foremen.find(
        f => f.name === row.foreman_name
      );
      
      if (!foreman) {
        foreman = {
          name: row.foreman_name,
          id: row.foreman_id || '',
          technicians: []
        };
        organized[row.department_name].foremen.push(foreman);
      }
      
      foreman.technicians.push({
        name: row.technician_name,
        id: row.technician_id,
        notes: row.technician_notes || ''
      });
    });

    res.json(organized);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// Move technician to different foreman
router.post('/move-technician', async (req, res) => {
  try {
    const { 
      technicianId, 
      newDepartment, 
      newForemanName, 
      newForemanId 
    } = req.body;

    await dbRun(
      `UPDATE assignments 
       SET department_name = ?, foreman_name = ?, foreman_id = ?, updated_at = CURRENT_TIMESTAMP
       WHERE technician_id = ?`,
      [newDepartment, newForemanName, newForemanId, technicianId]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to move technician' });
  }
});

// Get assignment history/audit log
router.get('/audit-log', async (req, res) => {
  try {
    const log = await dbAll(`
      SELECT technician_name, technician_id, department_name, foreman_name, updated_at
      FROM assignments 
      ORDER BY updated_at DESC 
      LIMIT 50
    `);
    
    res.json(log);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

export default router;