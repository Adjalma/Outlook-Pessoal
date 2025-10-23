const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Script para migrar dados do SQLite local para PostgreSQL no Vercel
const migrateData = async () => {
  console.log('🔄 Iniciando migração de dados...');
  
  // Conectar ao SQLite local
  const sqlitePath = path.join(__dirname, 'data', 'triarc_email.db');
  
  if (!fs.existsSync(sqlitePath)) {
    console.log('❌ Arquivo SQLite não encontrado:', sqlitePath);
    return;
  }
  
  const db = new sqlite3.Database(sqlitePath);
  
  // Conectar ao PostgreSQL (Vercel)
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL não configurado. Configure PostgreSQL no Vercel primeiro.');
    return;
  }
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    // Migrar usuários
    console.log('📧 Migrando usuários...');
    const users = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM users', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    for (const user of users) {
      await pool.query(`
        INSERT INTO users (id, email, password, name, role, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO NOTHING
      `, [user.id, user.email, user.password, user.name, user.role, user.created_at, user.updated_at]);
    }
    
    // Migrar emails
    console.log('📧 Migrando emails...');
    const emails = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM emails', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    for (const email of emails) {
      await pool.query(`
        INSERT INTO emails (id, user_id, from_email, to_email, subject, body, attachments, folder, is_read, is_flagged, is_pinned, received_at, message_id, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO NOTHING
      `, [email.id, email.user_id, email.from_email, email.to_email, email.subject, email.body, email.attachments, email.folder, email.is_read, email.is_flagged, email.is_pinned, email.received_at, email.message_id, email.created_at]);
    }
    
    // Migrar contatos
    console.log('👥 Migrando contatos...');
    const contacts = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM contacts', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    for (const contact of contacts) {
      await pool.query(`
        INSERT INTO contacts (id, user_id, name, email, phone, company, department, notes, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO NOTHING
      `, [contact.id, contact.user_id, contact.name, contact.email, contact.phone, contact.company, contact.department, contact.notes, contact.created_at]);
    }
    
    // Migrar eventos do calendário
    console.log('📅 Migrando eventos do calendário...');
    const events = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM calendar_events', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    for (const event of events) {
      await pool.query(`
        INSERT INTO calendar_events (id, user_id, title, description, day, month, year, time, duration, type, meeting_id, teams_link, participants, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO NOTHING
      `, [event.id, event.user_id, event.title, event.description, event.day, event.month, event.year, event.time, event.duration, event.type, event.meeting_id, event.teams_link, event.participants, event.created_at]);
    }
    
    console.log('✅ Migração concluída com sucesso!');
    console.log(`📊 Dados migrados:`);
    console.log(`   - ${users.length} usuários`);
    console.log(`   - ${emails.length} emails`);
    console.log(`   - ${contacts.length} contatos`);
    console.log(`   - ${events.length} eventos`);
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  } finally {
    db.close();
    await pool.end();
  }
};

// Executar migração se chamado diretamente
if (require.main === module) {
  migrateData();
}

module.exports = { migrateData };
