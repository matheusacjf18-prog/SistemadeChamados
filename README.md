# 🛠️ Sistema de Chamados - RM Technologies

Projeto desenvolvido para fins acadêmicos na **UniAcademia** (3º período de Sistemas de Informação). O sistema permite a abertura e gestão de chamados técnicos, integrado a um banco de dados SQLite e serviço de e-mail.

## 💻 Tecnologias Utilizadas
* **Frontend:** React 19, Vite, Bootstrap, React Router
* **Backend:** Node.js, SQLite3
* **Integrações:** API Resend (para notificações via e-mail)

---

## � Como Executar o Projeto

Este projeto é dividido em **Backend** (API) e **Frontend** (Interface Web). Siga os passos abaixo para rodar o ambiente completo localmente.

### 1. Pré-requisitos
Certifique-se de ter as seguintes ferramentas instaladas:
* [Node.js](https://nodejs.org/) (recomendado LTS)
* Gerenciador de pacotes `npm` ou `yarn`

---

### 2. Configuração do Backend

O backend utiliza **SQLite** (banco de dados local em arquivo) e não requer instalação de servidor SQL externo. O banco será inicializado automaticamente através do script `db/database.sql` na primeira execução.

1. Abra o terminal e navegue para a pasta do backend:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Certifique-se de que o arquivo `.env` está presente na raiz da pasta `backend` com as chaves necessárias.
4. Inicie o servidor:
   ```bash
   node src/server.js
   ```

---

### 3. Configuração do Frontend

O frontend foi desenvolvido utilizando React e Vite.

1. Abra um **novo terminal** e navegue para a pasta do frontend:
   ```bash
   cd frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie a interface:
   ```bash
   npm run dev
   ```
4. O terminal fornecerá um link (ex: `http://localhost:5173`). Abra-o no seu navegador.

---

## 👥 Desenvolvedores
* **Matheus Alves de Castro** - Co-fundador da RM Technologies.
* **Rafael Rangel** - Co-fundador da RM Technologies.