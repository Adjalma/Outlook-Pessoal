const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conectar ao banco de dados
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Atualizando tabela de emails...');

// Verificar se as colunas existem
db.all("PRAGMA table_info(emails)", (err, columns) => {
  if (err) {
    console.error('Erro ao verificar schema:', err);
    return;
  }
  
  const columnNames = columns.map(col => col.name);
  console.log('Colunas existentes:', columnNames);
  
  const missingColumns = [];
  
  if (!columnNames.includes('received_at')) {
    missingColumns.push('received_at DATETIME');
  }
  if (!columnNames.includes('message_id')) {
    missingColumns.push('message_id TEXT');
  }
  
  if (missingColumns.length > 0) {
    console.log('Adicionando colunas faltantes:', missingColumns);
    
    missingColumns.forEach(column => {
      db.run(`ALTER TABLE emails ADD COLUMN ${column}`, (err) => {
        if (err) {
          console.error(`Erro ao adicionar coluna ${column}:`, err);
        } else {
          console.log(`✅ Coluna ${column} adicionada com sucesso`);
        }
      });
    });
  } else {
    console.log('✅ Todas as colunas já existem');
  }
  
  console.log('🎉 Banco de dados atualizado com sucesso!');
  db.close();
});
