import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Configuração AWS SES
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const ses = new AWS.SES({ apiVersion: '2010-12-01' });

console.log('📧 Configurando emails pessoais da equipe Triarc Solutions...\n');

// Lista de emails para verificar
const emailsToVerify = [
  'rafael.andres@triarcsolutions.com.br',
  'rafael@triarcsolutions.com.br',
  'rodolfo.fernandes@triarcsolutions.com.br',
  'rodolfo@triarcsolutions.com.br',
  'adjalma.aguiar@triarcsolutions.com.br',
  'adjalma@triarcsolutions.com.br'
];

// Função para verificar se um email já está verificado
async function checkEmailVerification(email) {
  try {
    const result = await ses.getIdentityVerificationAttributes({
      Identities: [email]
    }).promise();
    
    const attributes = result.VerificationAttributes[email];
    if (attributes) {
      return attributes.VerificationStatus === 'Success';
    }
    return false;
  } catch (error) {
    console.log(`❌ Erro ao verificar ${email}:`, error.message);
    return false;
  }
}

// Função para iniciar verificação de email
async function startEmailVerification(email) {
  try {
    const result = await ses.verifyEmailIdentity({
      EmailAddress: email
    }).promise();
    
    console.log(`✅ Verificação iniciada para ${email}`);
    console.log(`   📧 Email de verificação enviado`);
    return true;
  } catch (error) {
    if (error.code === 'AlreadyExistsException') {
      console.log(`⚠️  ${email} já está sendo verificado`);
      return true;
    } else {
      console.log(`❌ Erro ao iniciar verificação para ${email}:`, error.message);
      return false;
    }
  }
}

// Função para listar identidades verificadas
async function listVerifiedIdentities() {
  try {
    const result = await ses.listIdentities().promise();
    
    console.log('\n📋 Identidades verificadas:');
    if (result.Identities.length === 0) {
      console.log('   Nenhuma identidade encontrada');
    } else {
      result.Identities.forEach(identity => {
        console.log(`   ✅ ${identity}`);
      });
    }
    
    return result.Identities;
  } catch (error) {
    console.log('❌ Erro ao listar identidades:', error.message);
    return [];
  }
}

// Função para enviar email de teste
async function sendTestEmail(toEmail, fromEmail = process.env.AWS_SES_FROM_EMAIL) {
  try {
    const params = {
      Source: `${process.env.AWS_SES_FROM_NAME} <${fromEmail}>`,
      Destination: {
        ToAddresses: [toEmail]
      },
      Message: {
        Subject: {
          Data: '🎉 Email Corporativo Configurado - Triarc Solutions',
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: `
              <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #0ea5e9, #06b6d4); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                      <h1>🎉 Email Corporativo Configurado!</h1>
                    </div>
                    <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
                      <h2>Parabéns!</h2>
                      <p>Seu email corporativo <strong>${toEmail}</strong> foi configurado com sucesso no sistema Triarc Solutions.</p>
                      
                      <h3>📧 Informações do Email:</h3>
                      <ul>
                        <li><strong>Endereço:</strong> ${toEmail}</li>
                        <li><strong>Domínio:</strong> triarcsolutions.com.br</li>
                        <li><strong>Status:</strong> ✅ Ativo</li>
                        <li><strong>Data de Configuração:</strong> ${new Date().toLocaleDateString('pt-BR')}</li>
                      </ul>
                      
                      <h3>🚀 Próximos Passos:</h3>
                      <ol>
                        <li>Configure sua caixa de email no provedor</li>
                        <li>Configure assinatura corporativa</li>
                        <li>Teste o envio de emails</li>
                        <li>Acesse o dashboard: <a href="http://localhost:5173">http://localhost:5173</a></li>
                      </ol>
                      
                      <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h4>💡 Dicas:</h4>
                        <ul>
                          <li>Use sempre o email corporativo para comunicações profissionais</li>
                          <li>Configure filtros para organizar emails</li>
                          <li>Mantenha a assinatura atualizada</li>
                        </ul>
                      </div>
                      
                      <p>Atenciosamente,<br><strong>Equipe Triarc Solutions</strong></p>
                    </div>
                    <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
                      <p>Triarc Solutions - Soluções Empresariais Integradas</p>
                      <p>Email: suporte@triarcsolutions.com.br | Site: triarcsolutions.com.br</p>
                    </div>
                  </div>
                </body>
              </html>
            `,
            Charset: 'UTF-8'
          },
          Text: {
            Data: `
🎉 Email Corporativo Configurado!

Parabéns! Seu email corporativo ${toEmail} foi configurado com sucesso no sistema Triarc Solutions.

📧 Informações do Email:
- Endereço: ${toEmail}
- Domínio: triarcsolutions.com.br
- Status: ✅ Ativo
- Data de Configuração: ${new Date().toLocaleDateString('pt-BR')}

🚀 Próximos Passos:
1. Configure sua caixa de email no provedor
2. Configure assinatura corporativa
3. Teste o envio de emails
4. Acesse o dashboard: http://localhost:5173

💡 Dicas:
- Use sempre o email corporativo para comunicações profissionais
- Configure filtros para organizar emails
- Mantenha a assinatura atualizada

Atenciosamente,
Equipe Triarc Solutions

Triarc Solutions - Soluções Empresariais Integradas
Email: suporte@triarcsolutions.com.br | Site: triarcsolutions.com.br
            `,
            Charset: 'UTF-8'
          }
        }
      }
    };

    const result = await ses.sendEmail(params).promise();
    
    console.log(`✅ Email de teste enviado para ${toEmail}`);
    console.log(`   Message ID: ${result.MessageId}`);
    
    return true;
  } catch (error) {
    console.log(`❌ Erro ao enviar email de teste para ${toEmail}:`, error.message);
    return false;
  }
}

// Função principal
async function configurePersonalEmails() {
  console.log('🔍 Verificando status atual dos emails...\n');
  
  // Listar identidades já verificadas
  const verifiedIdentities = await listVerifiedIdentities();
  
  console.log('\n📧 Configurando emails pessoais...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const email of emailsToVerify) {
    console.log(`\n🔧 Processando: ${email}`);
    
    // Verificar se já está verificado
    const isVerified = await checkEmailVerification(email);
    
    if (isVerified) {
      console.log(`✅ ${email} já está verificado`);
      successCount++;
      
      // Enviar email de teste
      console.log(`📤 Enviando email de teste...`);
      await sendTestEmail(email);
      
    } else {
      console.log(`🔄 Iniciando verificação para ${email}...`);
      const started = await startEmailVerification(email);
      
      if (started) {
        console.log(`📧 Email de verificação enviado para ${email}`);
        console.log(`   ⚠️  Verifique sua caixa de email e clique no link de verificação`);
        successCount++;
      } else {
        errorCount++;
      }
    }
  }
  
  // Resultado final
  console.log('\n📊 RESUMO DA CONFIGURAÇÃO:');
  console.log(`   ✅ Sucessos: ${successCount}`);
  console.log(`   ❌ Erros: ${errorCount}`);
  console.log(`   📧 Total de emails: ${emailsToVerify.length}`);
  
  if (errorCount === 0) {
    console.log('\n🎉 CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Verifique sua caixa de email');
    console.log('2. Clique nos links de verificação');
    console.log('3. Aguarde alguns minutos para propagação');
    console.log('4. Teste o envio de emails');
    console.log('5. Configure suas caixas de email');
  } else {
    console.log('\n⚠️  CONFIGURAÇÃO PARCIAL');
    console.log('   Verifique os erros acima e tente novamente.');
  }
  
  console.log('\n📚 Documentação: EMAILS_PESSOAIS.md');
}

// Executar configuração
configurePersonalEmails().catch(console.error);
