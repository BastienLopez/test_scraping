require("dotenv").config();
const { chromium } = require("playwright");
const express = require("express");
const fs = require("fs");

const app = express();
const PORT = 3000;
const LBC_URL = "https://www.leboncoin.fr/recherche?category=43&text=manette%20PS5";
const COOKIES_FILE = "cookies.json"; // Fichier pour sauvegarder les cookies

let annonces = [];

// Fonction pour ajouter un délai aléatoire entre les actions
async function delay(min, max) {
    const time = Math.floor(Math.random() * (max - min + 1) + min);
    console.log(`⏳ Pause de ${time}ms...`);
    return new Promise(resolve => setTimeout(resolve, time));
}

// 🔍 Fonction pour scraper LeBonCoin
async function scrapeLeBonCoin() {
    const browser = await chromium.launch({ headless: false }); // Mode visible pour voir si ça fonctionne
    const context = await browser.newContext({
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    });

    // ✅ Charger les cookies existants
    if (fs.existsSync(COOKIES_FILE)) {
        const cookies = JSON.parse(fs.readFileSync(COOKIES_FILE, "utf8"));
        await context.addCookies(cookies);
    }

    const page = await context.newPage();
    console.log("🔍 Scraping des annonces...");
    await page.goto(LBC_URL, { waitUntil: "domcontentloaded" });

    try {
        await page.waitForSelector("a[data-qa-id='aditem_container']", { timeout: 60000 });

        annonces = await page.evaluate(() => {
            return Array.from(document.querySelectorAll("a[data-qa-id='aditem_container']"))
                .slice(0, 10)
                .map(ad => ({
                    title: ad.querySelector("p[data-qa-id='aditem_title']").innerText.trim(),
                    link: ad.href
                }));
        });

        console.log("✅ Annonces récupérées !");
    } catch (error) {
        console.log("❌ Erreur : Impossible de récupérer les annonces.");
    }

    // ✅ Sauvegarde des cookies après exécution
    const cookies = await context.cookies();
    fs.writeFileSync(COOKIES_FILE, JSON.stringify(cookies));

    await browser.close();
}

// 📩 Fonction pour envoyer un message aux vendeurs
async function sendMessages() {
    if (!process.env.LBC_EMAIL || !process.env.LBC_PASSWORD) {
        console.log("⚠️ Identifiants absents. Envoi de messages désactivé.");
        return;
    }

    const browser = await chromium.launch({ headless: false }); // Mode visible pour tester l'envoi des messages
    const context = await browser.newContext({
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    });

    // ✅ Charger les cookies si disponibles
    if (fs.existsSync(COOKIES_FILE)) {
        const cookies = JSON.parse(fs.readFileSync(COOKIES_FILE, "utf8"));
        await context.addCookies(cookies);
    }

    const page = await context.newPage();

    console.log("🔑 Connexion à LeBonCoin...");
    try {
        await page.goto("https://www.leboncoin.fr/account/login", { waitUntil: "domcontentloaded" });

        await page.fill("input[name='st_email']", process.env.LBC_EMAIL);
        await page.fill("input[name='st_pass']", process.env.LBC_PASSWORD);
        await page.click("button[type='submit']");
        await delay(2000, 5000); // Pause après la connexion
        await page.waitForNavigation({ waitUntil: "domcontentloaded" });

        console.log("✅ Connexion réussie !");
    } catch (error) {
        console.log("❌ Erreur de connexion à LeBonCoin !");
        return;
    }

    console.log("📨 Envoi des messages aux vendeurs...");
    for (const annonce of annonces) {
        console.log(`✉️ Envoi d'un message pour ${annonce.title}`);

        try {
            await page.goto(annonce.link, { waitUntil: "domcontentloaded" });
            await delay(2000, 5000);
            await page.waitForSelector("button[data-qa-id='adview_contact_button']", { timeout: 5000 });
            await page.click("button[data-qa-id='adview_contact_button']");
            await delay(1000, 3000);
            await page.waitForSelector("textarea[name='body']");
            await page.fill("textarea[name='body']", "Bonjour, votre manette est-elle toujours disponible ?");
            await delay(1000, 3000);
            await page.click("button[data-qa-id='send_message_button']");
            console.log("✅ Message envoyé !");
        } catch (error) {
            console.log("❌ Impossible d'envoyer un message pour cette annonce.");
        }
    }

    // ✅ Sauvegarde des cookies après exécution
    const cookies = await context.cookies();
    fs.writeFileSync(COOKIES_FILE, JSON.stringify(cookies));

    await browser.close();
}

// 🌐 Route pour afficher les annonces
app.get("/", async (req, res) => {
    if (annonces.length === 0) {
        await scrapeLeBonCoin();
    }

    let html = "<h1>Dernières annonces de manettes PS5</h1><ul>";
    annonces.forEach(ad => {
        html += `<li><a href="${ad.link}" target="_blank">${ad.title}</a></li>`;
    });
    html += "</ul>";

    res.send(html);
});

// 🚀 Lancer le serveur
app.listen(PORT, async () => {
    console.log(`🌍 Serveur web sur http://localhost:${PORT}`);
    await scrapeLeBonCoin();

    if (process.env.LBC_EMAIL && process.env.LBC_PASSWORD) {
        await sendMessages();
    } else {
        console.log("⚠️ Identifiants absents. Seul le scraping est effectué.");
    }
});
