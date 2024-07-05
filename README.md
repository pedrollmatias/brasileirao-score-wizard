# brasileirao-score-wizard
Geração de relatórios de previsão de resultados de confrontos entre times do Brasileirão Série A, utilizados como input para análise por ferramentas de IA.

## Introdução

E se você pudesse prever (e não chutar) os resultados de partidas de rodadas do Brasileirão série A que ainda vão acontecer? E se você tivesse um mini-super-poder de saber o futuro, mas apenas da próxima rodada do Brasileirão?
Você não precisa de nenhum super poder, essa ferramente existe para isso. ~~Na verdade não é isso tudo.~~

Utilizando a tecnologia das IAs a seu favor, essa ferramenta gera relatórios para cada um dos confrontos entre os times da próxima rodada do Campeoado Brasileiro, que servirão como base para que as IAs analisem, cruzem informações relevantes, pondere as métricas e façam a sua previsão baseada em análises qualitativas e quantitativas.

Para uma rodada, a ferramenta gera 10 relatórios (um para cada confronto), contendo:
- Avaliação do elenco
- Classificação dos times na tabela
- Desempenho nas rodadas anteriores
- Análise qualitativa do confronto pelos colunistas do portal Globo Esporte
- Defalques
- Previsão do resultado acordo com o departamento de estatística da UFMG
- Previsão do resultado acordo com a plataforma API Football

Além dos relatórios, também são gerados os prompts (perguntas) para serem feitas na ferramenta de IA de sua preferência **(ChatGPT 4o+, Google Gemini 1.6 Pro+, etc)**, para extrair a melhor resposta.

Basta colocar o relatório do confronto como input, fazer a pergunta e __violá__ ✨: Você tem uma previsão já considerando todos dados, acontecimentos e estatísticas geradas para você


# Setup

Instale as dependências do projeto:

```
npm install
```

Você vai precisar de uma API Key da plataforma [API Football](https://www.api-football.com/). Possui uma versão free suficiente para geração dos relatórios.

Coloque sua API Key em um arquivo .env na raíz do projeto:

```
## .env

API_FOOTBALL_API_KEY=YOUR_API_KEY

```


## Utilização

Execute

`npm run start`

Insira as informações e os relatórios serão gerados na pasta `output` da raíz


## Demo e exemplos

Veja alguns exemplos de relatórios gerados para rodadas e campeonatos anteriores dentro da pasta [examples](https://www.api-football.com/)
