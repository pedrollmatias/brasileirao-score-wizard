import path, { dirname } from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const fsPromises = fs.promises;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const generateAiPromptFile = async ({ matches, round, season }) => {
  const content = matches.reduce((str, match) => {
    const matchPrompt = `Analise detalhadamente o relatório informado, me dê o seu palpite sobre o confronto entre ${match.home.name} x ${match.away.name}, válido pela rodada ${round} do campeonato brasileiro série A ${season}. O palpite deve conter a chance do time mandante vencer, a chance do visitante vencer e a chance de empate.

Para uma análise mais acertiva, considere todas as informações presentes no relatório e correlacione-as.

Lembre-se de ponderar as informações para me dar o seu palpite de acordo com a sessão 6 (Classificação da relevância das metricas paraprevisão do resultado) do relatório.

Quando houver, observe atentamente a análise qualitativa dos confrontos. Considerar relevantes informações como desfalques, trocas de técnico, desempenho e etc, contidas na análise qualitativa. Cruze com os dados estatísticos presentes no relatório sobre rodadas, pontos, vitórias, derrotas e etc, para auxiliar na geração de uma resposta final mais consistente.

Observe as previsões do API Football e da UFMG, relacione-as com os demais dados e análises do relatório e veja como essas previsões podem ser utilizadas na sua resposta final. A previsão da UFMG é levemente mais relevante do que a do API Football.

Considerem também o desempenho do time como mandante e como visitante. Analise as rodadas anteriores e o desempenho dos times como visitante e mandante, para então avaliar essa métrica com a informação de mando de campo do confronto. Lembre-se que desempenho como mandante e visitante são distintos.

Me dê uma resposta com sua justificativa do porque você decidiu por tais porcentagens, e como você ponderou as métricas para gerar as porcentagens.
  `;

    return `${str}    
    ${matchPrompt}
    
    ---

    `;
  }, "");

  const filePath = path.join(__dirname, "../output/ai-prompt.txt");

  await fsPromises.writeFile(filePath, content);
};
