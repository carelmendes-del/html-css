function buildCVPrompt(dados, vaga) {
  return `Atuas como um especialista em Recursos Humanos e recrutamento (usando Português Europeu/Moçambicano formal).
A tua tarefa é gerar um Curriculum Vitae profissional com base nos dados fornecidos pelo candidato e, caso aplicável, na descrição da vaga.

Dados do candidato:
${JSON.stringify(dados, null, 2)}

Descrição da vaga (se aplicável):
${vaga || 'Nenhuma vaga específica informada.'}

Instruções:
1. Analisa os dados do candidato e estrutura-os para um CV otimizado.
2. Adapta o foco e o tom para destacar a adequação do perfil à vaga (se aplicável).
3. Preenche as secções: perfil, experiência, formação, skills, línguas, objetivo.
4. Responde EXCLUSIVAMENTE em formato JSON válido, sem qualquer texto adicional antes ou depois.

O JSON deve seguir EXATAMENTE esta estrutura:
{
  "perfil": "Resumo profissional...",
  "experiencia": ["Experiência 1", "Experiência 2"],
  "formacao": ["Formação 1", "Formação 2"],
  "skills": ["Skill 1", "Skill 2"],
  "linguas": ["Língua 1", "Língua 2"],
  "objetivo": "Objetivo profissional..."
}`;
}

function buildCartaPrompt(dados, vaga, empresa) {
  return `Atuas como um especialista em Recursos Humanos (usando Português Europeu/Moçambicano formal).
A tua tarefa é escrever uma Carta de Apresentação convincente para uma candidatura.

Dados do candidato:
${JSON.stringify(dados, null, 2)}

Vaga:
${vaga || 'Candidatura Espontânea'}

Empresa:
${empresa || 'A empresa'}

Instruções:
1. Escreve uma carta de apresentação formal e persuasiva, destacando os pontos fortes do candidato que se adequam à vaga/empresa.
2. Mantém um tom profissional, cordial e objetivo.
3. Responde EXCLUSIVAMENTE em formato JSON válido, sem qualquer texto adicional.

O JSON deve seguir EXATAMENTE esta estrutura:
{
  "assunto": "Assunto do email/carta...",
  "saudacao": "Exmo.(a) Senhor(a),",
  "paragrafo1": "Introdução...",
  "paragrafo2": "Desenvolvimento e adequação...",
  "paragrafo3": "Conclusão e chamada à ação...",
  "encerramento": "Com os melhores cumprimentos,",
  "nome": "Nome do candidato"
}`;
}

function buildChatPrompt(historicoConversa) {
  return `Atuas como um consultor de carreira amigável e profissional (usando Português Europeu/Moçambicano formal).
A tua tarefa é conduzir uma conversa guiada para recolher os dados necessários para gerar o CV do candidato.
Precisas de recolher, no mínimo: nome, experiência, formação, skills e objetivo.

Histórico da conversa até agora:
${JSON.stringify(historicoConversa, null, 2)}

Instruções:
1. Analisa o histórico da conversa.
2. Se faltarem dados essenciais, formula a próxima pergunta de forma natural para recolher essa informação e devolve a pergunta no JSON.
3. Se já tiveres recolhido todos os dados suficientes, constrói um objeto com esses dados no formato final e inclui a flag "concluido": true.
4. Responde EXCLUSIVAMENTE em formato JSON válido.

Se a recolha ainda estiver em curso, o JSON deve ser:
{
  "concluido": false,
  "mensagem": "A tua próxima pergunta ao candidato...",
  "dados_recolhidos_ate_agora": { ... }
}

Se a recolha estiver terminada, o JSON deve ser:
{
  "concluido": true,
  "mensagem": "Obrigado! Tenho tudo o que preciso.",
  "dados_finais": {
    "nome": "...",
    "experiencia": "...",
    "formacao": "...",
    "skills": "...",
    "objetivo": "..."
  }
}`;
}

function buildReviewPrompt(cvGerado) {
  return `Atuas como um exigente recrutador e revisor de CVs (usando Português Europeu/Moçambicano formal).
A tua tarefa é avaliar um CV gerado e propor melhorias.

CV Gerado:
${cvGerado}

Instruções:
1. Lê criticamente o CV.
2. Avalia de 0 a 100 quão profissional, claro e atrativo ele está.
3. Identifica aspetos positivos (pontos fortes).
4. Fornece sugestões claras e práticas de melhoria.
5. Responde EXCLUSIVAMENTE em formato JSON válido, sem texto adicional.

O JSON deve seguir EXATAMENTE esta estrutura:
{
  "score": 85,
  "pontos_fortes": ["Ponto 1", "Ponto 2"],
  "melhorias": ["Melhoria 1", "Melhoria 2"]
}`;
}

function buildProfilePrompt(dados) {
  return `Atuas como um analista de talentos (usando Português Europeu/Moçambicano formal).
A tua tarefa é detetar o perfil do candidato com base nos dados fornecidos e definir o tom recomendado para o CV.

Dados do candidato:
${JSON.stringify(dados, null, 2)}

Instruções:
1. Analisa os dados (anos de experiência, tipo de cargos, formação, etc.).
2. Classifica o nível (junior, mid, senior) e a área de atuação (técnico, comercial, liderança, etc.).
3. Define o tom e a linguagem que o CV deve adotar para valorizar esse perfil.
4. Responde EXCLUSIVAMENTE em formato JSON válido, sem texto adicional.

O JSON deve seguir EXATAMENTE esta estrutura:
{
  "nivel": "junior/mid/senior",
  "tipo_perfil": "técnico/comercial/...",
  "tom_recomendado": "Tom profissional, focado em...",
  "palavras_chave_sugeridas": ["keyword1", "keyword2"]
}`;
}

module.exports = {
  buildCVPrompt,
  buildCartaPrompt,
  buildChatPrompt,
  buildReviewPrompt,
  buildProfilePrompt
};
