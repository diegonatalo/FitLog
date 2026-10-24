<div align="center">

<img src="public/favicon.svg" alt="Logo do FitLog" width="88" height="88" />

# FitLog

**O diário de treino que cabe no bolso.**<br />
Registre séries, monte treinos, bata recordes e veja sua evolução, sem cadastro e sem internet.

<br />

![React](https://img.shields.io/badge/React-19-149eca?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-9135ff?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-instalável-5a0fc8?style=for-the-badge&logo=pwa&logoColor=white)

<br />

<img src="public/og-image.png" alt="FitLog: monitore sua evolução na academia" width="720" />

</div>

<br />

## Sumário

- [Por que o FitLog?](#por-que-o-fitlog)
- [Funcionalidades](#funcionalidades)
- [Começando](#começando)
- [Scripts](#scripts)
- [Variáveis de ambiente e SEO](#variáveis-de-ambiente-e-seo)
- [Seus dados](#seus-dados)
- [Arquitetura](#arquitetura)
- [Roteiro](#roteiro)

## Por que o FitLog?

Planilhas são ruins de usar com as mãos suadas entre uma série e outra. O FitLog foi desenhado
para o celular, na academia:

- **Rápido.** Abra o treino do dia, toque em *Registrar série* e a última carga já vem preenchida.
- **Privado.** Tudo fica no seu aparelho (`localStorage`). Nada de conta, servidor ou rastreio.
- **Offline.** Instale como app e treine mesmo onde o sinal não chega.

## Funcionalidades

### 🏋️ Treinar

| | |
| --- | --- |
| **Treinos prontos** | Agrupe exercícios em treinos (Push, Pull, Legs…) e reordene com um toque. |
| **Sessão ao vivo** | Cronômetro do treino, séries por exercício e observações da sessão. |
| **Timer de descanso** | Contagem regressiva (60 / 90 / 120 / 180 s) que vibra ao terminar. |
| **Carga sugerida** | A última série do exercício já vem preenchida no formulário. |
| **Quatro tipos de carga** | Peso (kg), placas, peso corporal (com carga extra) e tempo (cardio). |

### 📈 Evoluir

| | |
| --- | --- |
| **Recordes (PR)** | O app avisa na hora quando você bate um recorde e marca o PR no histórico. |
| **1RM estimado** | Estimativa pela fórmula de Epley a partir da sua melhor série. |
| **Gráfico de evolução** | Melhor carga por dia de cada exercício. |
| **Histórico de sessões** | Duração, séries, exercícios e anotações de cada treino concluído. |

### 🗂️ Organizar

| | |
| --- | --- |
| **Biblioteca** | Busca, filtro por grupo muscular e 25 exercícios de exemplo para começar. |
| **Arquivar** | Exercícios com histórico são arquivados em vez de apagados, e podem ser restaurados. |
| **Editar tudo** | Corrija qualquer série, com observação opcional. |
| **Backup em JSON** | Exporte e importe seus dados nos Ajustes. |
| **Tema claro e escuro** | Respeita o sistema e lembra da sua escolha. |

## Começando

Pré-requisitos: [Node.js](https://nodejs.org) 20+ e [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev
```

Abra [http://localhost:5173](http://localhost:5173). Para testar no celular, rode `pnpm dev --host`
e acesse o IP da sua máquina na mesma rede Wi-Fi.

## Scripts

| Comando | O que faz |
| --- | --- |
| `pnpm dev` | Servidor de desenvolvimento com HMR |
| `pnpm build` | Checa os tipos e gera a build de produção em `dist/` |
| `pnpm preview` | Serve a build localmente (o service worker só roda nela) |
| `pnpm lint` | Roda o ESLint |

## Variáveis de ambiente e SEO

As tags Open Graph, o `canonical`, o `robots.txt` e o `sitemap.xml` precisam de URLs absolutas.
Eles são gerados na build a partir de uma única variável:

```bash
cp .env.example .env
```

```ini
VITE_SITE_URL=https://dn-fitlog.vercel.app
```

| Arquivo | Origem |
| --- | --- |
| `index.html` | Meta tags de SEO, Open Graph, Twitter Card e PWA |
| `robots.txt`, `sitemap.xml` | Gerados em `vite.config.ts` na build |
| `public/og-image.png` | Imagem de compartilhamento (1200×630) |
| `public/manifest.webmanifest` | Manifesto do app instalável |
| `public/sw.js` | Service worker (cache offline) |

> Como é uma SPA, configure a hospedagem para devolver `index.html` em qualquer rota
> (por exemplo, o *rewrite* `/* → /index.html` na Vercel ou Netlify).

## Seus dados

Tudo vive no `localStorage` do navegador, em chaves `treino-log:*:v1`:

| Dado | Descrição |
| --- | --- |
| `Exercise` | Nome, grupo muscular, tipo de carga e flag de arquivado |
| `WorkoutSet` | Uma série: carga, repetições, observação e a sessão a que pertence |
| `Workout` | Um treino reutilizável: nome e lista ordenada de exercícios |
| `WorkoutSession` | Uma execução de treino: início, fim e observação |

Ao carregar, cada registro é validado em `src/lib/schema.ts`: dados corrompidos ou editados à mão
são descartados em vez de quebrar o app. Mudanças de formato passam por migrações versionadas
em `src/lib/storage.ts`. Abas abertas ao mesmo tempo ficam sincronizadas pelo evento `storage`.

**Faça backup.** Limpar os dados do navegador apaga o histórico. Use **Ajustes → Exportar backup**.

## Arquitetura

```text
src/
├── components/      UI reutilizável (LogForm, Stepper, RestTimer, ProgressChart…)
├── context/         StoreProvider: o estado do app, disponível via useStore()
├── hooks/           useWorkoutStore, usePersistedState, useTheme, useNow
├── lib/
│   ├── schema.ts    validação e backup
│   ├── storage.ts   persistência e migrações
│   ├── defaults.ts  exercícios e treinos de exemplo
│   ├── stats.ts     recordes, 1RM e série histórica
│   ├── format.ts    datas, durações e cargas
│   └── paths.ts     rotas centralizadas
├── pages/           uma tela por rota
└── types.ts         modelos e metadados dos tipos de carga
```

Decisões que valem saber:

- **Sem backend.** O estado é um único hook (`useWorkoutStore`) servido por Context e persistido
  por `usePersistedState`.
- **React Compiler ligado**: o código é escrito de forma simples e a memoização fica por conta do compilador.
- **Tailwind CSS 4** com tokens de cor em `src/index.css` (`oklch`), com tema claro e escuro.
- **Rotas em português** (`/biblioteca`, `/historico`, `/ajustes`), definidas em `src/lib/paths.ts`.

## Roteiro

- [ ] Testes automatizados (Vitest) para `lib/` e para as regras do store
- [ ] Séries de aquecimento e *drop sets*
- [ ] Medidas corporais e peso ao longo do tempo
- [ ] Sincronização opcional entre dispositivos

---

<div align="center">

Feito com 💚 por Diego para treinar sem planilha.

</div>
