const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET || 'cvstudio-super-secret-key-2024';

const fakeUser = {
  id: 1,
  email: 'test@example.com'
};
const token = jwt.sign(fakeUser, SECRET_KEY, { expiresIn: '1h' });

async function runAITest() {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    console.log('--- A INICIAR TESTES DA INTELIGÊNCIA ARTIFICIAL ---');
    console.log('Testando rota /api/ai/profile (que chama o prompt.js e api.js para a Anthropic)...\n');

    const result = await fetch('http://localhost:5000/api/ai/profile', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        dados: {
          nome: 'João',
          experiencia: '3 anos em Javascript',
          cargo: 'Software Engineer'
        }
      })
    });

    const data = await result.json();

    if (result.ok) {
      console.log('✅ SUCESSO! Resposta da IA devolvida e validada como JSON:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.error('❌ A chamada à API da IA falhou com erro:');
      console.error(data);
    }
  } catch (err) {
    console.error('❌ Erro fatal no servidor ou na ligação ao testar IA:', err);
  }
}

setTimeout(runAITest, 500);
