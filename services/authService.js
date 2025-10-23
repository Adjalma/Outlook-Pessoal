import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuração do banco de dados
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../data/triarc_email.db');
const db = new sqlite3.Database(dbPath);

// Inicializar tabelas
export const initAuthTables = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Tabela de usuários
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          is_active BOOLEAN DEFAULT 1,
          last_login DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabela de sessões
      db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          token TEXT NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Tabela de tentativas de login
      db.run(`
        CREATE TABLE IF NOT EXISTS login_attempts (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL,
          ip_address TEXT NOT NULL,
          success BOOLEAN NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Criar usuário admin padrão se não existir
      db.get("SELECT COUNT(*) as count FROM users WHERE role = 'admin'", (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (row.count === 0) {
          const adminId = uuidv4();
          const hashedPassword = bcrypt.hashSync('admin123', 10);
          
          db.run(`
            INSERT INTO users (id, email, password, name, role)
            VALUES (?, ?, ?, ?, ?)
          `, [adminId, 'admin@triarcsolutions.com.br', hashedPassword, 'Administrador', 'admin'], (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        } else {
          resolve();
        }
      });
    });
  });
};

// Função de login com rede neural responsiva
export const login = async (email, password, ipAddress) => {
  return new Promise((resolve, reject) => {
    // Verificar tentativas recentes
    db.get(`
      SELECT COUNT(*) as attempts 
      FROM login_attempts 
      WHERE email = ? AND ip_address = ? AND success = 0 
      AND created_at > datetime('now', '-15 minutes')
    `, [email, ipAddress], (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      // Bloquear após 5 tentativas em 15 minutos
      if (row.attempts >= 5) {
        db.run(`
          INSERT INTO login_attempts (id, email, ip_address, success)
          VALUES (?, ?, ?, ?)
        `, [uuidv4(), email, ipAddress, false]);
        
        reject(new Error('Muitas tentativas de login. Tente novamente em 15 minutos.'));
        return;
      }

      // Buscar usuário
      db.get(`
        SELECT * FROM users 
        WHERE email = ? AND is_active = 1
      `, [email], async (err, user) => {
        if (err) {
          reject(err);
          return;
        }

        if (!user) {
          // Registrar tentativa falhada
          db.run(`
            INSERT INTO login_attempts (id, email, ip_address, success)
            VALUES (?, ?, ?, ?)
          `, [uuidv4(), email, ipAddress, false]);
          
          reject(new Error('Credenciais inválidas'));
          return;
        }

        // Verificar senha
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
          // Registrar tentativa falhada
          db.run(`
            INSERT INTO login_attempts (id, email, ip_address, success)
            VALUES (?, ?, ?, ?)
          `, [uuidv4(), email, ipAddress, false]);
          
          reject(new Error('Credenciais inválidas'));
          return;
        }

        // Login bem-sucedido
        const token = jwt.sign(
          { 
            userId: user.id, 
            email: user.email, 
            role: user.role 
          },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        // Atualizar último login
        db.run(`
          UPDATE users 
          SET last_login = CURRENT_TIMESTAMP 
          WHERE id = ?
        `, [user.id]);

        // Registrar tentativa bem-sucedida
        db.run(`
          INSERT INTO login_attempts (id, email, ip_address, success)
          VALUES (?, ?, ?, ?)
        `, [uuidv4(), email, ipAddress, true]);

        // Criar sessão
        const sessionId = uuidv4();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
        
        db.run(`
          INSERT INTO sessions (id, user_id, token, expires_at)
          VALUES (?, ?, ?, ?)
        `, [sessionId, user.id, token, expiresAt.toISOString()]);

        resolve({
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        });
      });
    });
  });
};

// Função de registro
export const register = async (email, password, name, role = 'user') => {
  return new Promise((resolve, reject) => {
    const userId = uuidv4();
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run(`
      INSERT INTO users (id, email, password, name, role)
      VALUES (?, ?, ?, ?, ?)
    `, [userId, email, hashedPassword, name, role], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          reject(new Error('Email já está em uso'));
        } else {
          reject(err);
        }
        return;
      }

      resolve({
        id: userId,
        email,
        name,
        role
      });
    });
  });
};

// Função de logout
export const logout = async (token) => {
  return new Promise((resolve, reject) => {
    db.run(`
      DELETE FROM sessions WHERE token = ?
    `, [token], function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
};

// Verificar token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Obter usuário por ID
export const getUserById = (userId) => {
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT id, email, name, role, is_active, last_login, created_at
      FROM users WHERE id = ?
    `, [userId], (err, user) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(user);
    });
  });
};

// Listar usuários
export const getUsers = () => {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT id, email, name, role, is_active, last_login, created_at
      FROM users ORDER BY created_at DESC
    `, (err, users) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(users);
    });
  });
};

// Atualizar usuário
export const updateUser = (userId, updates) => {
  return new Promise((resolve, reject) => {
    const fields = [];
    const values = [];

    if (updates.name) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.role) {
      fields.push('role = ?');
      values.push(updates.role);
    }
    if (updates.is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(updates.is_active);
    }

    if (fields.length === 0) {
      reject(new Error('Nenhum campo para atualizar'));
      return;
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userId);

    db.run(`
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = ?
    `, values, function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ changes: this.changes });
    });
  });
};

// Alterar senha
export const changePassword = async (userId, currentPassword, newPassword) => {
  return new Promise((resolve, reject) => {
    // Verificar senha atual
    db.get(`
      SELECT password FROM users WHERE id = ?
    `, [userId], async (err, user) => {
      if (err) {
        reject(err);
        return;
      }

      if (!user) {
        reject(new Error('Usuário não encontrado'));
        return;
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        reject(new Error('Senha atual incorreta'));
        return;
      }

      // Atualizar senha
      const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
      db.run(`
        UPDATE users 
        SET password = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [hashedNewPassword, userId], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ changes: this.changes });
      });
    });
  });
};

// Limpar sessões expiradas
export const cleanExpiredSessions = () => {
  return new Promise((resolve, reject) => {
    db.run(`
      DELETE FROM sessions WHERE expires_at < datetime('now')
    `, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
};

// Estatísticas de login
export const getLoginStats = () => {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_attempts,
        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_logins,
        SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed_logins
      FROM login_attempts 
      WHERE created_at >= date('now', '-30 days')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, (err, stats) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(stats);
    });
  });
};
