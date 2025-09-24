# n8n Random – Custom Node Desafio Onfly

Custom node para **n8n** que gera **1 número inteiro aleatório** entre **Min** e **Max** usando a **API do [random.org](https://www.random.org)**.

- **Nome do node:** `Random`
- **Operação:** `True Random Number Generator`
- **Inputs:** `Min` (inteiro), `Max` (inteiro)
- **Saída:** `{ min, max, value, source: "random.org" }`

> ✅ Compatível com **n8n 1.85.4** (imagem `n8nio/n8n:1.85.4`) e **PostgreSQL 16**.  
> ✅ Compilado com **Node.js 22 LTS** + **TypeScript**.

---

## Índice
- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Como rodar (Docker)](#como-rodar-docker)
- [Como compilar o custom node](#como-compilar-o-custom-node)
- [Como usar no editor do n8n](#como-usar-no-editor-do-n8n)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Notas de implementação](#notas-de-implementação)


---

## Requisitos

- **Docker Desktop** + **Docker Compose v2**
- **Node.js 22 LTS** + **npm** (apenas para compilar o custom node)
- **Git**
- (Windows) **WSL2** habilitado (opção padrão do Docker Desktop)

---

## Instalação

Clone este repositório e entre na pasta do projeto:

```bash
git clone <URL_DO_REPO>
```

---

## Como rodar (Docker)

> Certifique-se de que o Docker Desktop está **Running**.

```bash
# na raiz do projeto
docker compose up -d
# opcional: ver status
docker compose ps

```


---

## Como compilar o custom node

> Necessário **Node.js 22 LTS** instalado na máquina host.

**No terminal:**
```bash
cd custom-random-node
npm i
npm run build
mkdir -p dist/icons
cp -R src/icons/* dist/icons/
cd ..
```

> O `docker-compose.yml` já monta o **pacote inteiro** (`./custom-random-node`) em `/home/node/.n8n/custom/random`.  
> Se você recompilar, reinicie o serviço do n8n:
>
> ```bash
> docker compose restart n8n
> ```

---

## Como usar no editor do n8n

1. Abra **http://localhost:5678** e entre.
2. Clique em **“+ Add node”** e busque por **“Random”**.
3. Arraste o node para o canvas e configure:
   - **Min** = inteiro (ex.: `1`)
   - **Max** = inteiro (ex.: `100`)
4. Clique em **Execute Node**.

**Saída esperada:**
```json
{
  "min": 1,
  "max": 100,
  "value": 42,
  "source": "random.org"
}
```

---

## Variáveis de ambiente

Arquivo `.env` (raiz):

```env
POSTGRES_USER=n8n
POSTGRES_PASSWORD=n8n
POSTGRES_DB=n8n
```

Variáveis já definidas no `docker-compose.yml`:

- `DB_TYPE=postgresdb`  
- `DB_POSTGRESDB_HOST=postgres`  
- `DB_POSTGRESDB_PORT=5432`  
- `DB_POSTGRESDB_DATABASE=${POSTGRES_DB}`  
- `DB_POSTGRESDB_USER=${POSTGRES_USER}`  
- `DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD}`  
- `N8N_CUSTOM_EXTENSIONS=/home/node/.n8n/custom`  
- `GENERIC_TIMEZONE=America/Sao_Paulo`  
- `TZ=America/Sao_Paulo`

---

## Estrutura de pastas

```
raiz-do-projeto/
├─ docker-compose.yml
├─ .env
├─ README.md                
└─ custom-random-node/     # pacote do custom node
   ├─ package.json         # contém o bloco "n8n" que registra o node
   ├─ tsconfig.json
   ├─ src/
      ├─ Random.node.ts
      └─ icons/
         └─ random.svg

```

---


## Notas de implementação

- Endpoint utilizado:
  ```
  https://www.random.org/integers/?num=1&min=<min>&max=<max>&col=1&base=10&format=plain&rnd=new
  ```
- Validação: inteiros e `min ≤ max`.
- Ícone SVG carregado via `icon: 'file:icons/random.svg'` (copiado para `dist/icons`).
- Pacote segue o **manifest do n8n** em `package.json` (`"n8n".nodes`).
- Timezone do container ajustado para `America/Sao_Paulo`.

---

