import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { initAuthTables } from '../services/authService.js';
import { initEmailTables } from '../services/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuração do banco de dados
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../data/triarc_email.db');
let db = null;

export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    try {
      // Criar diretório se não existir
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Conectar ao banco
      db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Erro ao conectar ao banco de dados:', err);
          reject(err);
          return;
        }

        console.log(`Banco de dados conectado: ${dbPath}`);
        
        // Inicializar tabelas
        Promise.all([
          initAuthTables(),
          initEmailTables()
        ]).then(() => {
          console.log('Tabelas do banco de dados inicializadas');
          resolve();
        }).catch((error) => {
          console.error('Erro ao inicializar tabelas:', error);
          reject(error);
        });
      });

    } catch (error) {
      console.error('Erro ao inicializar banco de dados:', error);
      reject(error);
    }
  });
};

export const getDb = () => {
  if (!db) {
    throw new Error('Banco de dados não inicializado');
  }
  return db;
};

export const closeDatabase = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Erro ao fechar banco de dados:', err);
          reject(err);
        } else {
          console.log('Banco de dados fechado');
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
};

// Função para executar queries
export const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Banco de dados não inicializado'));
      return;
    }

    db.run(sql, params, function(err) {
      if (err) {
        console.error('Erro ao executar query:', err);
        reject(err);
      } else {
        resolve({ 
          lastID: this.lastID, 
          changes: this.changes 
        });
      }
    });
  });
};

// Função para buscar um registro
export const getQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Banco de dados não inicializado'));
      return;
    }

    db.get(sql, params, (err, row) => {
      if (err) {
        console.error('Erro ao buscar registro:', err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// Função para buscar múltiplos registros
export const allQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Banco de dados não inicializado'));
      return;
    }

    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Erro ao buscar registros:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Função para backup do banco
export const backupDatabase = (backupPath) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Banco de dados não inicializado'));
      return;
    }

    const fs = require('fs');
    const source = fs.createReadStream(dbPath);
    const dest = fs.createWriteStream(backupPath);

    source.pipe(dest);

    dest.on('finish', () => {
      console.log(`Backup criado: ${backupPath}`);
      resolve();
    });

    dest.on('error', (err) => {
      console.error('Erro ao criar backup:', err);
      reject(err);
    });
  });
};

// Função para limpeza de dados antigos
export const cleanupOldData = (daysToKeep = 90) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Banco de dados não inicializado'));
      return;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const queries = [
      // Limpar sessões expiradas
      `DELETE FROM sessions WHERE expires_at < datetime('now')`,
      
      // Limpar tentativas de login antigas
      `DELETE FROM login_attempts WHERE created_at < datetime('now', '-${daysToKeep} days')`,
      
      // Limpar emails antigos (manter apenas os últimos X dias)
      `DELETE FROM sent_emails WHERE created_at < datetime('now', '-${daysToKeep} days')`
    ];

    Promise.all(queries.map(sql => runQuery(sql)))
      .then(() => {
        console.log(`Limpeza de dados antigos concluída (${daysToKeep} dias)`);
        resolve();
      })
      .catch((error) => {
        console.error('Erro na limpeza de dados:', error);
        reject(error);
      });
  });
};

export default {
  initDatabase,
  getDb,
  closeDatabase,
  runQuery,
  getQuery,
  allQuery,
  backupDatabase,
  cleanupOldData
};