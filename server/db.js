import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, 'data', 'db.json');
const INITIAL_FILE = path.join(__dirname, 'data', 'initialData.json');

export function getDatabase() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = fs.readFileSync(INITIAL_FILE, 'utf-8');
    fs.writeFileSync(DB_FILE, initialData, 'utf-8');
    return JSON.parse(initialData);
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    const initialData = fs.readFileSync(INITIAL_FILE, 'utf-8');
    fs.writeFileSync(DB_FILE, initialData, 'utf-8');
    return JSON.parse(initialData);
  }
}

export function saveDatabase(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  return data;
}

export function resetDatabase() {
  const initialData = fs.readFileSync(INITIAL_FILE, 'utf-8');
  fs.writeFileSync(DB_FILE, initialData, 'utf-8');
  return JSON.parse(initialData);
}
