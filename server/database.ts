import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { Product, Transaction } from '../src/types';

const SEED_PRODUCTS: Product[] = [
  { id: '1', name: 'Kopi Susu Gula Aren', category: 'Minuman', price: 18000, stock: 50, unit: 'cup' },
  { id: '2', name: 'Americano', category: 'Minuman', price: 15000, stock: 100, unit: 'cup' },
  { id: '3', name: 'Roti Bakar Cokelat', category: 'Makanan', price: 12000, stock: 30, unit: 'porsi' },
  { id: '4', name: 'French Fries', category: 'Makanan', price: 10000, stock: 40, unit: 'porsi' },
  { id: '5', name: 'Es Teh Manis', category: 'Minuman', price: 5000, stock: 200, unit: 'cup' },
  { id: '6', name: 'Nasi Goreng Spesial', category: 'Makanan', price: 25000, stock: 20, unit: 'porsi' },
];

interface FallbackSchema {
  users: any[];
  products: Product[];
  transactions: Transaction[];
}

const FALLBACK_FILE_PATH = path.join(process.cwd(), 'data_fallback.json');

let pool: mysql.Pool | null = null;
let isUsingMySQL = false;
let dbStatusError: string | undefined = undefined;
let connectionConfig: any = null;

// Helper to manage JSON file fallback
function getLocalData(): FallbackSchema {
  if (!fs.existsSync(FALLBACK_FILE_PATH)) {
    const initial: FallbackSchema = {
      users: [],
      products: SEED_PRODUCTS,
      transactions: []
    };
    fs.writeFileSync(FALLBACK_FILE_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    const content = fs.readFileSync(FALLBACK_FILE_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (err: any) {
    console.error('Failed reading fallback JSON file, resetting structural file:', err.message);
    const initial: FallbackSchema = {
      users: [],
      products: SEED_PRODUCTS,
      transactions: []
    };
    fs.writeFileSync(FALLBACK_FILE_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
}

function writeLocalData(data: FallbackSchema) {
  fs.writeFileSync(FALLBACK_FILE_PATH, JSON.stringify(data, null, 2));
}

export async function initDb(): Promise<void> {
  const { MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE } = process.env;

  if (!MYSQL_HOST || !MYSQL_USER || !MYSQL_DATABASE) {
    console.warn('⚠️  MySQL environment variables are not fully configured. Falling back to local JSON database.');
    isUsingMySQL = false;
    dbStatusError = 'MySQL environment variables (MYSQL_HOST, MYSQL_USER, MYSQL_DATABASE) are incomplete.';
    getLocalData(); // Ensure the file exists
    return;
  }

  connectionConfig = {
    host: MYSQL_HOST,
    port: parseInt(MYSQL_PORT || '3306'),
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };

  try {
    pool = mysql.createPool(connectionConfig);
    // Test connection
    const connection = await pool.getConnection();
    connection.release();
    isUsingMySQL = true;
    dbStatusError = undefined;
    console.log(`✅ Fully connected to MySQL database: ${MYSQL_DATABASE}@${MYSQL_HOST}`);

    // Create Tables
    await createTablesInMySQL();
  } catch (err: any) {
    console.error('❌ Failed to connect to MySQL database:', err.message);
    isUsingMySQL = false;
    dbStatusError = `Error connecting to MySQL: ${err.message}`;
    getLocalData(); // Initialize fallback JSON database
  }
}

async function createTablesInMySQL() {
  if (!pool) return;

  const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      storeName VARCHAR(255) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const productsTable = `
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(255) NOT NULL,
      price INT NOT NULL,
      stock INT NOT NULL,
      unit VARCHAR(50) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const transactionsTable = `
    CREATE TABLE IF NOT EXISTS transactions (
      id VARCHAR(255) PRIMARY KEY,
      date VARCHAR(255) NOT NULL,
      total INT NOT NULL,
      paymentMethod VARCHAR(50) NOT NULL,
      customerName VARCHAR(255) NULL,
      items TEXT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const conn = await pool.getConnection();
  try {
    await conn.query(usersTable);
    await conn.query(productsTable);
    await conn.query(transactionsTable);

    // Seed products table if empty
    const [rows]: [any, any] = await conn.query('SELECT COUNT(*) as count FROM products');
    if (rows[0]?.count === 0) {
      console.log('Seeding initial products into MySQL products table...');
      for (const p of SEED_PRODUCTS) {
        await conn.query(
          'INSERT INTO products (id, name, category, price, stock, unit) VALUES (?, ?, ?, ?, ?, ?)',
          [p.id, p.name, p.category, p.price, p.stock, p.unit]
        );
      }
    }
  } finally {
    conn.release();
  }
}

// Global status information
export function getDbStatus() {
  return {
    isUsingMySQL,
    connected: isUsingMySQL && !!pool,
    type: isUsingMySQL ? 'MySQL Database' : 'Local JSON Disk-Backup (SaaS Run)',
    host: isUsingMySQL ? connectionConfig?.host : 'localhost (fallback)',
    databaseName: isUsingMySQL ? connectionConfig?.database : 'data_fallback.json',
    port: isUsingMySQL ? connectionConfig?.port : null,
    error: dbStatusError,
    fallbackPath: FALLBACK_FILE_PATH
  };
}

// User methods
export async function getUsers(): Promise<any[]> {
  if (isUsingMySQL && pool) {
    const [rows] = await pool.query('SELECT * FROM users');
    return rows as any[];
  } else {
    return getLocalData().users;
  }
}

export async function addUser(user: any): Promise<void> {
  if (isUsingMySQL && pool) {
    await pool.query(
      'INSERT INTO users (id, name, email, password, storeName) VALUES (?, ?, ?, ?, ?)',
      [user.id, user.name, user.email, user.password, user.storeName]
    );
  } else {
    const data = getLocalData();
    data.users.push(user);
    writeLocalData(data);
  }
}

// Products methods
export async function getProducts(): Promise<Product[]> {
  if (isUsingMySQL && pool) {
    const [rows]: [any, any] = await pool.query('SELECT * FROM products');
    return rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      price: Number(r.price),
      stock: Number(r.stock),
      unit: r.unit
    }));
  } else {
    return getLocalData().products;
  }
}

export async function saveProduct(product: Product): Promise<void> {
  if (isUsingMySQL && pool) {
    // Upsert equivalent in MySQL
    await pool.query(
      `INSERT INTO products (id, name, category, price, stock, unit)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), category = VALUES(category), price = VALUES(price), stock = VALUES(stock), unit = VALUES(unit)`,
      [product.id, product.name, product.category, product.price, product.stock, product.unit]
    );
  } else {
    const data = getLocalData();
    const idx = data.products.findIndex(p => p.id === product.id);
    if (idx !== -1) {
      data.products[idx] = product;
    } else {
      data.products.push(product);
    }
    writeLocalData(data);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  if (isUsingMySQL && pool) {
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
  } else {
    const data = getLocalData();
    data.products = data.products.filter(p => p.id !== id);
    writeLocalData(data);
  }
}

// Transactions methods
export async function getTransactions(): Promise<Transaction[]> {
  if (isUsingMySQL && pool) {
    const [rows]: [any, any] = await pool.query('SELECT * FROM transactions');
    return rows.map((r: any) => ({
      id: r.id,
      date: r.date,
      total: Number(r.total),
      paymentMethod: r.paymentMethod as any,
      customerName: r.customerName || undefined,
      items: JSON.parse(r.items)
    }));
  } else {
    return getLocalData().transactions;
  }
}

export async function addTransaction(transaction: Transaction): Promise<void> {
  if (isUsingMySQL && pool) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Ensure transaction record is written
      await conn.query(
        'INSERT INTO transactions (id, date, total, paymentMethod, customerName, items) VALUES (?, ?, ?, ?, ?, ?)',
        [
          transaction.id,
          transaction.date,
          transaction.total,
          transaction.paymentMethod,
          transaction.customerName || null,
          JSON.stringify(transaction.items)
        ]
      );

      // Decrement stock for each item bought
      for (const item of transaction.items) {
        await conn.query(
          'UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?',
          [item.quantity, item.id]
        );
      }

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } else {
    const data = getLocalData();
    
    // Save transaction
    data.transactions.push(transaction);

    // Deduct stock in fallback database
    for (const item of transaction.items) {
      const idx = data.products.findIndex(p => p.id === item.id);
      if (idx !== -1) {
        data.products[idx].stock = Math.max(0, data.products[idx].stock - item.quantity);
      }
    }

    writeLocalData(data);
  }
}
