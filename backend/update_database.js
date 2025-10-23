const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conectar ao banco de dados
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Atualizando banco de dados...');

// Verificar se as colunas do Teams existem
db.get("PRAGMA table_info(calendar_events)", (err, result) => {
  if (err) {
    console.error('Erro ao verificar schema:', err);
    return;
  }
  
  console.log('Schema atual da tabela calendar_events:', result);
});

// Adicionar colunas do Teams se não existirem
const addTeamsColumns = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Verificar se as colunas existem
      db.all("PRAGMA table_info(calendar_events)", (err, columns) => {
        if (err) {
          reject(err);
          return;
        }
        
        const columnNames = columns.map(col => col.name);
        console.log('Colunas existentes:', columnNames);
        
        const missingColumns = [];
        
        if (!columnNames.includes('meeting_id')) {
          missingColumns.push('meeting_id TEXT');
        }
        if (!columnNames.includes('teams_link')) {
          missingColumns.push('teams_link TEXT');
        }
        if (!columnNames.includes('participants')) {
          missingColumns.push('participants TEXT');
        }
        
        if (missingColumns.length > 0) {
          console.log('Adicionando colunas faltantes:', missingColumns);
          
          missingColumns.forEach(column => {
            db.run(`ALTER TABLE calendar_events ADD COLUMN ${column}`, (err) => {
              if (err) {
                console.error(`Erro ao adicionar coluna ${column}:`, err);
              } else {
                console.log(`✅ Coluna ${column} adicionada com sucesso`);
              }
            });
          });
        } else {
          console.log('✅ Todas as colunas do Teams já existem');
        }
        
        resolve();
      });
    });
  });
};

// Limpar dados duplicados
const cleanDuplicates = () => {
  return new Promise((resolve, reject) => {
    console.log('🧹 Limpando dados duplicados...');
    
    // Limpar emails duplicados
    db.run(`DELETE FROM emails WHERE id NOT IN (
      SELECT MIN(id) FROM emails GROUP BY from_email, to_email, subject, body
    )`, (err) => {
      if (err) {
        console.error('Erro ao limpar emails duplicados:', err);
      } else {
        console.log('✅ Emails duplicados removidos');
      }
    });
    
    // Limpar eventos duplicados
    db.run(`DELETE FROM calendar_events WHERE id NOT IN (
      SELECT MIN(id) FROM calendar_events GROUP BY user_id, title, day, month, year
    )`, (err) => {
      if (err) {
        console.error('Erro ao limpar eventos duplicados:', err);
      } else {
        console.log('✅ Eventos duplicados removidos');
      }
    });
    
    // Limpar contatos duplicados
    db.run(`DELETE FROM contacts WHERE id NOT IN (
      SELECT MIN(id) FROM contacts GROUP BY user_id, name, email
    )`, (err) => {
      if (err) {
        console.error('Erro ao limpar contatos duplicados:', err);
      } else {
        console.log('✅ Contatos duplicados removidos');
      }
    });
    
    // Limpar pastas duplicadas
    db.run(`DELETE FROM custom_folders WHERE id NOT IN (
      SELECT MIN(id) FROM custom_folders GROUP BY user_id, name
    )`, (err) => {
      if (err) {
        console.error('Erro ao limpar pastas duplicadas:', err);
      } else {
        console.log('✅ Pastas duplicadas removidas');
      }
    });
    
    resolve();
  });
};

// Executar atualizações
async function updateDatabase() {
  try {
    await addTeamsColumns();
    await cleanDuplicates();
    
    console.log('🎉 Banco de dados atualizado com sucesso!');
    console.log('📊 Contando registros finais...');
    
    // Contar registros finais
    db.get('SELECT COUNT(*) as count FROM emails', (err, result) => {
      if (!err) console.log(`📧 Emails: ${result.count}`);
    });
    
    db.get('SELECT COUNT(*) as count FROM calendar_events', (err, result) => {
      if (!err) console.log(`📅 Eventos: ${result.count}`);
    });
    
    db.get('SELECT COUNT(*) as count FROM contacts', (err, result) => {
      if (!err) console.log(`👥 Contatos: ${result.count}`);
    });
    
    db.get('SELECT COUNT(*) as count FROM custom_folders', (err, result) => {
      if (!err) console.log(`📁 Pastas: ${result.count}`);
    });
    
    db.close();
  } catch (error) {
    console.error('❌ Erro ao atualizar banco:', error);
    db.close();
  }
}

updateDatabase();
