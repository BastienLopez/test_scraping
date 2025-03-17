require("dotenv").config();
const puppeteer = require("puppeteer");

const LBC_URL = "https://www.leboncoin.fr/recherche?category=43&text=manette%20PS5";

async function scrapeLeBonCoin() {
    const browser = await puppeteer.launch({
        headless: false, // Mode visible pour éviter d'être détecté
        slowMo: 50, // Ralentir les actions pour un comportement humain
        args: process.env.PROXY ? [`--proxy-server=${process.env.PROXY}`] : []
    });

    const page = await browser.newPage();

    // 🔄 Changer User-Agent pour éviter d’être détecté
    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36"
    );

    console.log("🔍 Navigation vers LeBonCoin...");
    await page.goto(LBC_URL, { waitUntil: "networkidle2" });

    console.log("📌 Scraping des annonces...");
    await page.waitForSelector("a[data-qa-id='aditem_container']");

    const results = await page.evaluate(() => {
        const ads = Array.from(document.querySelectorAll("a[data-qa-id='aditem_container']")).slice(0, 10);
        return ads.map(ad => ({
            title: ad.querySelector("p[data-qa-id='aditem_title']").innerText.trim(),
            price: ad.querySelector("p[data-qa-id='aditem_price']").innerText.trim(),
            location: ad.querySelector("p[data-qa-id='aditem_location']").innerText.trim(),
            link: ad.href
        }));
    });

    console.log("✅ Annonces récupérées !");
    console.table(results);

    // 🔑 Connexion à LeBonCoin
    console.log("🔑 Connexion à LeBonCoin...");
    await page.goto("https://www.leboncoin.fr/account/login", { waitUntil: "networkidle2" });

    await page.type("input[name='st_email']", process.env.LBC_EMAIL);
    await page.type("input[name='st_pass']", process.env.LBC_PASSWORD);

    // 🔄 Simulation d'un mouvement de souris
    await page.mouse.move(Math.random() * 800, Math.random() * 600);
    await page.waitForTimeout(Math.floor(Math.random() * 2000) + 500); // Délai aléatoire

    await page.click("button[type='submit']");
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    console.log("📨 Envoi des messages aux vendeurs...");

    for (let i = 0; i < results.length; i++) {
        console.log(`✉️ Envoi du message pour l'annonce : ${results[i].title}`);
        await page.goto(results[i].link, { waitUntil: "networkidle2" });

        try {
            await page.waitForSelector("button[data-qa-id='adview_contact_button']", { timeout: 5000 });

            // 🔄 Déplacer la souris de manière aléatoire
            await page.mouse.move(Math.random() * 800, Math.random() * 600);
            await page.waitForTimeout(Math.floor(Math.random() * 2000) + 500); // Délai aléatoire

            await page.click("button[data-qa-id='adview_contact_button']");
            
            await page.waitForSelector("textarea[name='body']");
            await page.type("textarea[name='body']", "Bonjour, votre manette est-elle toujours disponible ?");
            
            await page.click("button[data-qa-id='send_message_button']");
            console.log("✅ Message envoyé !");
            await page.waitForTimeout(3000);
        } catch (error) {
            console.log("❌ Impossible d'envoyer le message pour cette annonce.");
        }
    }

    await browser.close();
    console.log("✅ Script terminé !");
}

scrapeLeBonCoin();
