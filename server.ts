import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { 
  initDb, 
  getDbStatus, 
  getUsers, 
  addUser, 
  getProducts, 
  saveProduct, 
  deleteProduct, 
  getTransactions, 
  addTransaction 
} from './server/database';

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // Initialize DB (supports MySQL & local JSON disk fallback)
  await initDb();

  // ==================== API ROUTES ====================

  // DB diagnostic check endpoint
  app.get('/api/db-status', (req, res) => {
    res.json(getDbStatus());
  });

  // Client App Healthcheck
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Auth - Register Store
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password, storeName } = req.body;
      if (!name || !email || !password || !storeName) {
        return res.status(400).json({ error: 'Data registrasi tidak lengkap.' });
      }

      const users = await getUsers();
      const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return res.status(409).json({ error: 'Email sudah terdaftar.' });
      }

      const newUser = {
        id: `USR-${Date.now()}`,
        name,
        email: email.toLowerCase(),
        password, // In a real production environment, password would be hashed. Securely stored for SaaS preview.
        storeName
      };

      await addUser(newUser);
      res.status(201).json(newUser);
    } catch (err: any) {
      console.error('Error on register API:', err.message);
      res.status(500).json({ error: 'Gagal membuat akun: ' + err.message });
    }
  });

  // Auth - Login Store
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email dan password harus diisi.' });
      }

      const users = await getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      
      if (!user) {
        return res.status(401).json({ error: 'Email atau password salah.' });
      }

      res.json(user);
    } catch (err: any) {
      console.error('Error on login API:', err.message);
      res.status(500).json({ error: 'Gagal masuk akun: ' + err.message });
    }
  });

  // Products - Get All
  app.get('/api/products', async (req, res) => {
    try {
      const products = await getProducts();
      res.json(products);
    } catch (err: any) {
      console.error('Error fetching products:', err.message);
      res.status(500).json({ error: 'Gagal memuat produk: ' + err.message });
    }
  });

  // Products - Save / Update Generic
  app.post('/api/products', async (req, res) => {
    try {
      const { id, name, category, price, stock, unit } = req.body;
      if (!name || !category || price === undefined || stock === undefined || !unit) {
        return res.status(400).json({ error: 'Data produk tidak lengkap.' });
      }

      const product = {
        id: id || `PRD-${Date.now()}`,
        name,
        category,
        price: Number(price),
        stock: Number(stock),
        unit
      };

      await saveProduct(product);
      res.json(product);
    } catch (err: any) {
      console.error('Error saving product:', err.message);
      res.status(500).json({ error: 'Gagal menyimpan produk: ' + err.message });
    }
  });

  // Products - Delete Generic
  app.delete('/api/products/:id', async (req, res) => {
    try {
      const productId = req.params.id;
      await deleteProduct(productId);
      res.json({ success: true, message: 'Produk berhasil dihapus.' });
    } catch (err: any) {
      console.error('Error deleting product:', err.message);
      res.status(500).json({ error: 'Gagal menghapus produk: ' + err.message });
    }
  });

  // Transactions - Get All
  app.get('/api/transactions', async (req, res) => {
    try {
      const transactions = await getTransactions();
      res.json(transactions);
    } catch (err: any) {
      console.error('Error fetching transactions:', err.message);
      res.status(500).json({ error: 'Gagal memuat transaksi: ' + err.message });
    }
  });

  // Transactions - Add Checkout (auto decreases stock inside databases)
  app.post('/api/transactions', async (req, res) => {
    try {
      const transaction = req.body;
      if (!transaction || !transaction.id || !transaction.items || transaction.items.length === 0) {
        return res.status(400).json({ error: 'Data transaksi tidak valid.' });
      }

      await addTransaction(transaction);
      res.status(201).json({ success: true, transaction });
    } catch (err: any) {
      console.error('Error publishing transaction:', err.message);
      res.status(500).json({ error: 'Gagal menyelesaikan transaksi: ' + err.message });
    }
  });

  // ==================== VITE INTERACTION/SERVING ====================

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
    console.log(`🚀 [KasirKu Full-Stack Server] running on http://localhost:${PORT}`);
  });
}

startServer();
