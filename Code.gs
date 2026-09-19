/**
 * Sbírka zajímavostí — backend (Google Apps Script).
 *
 * Dělá dvě věci, bezpečně na serveru (klíč nikdy nejde do prohlížeče):
 *   1. fetchAndSummarize — zkusí stáhnout stránku na daném odkazu
 *      (UrlFetchApp — přesně ten samý trik jako u Chuťovky) a pokud
 *      se to povede, pošle text na shrnutí do Claude.
 *      U běžných webů/blogů/článků to funguje stejně jako tam.
 *      U Instagramu/Facebooku to ve většině případů selže — ne kvůli
 *      chybě v kódu, ale protože ty servery bez přihlášení nic
 *      nevrátí (stejná zeď, na kterou jsme narazili s odkazy z FB/IG
 *      hned na začátku). V tom případě funkce jen vrátí ok:false,
 *      appka nechá poznámku prázdnou a jde se napsat ručně.
 *   2. summarize — shrne libovolný text, který appka pošle (např.
 *      poznámku, kterou si sám napíšeš nebo nadiktuješ).
 *
 * NASAZENÍ:
 *   1. script.google.com → New project, vlož sem celý obsah.
 *   2. Project Settings (ozubené kolo vlevo) → Script Properties →
 *      Add script property: ANTHROPIC_API_KEY = tvůj klíč.
 *      (Pokud používáš stejný klíč jako u Gmail triage scriptu, je
 *      to jiný projekt, takže property musíš přidat znovu — klíč
 *      sám ale zůstává stejný, pokud ho ještě máš.)
 *   3. Deploy → New deployment → Web app.
 *      Execute as: Me. Who has access: Anyone.
 *   4. Zkopíruj URL, co končí na /exec, a vlož ji v appce pod
 *      "⚙ Nastavit AI shrnutí" na záložce Sbírka.
 */

const MODEL = "claude-sonnet-4-6";
const MAX_PAGE_CHARS = 8000;
const SUMMARY_MAX_TOKENS = 300;

function doGet(e) {
  return jsonResponse({ ok: true, info: "Sbírka zajímavostí — API běží." });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    if (action === "summarize") {
      const text = (body.text || "").trim();
      if (!text) return jsonResponse({ ok: false, reason: "empty_text" });
      const summary = summarizeText(text, body.context || "");
      return jsonResponse({ ok: true, summary: summary });
    }

    if (action === "fetchAndSummarize") {
      const url = (body.url || "").trim();
      if (!url) return jsonResponse({ ok: false, reason: "empty_url" });
      const pageText = fetchPageText(url);
      if (!pageText) return jsonResponse({ ok: false, reason: "fetch_failed" });
      const summary = summarizeText(pageText, url);
      return jsonResponse({ ok: true, summary: summary });
    }

    return jsonResponse({ ok: false, reason: "unknown_action" });
  } catch (err) {
    return jsonResponse({ ok: false, reason: "error", message: String(err) });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Stáhne stránku a vrátí očištěný text, nebo null když se to nepovede
 *  (blok, přihlašovací stěna, 4xx/5xx, prázdný obsah). */
function fetchPageText(url) {
  try {
    const resp = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true,
      validateHttpsCertificates: true,
    });
    const code = resp.getResponseCode();
    if (code >= 400) return null;

    let html = resp.getContentText();
    html = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ");
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

    if (!text || text.length < 60) return null;
    return text.slice(0, MAX_PAGE_CHARS);
  } catch (err) {
    return null;
  }
}

function summarizeText(text, context) {
  const apiKey = PropertiesService.getScriptProperties().getProperty("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("Chybí ANTHROPIC_API_KEY ve Script Properties.");

  const prompt =
    "Shrň následující obsah do 2–3 stručných vět v češtině. Piš věcně, " +
    "bez úvodních frází a bez opakování zdroje.\n\n" +
    (context ? "Zdroj: " + context + "\n\n" : "") +
    text;

  const resp = UrlFetchApp.fetch("https://api.anthropic.com/v1/messages", {
    method: "post",
    contentType: "application/json",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    payload: JSON.stringify({
      model: MODEL,
      max_tokens: SUMMARY_MAX_TOKENS,
      messages: [{ role: "user", content: prompt }],
    }),
    muteHttpExceptions: true,
  });

  const data = JSON.parse(resp.getContentText());
  if (data && data.content && data.content[0] && data.content[0].text) {
    return data.content[0].text.trim();
  }
  throw new Error("Neočekávaná odpověď AI: " + resp.getContentText().slice(0, 300));
}
