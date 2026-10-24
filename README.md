<div align="center">

<img src="public/og-image.png" alt="Banner do FitLog: ícone de halter verde-limão e o texto Monitore sua evolução na academia" width="720" />

# FitLog

**O diário de treino que cabe no bolso.**<br />
Registre séries, monte treinos, bata recordes e veja sua evolução, sem cadastro e sem internet.

<br />

[![Abrir o app](https://img.shields.io/badge/abrir_o_app-dn--fitlog.vercel.app-9fe02e?style=for-the-badge&logo=vercel&logoColor=17220a&labelColor=17220a)](https://dn-fitlog.vercel.app)

![React](https://img.shields.io/badge/React_19-20232a?style=flat-square&logo=react&logoColor=61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript_6-3178c6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_8-646cff?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-instalável-5a0fc8?style=flat-square&logo=pwa&logoColor=white)
![Dados](https://img.shields.io/badge/dados-só_no_seu_navegador-9fe02e?style=flat-square&labelColor=17220a)

</div>

<br />

## ✨ O que dá para fazer

| Recurso | Descrição |
|---|---|
| **Treinos prontos** | Agrupe exercícios em treinos (Push, Pull, Legs…), defina a ordem e inicie tudo com um toque. |
| **Sessão ao vivo** | Cronômetro do treino, séries por exercício e observações da sessão e de cada série. |
| **Timer de descanso** | Contagem regressiva de 60, 90, 120 ou 180 s depois de cada série, com vibração ao terminar. |
| **Carga sugerida** | A última série do exercício já vem preenchida, então você só ajusta o que mudou. |
| **Quatro tipos de carga** | Peso (kg), placas, peso corporal (com carga extra opcional) e tempo, para cardio. |
| **Recordes e evolução** | Aviso na hora de um novo recorde, marca de PR no histórico, 1RM estimado e gráfico da melhor carga por dia. |
| **Biblioteca** | Busca, filtro por grupo muscular e 25 exercícios de exemplo. Exercícios com histórico são arquivados, não apagados. |
| **Histórico de sessões** | Duração, séries e anotações de cada treino concluído, com edição de qualquer série. |

<br />

## 🔒 Seus dados

Tudo fica no `localStorage` do seu navegador. Não há conta, servidor nem rastreamento.

- Ao carregar, cada registro é validado: dados corrompidos ou editados à mão são descartados em vez de quebrar o app.
- Abas abertas ao mesmo tempo ficam sincronizadas.
- O app pode ser instalado e funciona offline na versão publicada (service worker).

> [!NOTE]
> Limpar os dados do navegador apaga o histórico. Em **Ajustes**, use **Exportar backup** para
> salvar um arquivo JSON e **Importar backup** para restaurá-lo, inclusive em outro aparelho.

<br />

## 🧠 Como funciona

| Conceito | Regra |
|---|---|
| **Recorde (PR)** | Uma série é recorde quando a carga supera todas as anteriores do mesmo exercício e tipo de carga. A primeira série nunca conta. |
| **1RM estimado** | Fórmula de Epley (`carga × (1 + reps / 30)`), calculada sobre a melhor série em peso. |
| **Sessão** | Só uma sessão pode estar ativa por vez. Descartar apaga as séries dela, finalizar manda para o histórico. |
| **Arquivar** | Exercício com registros é arquivado ao ser removido. O histórico é mantido e ele pode ser restaurado em Biblioteca → Arquivados. |

<br />

## 🚀 Rodando localmente

Requer [Node.js](https://nodejs.org) e [pnpm](https://pnpm.io).

```bash
git clone https://github.com/diegonatalo/FitLog.git
cd FitLog
pnpm install
pnpm dev        # http://localhost:5173
```

Para testar no celular, use `pnpm dev --host` e abra o IP da sua máquina na mesma rede Wi-Fi.

| Comando | O que faz |
|---|---|
| `pnpm dev` | Servidor de desenvolvimento com HMR |
| `pnpm build` | Checa os tipos e gera o build de produção em `dist/` |
| `pnpm preview` | Serve o build de produção (o service worker só roda nele) |
| `pnpm lint` | Roda o ESLint |

<br />

## 🔑 Variáveis de ambiente

Veja [`.env.example`](.env.example).

| Variável | Descrição | Se não definir |
|---|---|---|
| `VITE_SITE_URL` | URL pública do site, usada no `canonical`, nas tags Open Graph, no `robots.txt` e no `sitemap.xml`. Sem barra no final. | Usa `https://dn-fitlog.vercel.app` |

<br />

## 🗂️ Estrutura

```text
src/
├── components/   interface reutilizável (LogForm, RestTimer, ProgressChart…)
├── context/      StoreProvider: o estado do app, lido com useStore()
├── hooks/        useWorkoutStore, usePersistedState, useTheme, useNow
├── lib/
│   ├── schema.ts     validação dos dados e formato do backup
│   ├── storage.ts    persistência e migrações versionadas
│   ├── defaults.ts   exercícios e treinos de exemplo
│   ├── stats.ts      recordes, 1RM e série histórica
│   ├── format.ts     datas, durações e cargas
│   └── paths.ts      rotas centralizadas
├── pages/        uma tela por rota
└── types.ts      modelos e metadados dos tipos de carga
public/           ícones, manifest, service worker e imagem Open Graph
```

<details>
<summary><b>Como adicionar um novo tipo de carga</b></summary>

<br />

1. Inclua o valor em `LoadType` e uma entrada em `LOAD_TYPES`, em `src/types.ts` (rótulo, unidade, passo e se tem repetições).
2. Associe um ícone em `ICONS`, em `src/components/LoadTypeToggle.tsx`.
3. Se a unidade tiver formato especial, trate-a em `loadParts`, em `src/lib/format.ts`.
4. O validador em `src/lib/schema.ts` já aceita qualquer valor de `LOAD_TYPES`.

</details>

> [!NOTE]
> O estado vive em um único hook (`useWorkoutStore`), servido por Context e persistido por
> `usePersistedState`. O React Compiler está ligado, então o código evita memoização manual.

<br />

## 🌐 Deploy

Publicado na [Vercel](https://vercel.com) em [dn-fitlog.vercel.app](https://dn-fitlog.vercel.app).

- O `vercel.json` reescreve todas as rotas para `index.html`, o que mantém funcionando o acesso direto a páginas como `/biblioteca`.
- O `robots.txt` e o `sitemap.xml` são gerados na build, em `vite.config.ts`.
- Ao trocar de domínio, defina `VITE_SITE_URL` (ou altere o valor padrão em `vite.config.ts`). Sem isso, o Open Graph, o `canonical` e o sitemap continuam apontando para o endereço antigo.

<br />

## 🧭 Próximos passos

- [ ] Testes automatizados (Vitest) para `lib/` e para as regras do store
- [ ] Capturas de tela no README
- [ ] Séries de aquecimento e *drop sets*
- [ ] Medidas corporais e peso ao longo do tempo
- [ ] Sincronização opcional entre dispositivos

> Hoje não há testes automatizados nem CI, e os dados existem apenas no aparelho onde foram registrados.

<br />

<div align="center">
  <sub>Feito com 💚 para treinar sem planilha.</sub>
</div>
