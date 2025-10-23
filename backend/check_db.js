const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.sqlite');

console.log('🔍 Verificando banco de dados...\n');

// Verificar emails por pasta
db.all("SELECT folder, COUNT(*) as count FROM emails GROUP BY folder", (err, rows) => {
  if (err) {
    console.error('Erro:', err);
  } else {
    console.log('📧 Emails por pasta:');
    rows.forEach(row => {
      console.log(`  ${row.folder}: ${row.count} emails`);
    });
  }
});

// Verificar usuários
db.all("SELECT email, name, role FROM users", (err, rows) => {
  if (err) {
    console.error('Erro:', err);
  } else {
    console.log('\n👤 Usuários cadastrados:');
    rows.forEach(row => {
      console.log(`  ${row.email} (${row.name}) - ${row.role}`);
    });
  }
});

// Verificar alguns emails de exemplo
db.all("SELECT id, from_email, to_email, subject, folder FROM emails LIMIT 5", (err, rows) => {
  if (err) {
    console.error('Erro:', err);
  } else {
    console.log('\n📬 Primeiros 5 emails:');
    rows.forEach(row => {
      console.log(`  ID: ${row.id} | ${row.folder} | De: ${row.from_email} | Assunto: ${row.subject}`);
    });
  }
  
  db.close();
});
