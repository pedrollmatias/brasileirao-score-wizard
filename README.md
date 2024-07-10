# brasileirao-score-wizard 🧙‍♂️ 
Geração de relatórios de previsão de resultados de confrontos entre times do Brasileirão Série A, utilizados como input para análise por ferramentas de IA.

## Introdução

E se você pudesse prever (e não chutar) os resultados de partidas de rodadas do Brasileirão série A que ainda vão acontecer? E se você tivesse um mini-super-poder de saber o futuro da próxima rodada do Brasileirão?
Você não precisa de nenhum super poder, essa ferramente existe para isso. ~~Na verdade não é isso tudo.~~

Utilizando a tecnologia das IAs a seu favor, essa ferramenta gera relatórios para cada um dos confrontos entre os times da próxima rodada do Campeoado Brasileiro, que servirão como base para que as IAs analisem, cruzem informações relevantes, pondere as métricas e façam suas previsões baseadas em análises qualitativas e quantitativas.

Para uma rodada, a ferramenta gera 10 relatórios (um para cada confronto), contendo:
- Avaliação do elenco
- Classificação dos times na tabela
- Desempenho nas rodadas anteriores
- Análise qualitativa do confronto pelos colunistas do portal Globo Esporte
- Defalques
- Previsão do resultado acordo com o departamento de estatística da UFMG
- Previsão do resultado acordo com a plataforma API Football

Utilize o [prompt](https://github.com/pedrollmatias/brasileirao-score-wizard/tree/main/src/data/prompt.txt) (comando) para ser usado na ferramenta de IA de sua preferência **(ChatGPT 4o+, Google Gemini 1.6 Pro+, etc)**, para extrair a melhor resposta.

Basta colocar o relatório do confronto como input, fazer a pergunta e _voilà_ ✨: Você tem uma previsão já considerando todos dados, acontecimentos e estatísticas geradas para você.


## Setup

Instale as dependências do projeto:

```
npm install
```

Você vai precisar de uma API Key da plataforma [API Football](https://www.api-football.com/). Possui uma versão gratuita suficiente para geração dos relatórios da rodada (100 requisições/dia).

Coloque sua API Key em um arquivo .env na raíz do projeto:

```
## .env

API_FOOTBALL_API_KEY=YOUR_API_KEY

```

A depender do seu ambiente, você pode precisar especificar o path do executável do Chrome/Chormium, já que a geração do PDF utiliza o [@puppeteer](https://www.npmjs.com/package/puppeteer)
```
## .env

API_FOOTBALL_API_KEY=YOUR_API_KEY
BROWSER_EXECUTABLE_PATH=/usr/bin/chromium-browser

```


## Utilização

Execute

`npm run start`

Insira as informações e os relatórios serão gerados na pasta `output` da raíz.

## Demo e exemplos

Veja alguns exemplos de relatórios gerados para rodadas e campeonatos anteriores dentro da pasta [examples](https://github.com/pedrollmatias/brasileirao-score-wizard/tree/main/examples).
