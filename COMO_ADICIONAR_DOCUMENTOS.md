# Como adicionar um documento ao repositório

Repositório: https://github.com/TaniaBmGuedes/MDS-TP4

Este guia explica, passo a passo, onde pôr um documento novo e como o enviar para o GitHub.
Há duas formas: pelo **site do GitHub** (mais fácil) ou pelo **terminal**. Escolhe uma.

---

## 1. Onde pôr o documento

Cada pessoa tem uma pasta própria por sprint:

```
Registos/
└── Sprint 0/
    ├── Miguel/
    ├── Ricardo/
    ├── Tania/
    ├── Tiago/
    └── Yan/
```

Regras:

1. Põe o documento **na tua pasta**, dentro do **sprint em que estamos**.
   Exemplo: o Tiago, no Sprint 1, põe em `Registos/Sprint 1/Tiago/`.
2. Se a pasta do sprint ainda não existir, cria-a com o nome exato: `Sprint 1`, `Sprint 2`
   (com espaço, com S maiúsculo).
3. **Não** mexas nem apagues ficheiros das pastas dos colegas.

Outras pastas:

| Pasta | O que tem |
|---|---|
| `theme/` | Enunciado do trabalho. Não mexer. |
| `Screenshots/` | Capturas de ecrã para o relatório (provas do processo). |
| `flowlab/` | O código do site. Só para código. |
| `versoes/` | Versões guardadas do site (v1, v2…). Não mexer. |

## 2. Como dar nome ao ficheiro

Formato: `SprintN_Nome_O-que-e.extensão`

Exemplos:

- `Sprint1_Tiago_Ata-daily-04nov.docx`
- `Sprint1_Yan_Perguntas-teste-chatbot.pdf`
- `Sprint0_Miguel_Sketch-FlowLab.pdf`

Regras:

- Sem acentos e sem espaços no nome (usa `-` ou `_`).
- Datas no formato `04nov` ou `2026-11-04`.
- Formatos preferidos: `.pdf` para documentos finais, `.docx` para documentos ainda a editar,
  `.png` para imagens.

---

## 3. Opção A: pelo site do GitHub (mais fácil)

1. Abre https://github.com/TaniaBmGuedes/MDS-TP4 e faz login.
   (Se não tiveres acesso, pede à Tânia para te adicionar como colaborador.)
2. Clica na pasta `Registos`, depois em `Sprint N` e depois na **tua** pasta.
   - Se a pasta do sprint não existir, ver o ponto 6 deste passo.
3. Clica no botão **Add file** (canto superior direito) → **Upload files**.
4. Arrasta o documento para a página (ou clica em **choose your files**).
5. Em baixo, em **Commit changes**, escreve uma mensagem curta. Exemplo:
   `Sprint 1: ata da daily de 04/11 (Tiago)`
6. Deixa selecionado **Commit directly to the main branch** e clica em **Commit changes**.
7. Confirma que o ficheiro aparece na pasta certa.

**Criar uma pasta nova pelo site** (por exemplo `Sprint 1/Tiago`):
o GitHub não cria pastas vazias. Faz assim:

1. Entra em `Registos`, clica em **Add file** → **Create new file**.
2. No nome do ficheiro escreve `Sprint 1/Tiago/LEIA-ME.md`
   (cada `/` cria uma pasta).
3. Escreve qualquer coisa no conteúdo (por exemplo `Registos do Tiago no Sprint 1`)
   e clica em **Commit changes**.
4. Agora a pasta existe: entra nela e segue os passos 3 a 7 acima.

---

## 4. Opção B: pelo terminal (git)

Só da primeira vez, para descarregar o repositório:

```bash
git clone https://github.com/TaniaBmGuedes/MDS-TP4.git
cd MDS-TP4
```

Sempre que fores adicionar um documento:

```bash
# 1. Vai buscar as alterações dos colegas ANTES de mexer em nada
git pull

# 2. Cria a tua pasta do sprint, se ainda não existir
mkdir -p "Registos/Sprint 1/Tiago"

# 3. Copia o documento para lá (ou arrasta-o no Finder / Explorador)
cp ~/Downloads/Sprint1_Tiago_Ata-daily-04nov.docx "Registos/Sprint 1/Tiago/"

# 4. Confirma o que vai ser enviado (deve aparecer só o teu ficheiro)
git status

# 5. Junta só o teu ficheiro (não uses "git add ." para não enviar lixo)
git add "Registos/Sprint 1/Tiago/Sprint1_Tiago_Ata-daily-04nov.docx"

# 6. Grava com uma mensagem curta
git commit -m "Sprint 1: ata da daily de 04/11 (Tiago)"

# 7. Envia para o GitHub
git push
```

Se o `git push` der erro a dizer que há alterações novas (`rejected` ou `fetch first`):

```bash
git pull
git push
```

---

## 5. O que NUNCA enviar

- A pasta `node_modules/` (é enorme e recria-se com `npm install`).
- A pasta `dist/` (recria-se com `npm run build`).
- Ficheiros `.DS_Store` (lixo do Mac).
- Palavras-passe, chaves de API ou ficheiros `.env`.

O ficheiro `.gitignore` na raiz já impede estes casos quando se usa o terminal.

## 6. Checklist antes de enviar

- [ ] O documento está na **minha** pasta e no **sprint certo**.
- [ ] O nome segue o formato `SprintN_Nome_O-que-e.extensão`.
- [ ] A mensagem do commit diz o que é e de quem é.
- [ ] Fiz `git pull` antes (só para quem usa o terminal).
- [ ] Depois de enviar, confirmei no site que o ficheiro aparece.

Dúvidas: falar com a Tânia (Scrum Master).
