async function chamarIA(prompt) {
  // A chave é lida da variável de ambiente GEMINI_API_KEY
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Chave de API em falta. Verifique a variável de ambiente GEMINI_API_KEY.');
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.4
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Erro na API Gemini (${response.status}): ${errorData}`);
    }

    const data = await response.json();
    
    // Extrai o texto da resposta do formato da Gemini
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
      throw new Error('Formato de resposta inesperado da API Gemini.');
    }

    // Tenta encontrar e limpar a resposta para garantir que temos apenas JSON válido.
    let jsonString = textResponse.trim();
    
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Procura o primeiro "{" e o último "}" para extrair apenas o objeto JSON
    const firstBrace = jsonString.indexOf('{');
    const lastBrace = jsonString.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonString = jsonString.substring(firstBrace, lastBrace + 1);
    }

    const parsedJson = JSON.parse(jsonString);
    return parsedJson;

  } catch (error) {
    console.error('Erro na função chamarIA:', error.message);
    throw new Error(`Falha ao comunicar com a IA (Gemini) ou processar o JSON: ${error.message}`);
  }
}

module.exports = {
  chamarIA
};
