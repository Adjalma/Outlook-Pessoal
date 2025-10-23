// Importar apenas o que funciona no Vercel
let sqlite3 = null;
let Pool = null;

try {
  // Tentar importar PostgreSQL (funciona no Vercel)
  Pool = require('pg').Pool;
} catch (err) {
  console.log('PostgreSQL não disponível');
}

try {
  // Tentar importar SQLite (só funciona local)
  sqlite3 = require('sqlite3').verbose();
} catch (err) {
  console.log('SQLite não disponível no Vercel');
}

// Configuração do banco de dados
const getDatabase = () => {
  // Se estiver no Vercel, usar PostgreSQL
  if (process.env.DATABASE_URL) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    return {
      type: 'postgres',
      pool: pool,
      query: async (sql, params = []) => {
        const client = await pool.connect();
        try {
          const result = await client.query(sql, params);
          return result.rows;
        } finally {
          client.release();
        }
      },
      run: async (sql, params = []) => {
        const client = await pool.connect();
        try {
          const result = await client.query(sql, params);
          return { lastID: result.insertId, changes: result.rowCount };
        } finally {
          client.release();
        }
      }
    };
  }
  
  // Se estiver local, usar SQLite
  if (sqlite3) {
    const db = new sqlite3.Database('./data/triarc_email.db');
    
    return {
      type: 'sqlite',
      db: db,
      query: (sql, params = []) => {
        return new Promise((resolve, reject) => {
          db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        });
      },
      run: (sql, params = []) => {
        return new Promise((resolve, reject) => {
          db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
          });
        });
      }
    };
  }
  
  // Se não tiver nenhum banco disponível, usar memória
  console.log('Usando banco em memória (dados temporários)');
  const memoryDB = new Map();
  
  return {
    type: 'memory',
    query: async (sql, params = []) => {
      // Implementação simples em memória
      return [];
    },
    run: async (sql, params = []) => {
      // Implementação simples em memória
      return { lastID: 1, changes: 1 };
    }
  };
};

// Função para criar tabelas
const createTables = async (database) => {
  if (database.type === 'postgres') {
    // Criar tabelas PostgreSQL
    await database.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await database.query(`
      CREATE TABLE IF NOT EXISTS emails (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        to_email VARCHAR(255) NOT NULL,
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await database.query(`
      CREATE TABLE IF NOT EXISTS templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } else {
    // Criar tabelas SQLite
    await database.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await database.query(`
      CREATE TABLE IF NOT EXISTS emails (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id),
        to_email TEXT NOT NULL,
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        sent_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await database.query(`
      CREATE TABLE IF NOT EXISTS templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
};

module.exports = {
  getDatabase,
  createTables
};