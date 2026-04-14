import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import cors from 'cors';

// Types for our database
type Lead = {
  id: string;
  propertyType: string;
  transactionType: string;
  neighborhood: string;
  number: string;
  street: string;
  price: string;
  bedrooms: string;
  suites: string;
  parking: string;
  area: string;
  ownerName: string;
  ownerMobile: string;
  ownerPhone: string;
  ownerEmail: string;
  acceptedTerms: boolean;
  createdAt: string;
};

type Data = {
  leads: Lead[];
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Setup Database
  const adapter = new JSONFile<Data>('db.json');
  const defaultData: Data = { leads: [] };
  const db = new Low(adapter, defaultData);
  await db.read();

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get('/api/leads', async (req, res) => {
    await db.read();
    res.json(db.data.leads);
  });

  app.post('/api/leads', async (req, res) => {
    const newLead = {
      ...req.body,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    await db.read();
    db.data.leads.unshift(newLead);
    await db.write();
    
    res.status(201).json(newLead);
  });

  app.delete('/api/leads/:id', async (req, res) => {
    const { id } = req.params;
    await db.read();
    db.data.leads = db.data.leads.filter(l => l.id !== id);
    await db.write();
    res.status(204).send();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Database initialized with', db.data.leads.length, 'leads');
  });
}

startServer().catch(console.error);
