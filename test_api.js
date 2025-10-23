import fetch from 'node-fetch';

async function testAPI() {
  console.log('🧪 Testando API do Sistema de Email Triarc\n');

  try {
    // Testar login
    console.log('1. Testando login...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@triarcsolutions.com.br',
        password: 'admin123'
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login realizado com sucesso');
      console.log(`   Token: ${loginData.token.substring(0, 20)}...`);
      console.log(`   Usuário: ${loginData.user.email}`);

      // Testar busca de emails
      console.log('\n2. Testando busca de emails...');
      const emailsResponse = await fetch('http://localhost:5000/api/emails/inbox', {
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json',
        }
      });

      if (emailsResponse.ok) {
        const emailsData = await emailsResponse.json();
        console.log('✅ Emails carregados com sucesso');
        console.log(`   Total de emails: ${emailsData.total}`);
        console.log(`   Emails na página: ${emailsData.emails.length}`);
        
        if (emailsData.emails.length > 0) {
          console.log('\n📧 Primeiros emails:');
          emailsData.emails.slice(0, 3).forEach((email, index) => {
            console.log(`   ${index + 1}. ${email.subject} (De: ${email.from_email})`);
          });
        }
      } else {
        console.log('❌ Erro ao carregar emails:', emailsResponse.status);
      }

    } else {
      console.log('❌ Erro no login:', loginResponse.status);
      const error = await loginResponse.text();
      console.log('   Erro:', error);
    }

  } catch (error) {
    console.log('❌ Erro de conexão:', error.message);
    console.log('   Verifique se o servidor está rodando na porta 5000');
  }
}

testAPI();
