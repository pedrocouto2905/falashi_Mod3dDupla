// Funções auxiliares para comparar a resposta falada com a resposta esperada,
// permitindo pequenas variações (acentos, maiúsculas, palavras extras, erros de digitação leves).

// Remove acentos, pontuação e espaços extras, e converte para minúsculas
export function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-z0-9\s]/g, '') // remove pontuação
    .replace(/\s+/g, ' ')
    .trim();
}

// Distância de Levenshtein entre duas strings
export function levenshteinDistance(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substituição
          matrix[i][j - 1] + 1, // inserção
          matrix[i - 1][j] + 1 // remoção
        );
      }
    }
  }
  return matrix[a.length][b.length];
}

// Retorna similaridade entre 0 e 1 (1 = idêntico)
export function similarity(a, b) {
  const normA = normalizeText(a);
  const normB = normalizeText(b);
  if (normA === normB) return 1;

  const maxLen = Math.max(normA.length, normB.length);
  if (maxLen === 0) return 1;

  const distance = levenshteinDistance(normA, normB);
  return 1 - distance / maxLen;
}

// Verifica se a resposta falada é considerada correta
// threshold: 0.8 = permite até ~20% de diferença
export function isAnswerCorrect(spoken, expected, threshold = 0.75) {
  const normSpoken = normalizeText(spoken);
  const normExpected = normalizeText(expected);

  // acerto exato após normalização
  if (normSpoken === normExpected) return true;

  // se a resposta esperada estiver contida na fala (usuário falou frase completa)
  if (normSpoken.includes(normExpected)) return true;

  // similaridade por distância de edição
  return similarity(normSpoken, normExpected) >= threshold;
}
