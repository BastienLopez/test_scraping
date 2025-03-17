```md
# 🕵️ Scraper LeBonCoin - Manettes PS5 🎮

Ce projet permet de **scraper les 10 dernières annonces** de manettes **PS5** sur **LeBonCoin** et d'**envoyer automatiquement un message aux vendeurs** pour vérifier la disponibilité.

---

## 🚀 Installation

### 1️⃣ **Cloner le projet**
```sh
git clone https://github.com/ton-repo/scraping-leboncoin.git
cd scraping-leboncoin
```

### 2️⃣ **Installer les dépendances**
```sh
npm install
```

### 3️⃣ **Installer Playwright et les navigateurs**
```sh
npx playwright install
```
Si tu veux **installer uniquement Chromium**, utilise :
```sh
npx playwright install chromium
```

### 4️⃣ **Configurer les identifiants LeBonCoin (optionnel)**
Si tu veux **envoyer des messages aux vendeurs**, crée un fichier **`.env`** à la racine du projet :
```sh
touch .env
```
Ajoute dedans :
```
LBC_EMAIL=ton.email@example.com
LBC_PASSWORD=tonMotDePasse
```

---

## 🚀 Utilisation

### 🔍 **1. Lancer le scraper**
```sh
node server.js
```
Cela va :
- **Scraper les annonces** 📦
- **Afficher les résultats sur `http://localhost:3000`** 🖥️
- **Envoyer un message aux vendeurs (si identifiants présents)** 📩

### 🌐 **2. Voir les annonces**
Ouvre **`http://localhost:3000`** dans ton navigateur pour voir la liste des annonces.

---

## ⚙️ Technologies utilisées
- **[Node.js](https://nodejs.org/)**
- **[Playwright](https://playwright.dev/)**
- **[Express.js](https://expressjs.com/)**
- **[Dotenv](https://www.npmjs.com/package/dotenv)**
