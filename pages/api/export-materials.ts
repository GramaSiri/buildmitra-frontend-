import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { generateCSV } from '../../lib/csv-generator';
import { MaterialItem } from '../../lib/csv-parser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      const materials: MaterialItem[] = req.body.materials;
      
      if (!materials || materials.length === 0) {
        res.status(400).json({ success: false, message: 'No materials provided' });
        return;
      }
      
      const csvContent = generateCSV(materials);
      
      const outputPath = path.join(process.cwd(), 'public', 'materials_report_2026-08-29.csv');
      fs.writeFileSync(outputPath, csvContent);
      
      res.status(200).json({ success: true, message: 'Materials exported successfully' });
    } else {
      res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Export failed' });
  }
}