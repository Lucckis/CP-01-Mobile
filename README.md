# App de Notas Pro - React Native (Expo) + Firebase

Este projeto é uma aplicação mobile desenvolvida para a disciplina de Mobile Application Development. Evoluído na **Fase 2**, o app incorpora recursos nativos avançados: suporte a múltiplos idiomas, geolocalização com visualização em mapa, notificações locais e build Android via EAS.

---

## Integrantes

* **Lucas Chicote** - RM559366
* **Lucas Gomes** - RM559607
* **Henrique Marques** - RM560698

---

## Tecnologias Utilizadas

* **Framework:** React Native com Expo
* **Linguagem:** JavaScript/TypeScript
* **Backend as a Service (BaaS):** Firebase
  * **Authentication:** Gestão de utilizadores (E-mail/Senha).
  * **Cloud Firestore:** Base de dados NoSQL para as notas.
* **Internacionalização:** i18next + react-i18next
* **Geolocalização:** expo-location
* **Mapas:** react-native-maps
* **Notificações:** expo-notifications
* **Build:** EAS Build (Expo Application Services)

---

## Configuração do Firebase

A integração entre o Frontend e o Backend foi feita através do SDK de JavaScript do Firebase, configurado como um Web App para total compatibilidade com o ambiente React Native:

```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAtYfF4HOi_YidoCjcaOolKhqokeZtvrac",
  authDomain: "app-notas-64dd1.firebaseapp.com",
  projectId: "app-notas-64dd1",
  storageBucket: "app-notas-64dd1.firebasestorage.app",
  messagingSenderId: "366626800281",
  appId: "1:366626800281:web:e2a56c49b00cc342a46e08",
  measurementId: "G-8C5N1M40WK"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

---

## Funcionalidades do CRUD (Fase 1)

* **Autenticação:** Cadastro, Login e Logout de utilizadores.
* **Criar Nota:** Notas salvas com título, conteúdo e ID do proprietário.
* **Listar:** Exibição filtrada apenas para o utilizador logado.
* **Editar:** Atualização de notas existentes em tempo real.
* **Deletar:** Remoção de notas da base de dados.

---

## Novidades da Fase 2

### 1. Internacionalização (i18n)

O app suporta **Português (PT)** e **Inglês (EN)**. Nenhuma string está fixa no código — toda a interface utiliza chaves de tradução gerenciadas pelo `i18next`.

**Estrutura dos arquivos de tradução:**
```
src/
  locales/
    pt.json   → traduções em Português
    en.json   → traduções em Inglês
  services/
    i18n.ts   → configuração do i18next com idioma padrão PT
```

**Como funciona:**
- O idioma padrão é Português.
- Tanto na tela de **Login** quanto na tela **Home**, o utilizador pode trocar o idioma tocando na bandeira correspondente (🇧🇷 / 🇺🇸).
- A troca é instantânea e afeta toda a interface sem recarregar o app.

```typescript
i18n.use(initReactI18next).init({
  lng: "pt",
  fallbackLng: "en",
  resources: {
    pt: { translation: pt },
    en: { translation: en }
  }
});
```

---

### 2. Geolocalização e Mapas

**Captura automática de localização:**
Ao salvar uma nota, o app solicita a localização atual via `expo-location` e armazena `latitude`, `longitude` e `endereco` no documento da nota no Firestore.

```typescript
let location = await Location.getCurrentPositionAsync({});
const { latitude, longitude } = location.coords;
await salvarNotaUsuario(user.uid, valorNota.trim(), latitude, longitude, enderecoStr);
```

**Estrutura salva no Firestore:**
```json
{
  "valor": "Texto da nota",
  "uid": "user_id",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "endereco": "Av. Paulista, São Paulo",
  "createdAt": "timestamp"
}
```

**Visualização do mapa:**
Cada nota que possui coordenadas exibe um ícone de localização. Ao tocar, abre um modal em tela cheia com `react-native-maps` mostrando um **Pin (Marker)** no local exato onde a nota foi criada.

```javascript
<MapView initialRegion={{ latitude, longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 }}>
  <Marker coordinate={{ latitude, longitude }} title={valor} description={endereco} />
</MapView>
```

**Permissões gerenciadas:**
O app solicita permissão de localização na inicialização e exibe um alerta amigável caso seja negada.

**Permissões declaradas no `app.json`:**
```json
"permissions": [
  "ACCESS_COARSE_LOCATION",
  "ACCESS_FINE_LOCATION"
]
```

---

### 3. Geocoding Reverso

Ao salvar uma nota, o app converte automaticamente as coordenadas em um endereço legível usando `Location.reverseGeocodeAsync`, exibindo a rua e cidade diretamente no card da nota.

```typescript
let reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
let enderecoStr = reverseGeocode[0]
  ? `${reverseGeocode[0].street}, ${reverseGeocode[0].city}`
  : null;
```

---

### 4. Notificações Locais

O app utiliza `expo-notifications` para disparar notificações locais:

| Evento | Notificação |
|---|---|
| Nota criada com sucesso | "Nova Nota Criada!" com o texto da nota no corpo |

**Fluxo:**
1. Na inicialização da tela Home, o app solicita permissão de notificação.
2. Ao salvar uma nota com sucesso, uma notificação local é agendada imediatamente (`trigger: null`).
3. O token de push (Expo Push Token) é gerado e logado para uso futuro com FCM.

```typescript
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

await Notifications.scheduleNotificationAsync({
  content: {
    title: t("notification_new_note_title"),
    body: `${t("notification_new_note_body")} ${notaTexto}`,
  },
  trigger: null,
});
```

**Permissão declarada no `app.json`:**
```json
"permissions": ["POST_NOTIFICATIONS"]
```

---

### 5. Build Android (APK via EAS Build)

O projeto está configurado com **EAS Build** para geração do APK instalável.

**Arquivo `eas.json`:**
```json
{
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview": { "distribution": "internal" },
    "production": { "autoIncrement": true }
  }
}
```

**Comando para gerar o APK:**
```bash
eas build -p android --profile preview
```

> O arquivo `.apk` pode ser instalado no seu celular android

**Download do APK:**
[Baixar APK](https://expo.dev/accounts/lucckis/projects/notasApp/builds/4369bd2a-1da4-4775-b365-92538ef594ad)

---

## Como Executar o Projeto

### 1. Clone o repositório:
```bash
git clone https://github.com/Lucckis/CP-01-Mobile.git
```

### 2. Instale as dependências:
```bash
npm install
npm install firebase
```

### 3. Inicie o servidor do Expo:
```bash
npx expo start
```

### 4. Teste:
Utilize o app **Expo Go** no seu celular ou o emulador android
---

## Vídeo de Demonstração — Fase 1

[![Vídeo de Demonstração Fase 1](https://img.youtube.com/vi/H_acUOMMguc/hqdefault.jpg)](https://youtu.be/H_acUOMMguc?si=dB0bSQlfo3tgjgPC)

## Vídeo de Demonstração — Fase 2

[![Vídeo de Demonstração Fase 2](https://img.youtube.com/vi/wNG7_n6WFAQ/hqdefault.jpg)](https://youtu.be/wNG7_n6WFAQ?si=MOv57QcI8SYSVUXE)
