# App de Notas - React Native (Expo) + Firebase com Firestore

Este projeto é uma aplicação mobile desenvolvida para a disciplina de Mobile Application Development. O objetivo é permitir que os utilizadores façam a gestão das suas notas pessoais com autenticação segura e armazenamento de dados em tempo real.

---

##  Integrantes
* **Lucas Chicote** - RM559366
* **Lucas Gomes** - RM559607
* **Henrique Marques** - RM560698
  
---

##  Tecnologias Utilizadas
* **Framework:** React Native com Expo
* **Linguagem:** JavaScript/TypeScript
* **Backend as a Service (BaaS):** Firebase
  * **Authentication:** Gestão de utilizadores (E-mail/Senha).
  * **Cloud Firestore:** Base de dados NoSQL para as notas.

---

##  Configuração do Firebase (`firebaseConfig.js`)

A integração entre o Frontend e o Backend foi feita através do SDK de JavaScript do Firebase, configurado como um Web App para total compatibilidade com o ambiente React Native:

```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configurações do projeto obtidas no Console do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAtYfF4HOi_YidoCjcaOolKhqokeZtvrac",
  authDomain: "app-notas-64dd1.firebaseapp.com",
  projectId: "app-notas-64dd1",
  storageBucket: "app-notas-64dd1.firebasestorage.app",
  messagingSenderId: "366626800281",
  appId: "1:366626800281:web:e2a56c49b00cc342a46e08",
  measurementId: "G-8C5N1M40WK"
};

// Inicialização do Firebase e exportação dos módulos
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

## Funcionalidades do CRUD

* Autenticação: Cadastro, Login e Logout de utilizadores.
* Criar Nota: Notas salvas com título, conteúdo e ID do proprietário.
* Listar: Exibição filtrada apenas para o utilizador logado.
* Editar: Atualização de notas existentes em tempo real.
* Deletar: Remoção de notas da base de dados.

# Como Executar o Projeto

## 1. Clone o repositório:

```
git clone https://github.com/Lucckis/CP-01-Mobile.git
```

## 2. Instale as dependências:
```
npm install
npm install firebase
```
## 3. Inicie o servidor do Expo:
```
npx expo start
```
## 4. Teste: Utilize o app Expo Go no telemóvel para ler o QR Code gerado no terminal ou use um emulador no seu computador ou pelo próprio terminal selecionando a tecla 'a'



---

# Vídeo de Demonstração
[![Vídeo de Demonstração](https://img.youtube.com/vi/H_acUOMMguc/hqdefault.jpg)](https://youtu.be/H_acUOMMguc?si=dB0bSQlfo3tgjgPC)
