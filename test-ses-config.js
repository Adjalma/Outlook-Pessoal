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

console.log('🧪 Testando configuração AWS SES...\n');

// Função para testar conectividade
async function testSESConnection() {
  try {
    console.log('1. Testando conectividade com AWS SES...');
    
    const result = await ses.getSendQuota().promise();
    
    console.log('✅ Conectividade OK!');
    console.log(`   - Limite diário: ${result.Max24HourSend}`);
    console.log(`   - Enviados nas últimas 24h: ${result.SentLast24Hours}`);
    console.log(`   - Taxa máxima por segundo: ${result.MaxSendRate}`);
    
    return true;
  } catch (error) {
    console.log('❌ Erro de conectividade:', error.message);
    return false;
  }
}

// Função para testar identidades verificadas
async function testVerifiedIdentities() {
  try {
    console.log('\n2. Verificando identidades...');
    
    const result = await ses.listIdentities().promise();
    
    if (result.Identities.length === 0) {
      console.log('⚠️  Nenhuma identidade verificada encontrada');
      console.log('   Configure o domínio triarcsolutions.com.br no console AWS SES');
      return false;
    }
    
    console.log('✅ Identidades encontradas:');
    result.Identities.forEach(identity => {
      console.log(`   - ${identity}`);
    });
    
    return true;
  } catch (error) {
    console.log('❌ Erro ao verificar identidades:', error.message);
    return false;
  }
}

// Função para testar envio de email
async function testEmailSending() {
  try {
    console.log('\n3. Testando envio de email...');
    
    const params = {
      Source: `${process.env.AWS_SES_FROM_NAME} <${process.env.AWS_SES_FROM_EMAIL}>`,
      Destination: {
        ToAddresses: [process.env.AWS_SES_FROM_EMAIL] // Enviar para si mesmo
      },
      Message: {
        Subject: {
          Data: 'Teste de Configuração AWS SES - Triarc Solutions',
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: `
              <html>
                <body>
                  <h2>🎉 Teste de Configuração AWS SES</h2>
                  <p>Este é um email de teste para verificar se a configuração do AWS SES está funcionando corretamente.</p>
                  <p><strong>Sistema:</strong> Triarc Email System</p>
                  <p><strong>Data:</strong> ${new Date().toLocaleString()}</p>
                  <p><strong>Status:</strong> ✅ Configuração OK!</p>
                  <hr>
                  <p><em>Triarc Solutions - Sistema de Email Corporativo</em></p>
                </body>
              </html>
            `,
            Charset: 'UTF-8'
          },
          Text: {
            Data: `
Teste de Configuração AWS SES

Este é um email de teste para verificar se a configuração do AWS SES está funcionando corretamente.

Sistema: Triarc Email System
Data: ${new Date().toLocaleString()}
Status: ✅ Configuração OK!

Triarc Solutions - Sistema de Email Corporativo
            `,
            Charset: 'UTF-8'
          }
        }
      }
    };

    const result = await ses.sendEmail(params).promise();
    
    console.log('✅ Email de teste enviado com sucesso!');
    console.log(`   - Message ID: ${result.MessageId}`);
    console.log(`   - Destinatário: ${process.env.AWS_SES_FROM_EMAIL}`);
    
    return true;
  } catch (error) {
    console.log('❌ Erro ao enviar email:', error.message);
    
    if (error.message.includes('MessageRejected')) {
      console.log('   💡 Dica: Verifique se o domínio está verificado no AWS SES');
    } else if (error.message.includes('AccessDenied')) {
      console.log('   💡 Dica: Verifique as credenciais AWS (Access Key e Secret Key)');
    } else if (error.message.includes('InvalidParameterValue')) {
      console.log('   💡 Dica: Verifique se o email de origem está verificado');
    }
    
    return false;
  }
}

// Função para verificar configuração DNS
function checkDNSConfiguration() {
  console.log('\n4. Verificando configuração DNS...');
  
  const requiredRecords = [
    {
      type: 'SPF',
      name: 'triarcsolutions.com.br',
      value: 'v=spf1 include:amazonses.com ~all'
    },
    {
      type: 'DMARC',
      name: '_dmarc.triarcsolutions.com.br',
      value: 'v=DMARC1; p=quarantine; rua=mailto:dmarc@triarcsolutions.com.br'
    }
  ];
  
  console.log('📋 Registros DNS necessários:');
  requiredRecords.forEach(record => {
    console.log(`   ${record.type}:`);
    console.log(`     Nome: ${record.name}`);
    console.log(`     Valor: ${record.value}`);
  });
  
  console.log('\n   DKIM: 3 registros CNAME (obtenha no console AWS SES)');
  console.log('   ⚠️  Aguarde até 72h para propagação DNS');
}

// Função principal
async function runTests() {
  console.log('🚀 Iniciando testes de configuração AWS SES\n');
  
  // Verificar variáveis de ambiente
  const requiredEnvVars = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_SES_FROM_EMAIL',
    'AWS_SES_FROM_NAME'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('❌ Variáveis de ambiente faltando:');
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    console.log('\n💡 Configure essas variáveis no arquivo .env');
    return;
  }
  
  console.log('✅ Variáveis de ambiente configuradas');
  
  // Executar testes
  const connectionOK = await testSESConnection();
  const identitiesOK = await testVerifiedIdentities();
  const emailOK = await testEmailSending();
  
  checkDNSConfiguration();
  
  // Resultado final
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log(`   Conectividade: ${connectionOK ? '✅' : '❌'}`);
  console.log(`   Identidades: ${identitiesOK ? '✅' : '❌'}`);
  console.log(`   Envio de Email: ${emailOK ? '✅' : '❌'}`);
  
  if (connectionOK && identitiesOK && emailOK) {
    console.log('\n🎉 CONFIGURAÇÃO AWS SES COMPLETA!');
    console.log('   O sistema está pronto para uso.');
  } else {
    console.log('\n⚠️  CONFIGURAÇÃO INCOMPLETA');
    console.log('   Verifique os erros acima e configure corretamente.');
  }
  
  console.log('\n📚 Documentação completa: AWS_SES_SETUP.md');
}

// Executar testes
runTests().catch(console.error);
