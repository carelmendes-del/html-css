const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET || 'cvstudio-super-secret-key-2024';

// Simulamos um utilizador com ID 1
const fakeUser = {
  id: 1,
  email: 'test@example.com'
};
const token = jwt.sign(fakeUser, SECRET_KEY, { expiresIn: '1h' });

async function runTests() {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    console.log('--- A INICIAR TESTES DO BACKEND (SEM IA) ---');
    
    // 1. Criar um CV
    console.log('\n1. Teste: Criar um CV (POST /api/cvs)');
    const postCv = await fetch('http://localhost:5000/api/cvs', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'CV de Software Engineer',
        data: { nome: 'João Teste', telefone: '123456789' }
      })
    });
    const cvCriado = await postCv.json();
    console.log('✅ Sucesso:', cvCriado);

    // 2. Listar CVs
    console.log('\n2. Teste: Listar CVs (GET /api/cvs)');
    const getCvs = await fetch('http://localhost:5000/api/cvs', { headers });
    const listaCvs = await getCvs.json();
    console.log('✅ Sucesso obtidos', listaCvs.length, 'CV(s). Último CV listado:', listaCvs[0]);

    // 3. Criar Carta de Apresentação
    console.log('\n3. Teste: Criar Carta de Apresentação (POST /api/cover-letters)');
    const postCl = await fetch('http://localhost:5000/api/cover-letters', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Carta Empresa Fake',
        content: { corpo: 'Estou bastante interessado na vaga de Developer.' }
      })
    });
    const clCriado = await postCl.json();
    console.log('✅ Sucesso:', clCriado);

    // 4. Listar Cartas
    console.log('\n4. Teste: Listar Cartas (GET /api/cover-letters)');
    const getCls = await fetch('http://localhost:5000/api/cover-letters', { headers });
    const listaCls = await getCls.json();
    console.log('✅ Sucesso obtidas', listaCls.length, 'Carta(s).');

    console.log('\n[!] Testes terminados na perfeição!');
  } catch (err) {
    console.error('❌ Erro durante o teste:', err);
  }
}

// Pequeno delay para garantir que o server.js arrancou noutra janela
setTimeout(runTests, 1000);
