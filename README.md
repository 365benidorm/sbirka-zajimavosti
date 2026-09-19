# Sbírka zajímavostí — nasazení

5 souborů, které patří k sobě: `index.html`, `manifest.json`, `sw.js`,
`icon-192.png`, `icon-512.png`. Nahraj je všechny do kořene jednoho
GitHubu repozitáře (stejně jako u appky pro mamku).

## 1) Nahrání na GitHub

1. Na GitHubu vytvoř nový veřejný repozitář (nebo použij existující).
2. **Add file → Upload files**, přetáhni všech 5 souborů, **Commit**.
3. **Settings → Pages** → Source: `Deploy from a branch`, Branch:
   `main` / `root` → **Save**.
4. Po chvíli appka poběží na
   `https://<tvůj-github-login>.github.io/<název-repozitáře>/`

## 2) Instalace na telefonu (Android)

1. Otevři tu adresu v Chromu na telefonu.
2. Menu (⋮) → **Přidat na plochu** / appka sama nabídne tlačítko
   **Nainstalovat**.
3. Otevři appku aspoň jednou po instalaci — teprve pak se zaregistruje
   jako cíl sdílení.

## 3) Sdílení z Instagramu / Facebooku

V Instagramu nebo Facebooku klepni na **Sdílet** u příspěvku/reelu a
v nabídce aplikací by se měla objevit **Sbírka zajímavostí**. Appka
se otevře a odkaz se **uloží automaticky** — žádný formulář, žádné
další klepání. Poznámku k záznamu můžeš kdykoli později dopsat přímo
v záložce Sbírka.

## 4) Aktualizace appky

Service worker je nastavený na "nejdřív síť" — stačí nahrát nové
soubory na GitHub (přepsat je přes **Add file → Upload files**) a
appka se aktualizuje sama při dalším otevření. Není potřeba appku
odinstalovat.

## Důležité o datech

Appka ukládá vše lokálně v prohlížeči telefonu (`localStorage`) —
nic se nesynchronizuje mezi zařízeními ani na server. V appce pod
ikonou ⚙ je **Export zálohy** (stáhne JSON soubor) a **Import
zálohy** — vyplatí se udělat export čas od času, hlavně před větším
úklidem telefonu nebo jeho výměnou.

## Jak appka vypadá

Dvě záložky dole:
- **⬇️ Stáhnout** — jedno pole na odkaz, nepovinná poznámka, tlačítko
  Uložit. Po uložení appka přeskočí na Sbírku, ať vidíš, že se to
  uložilo.
- **🗂️ Sbírka** — seznam všeho uloženého, hledání, poznámku lze
  upravit přímo v kartičce, mazání přes ikonu koše (druhé klepnutí
  potvrdí).

## Co appka (zatím) neumí

- **AI shrnutí přímo v appce** — chybí bezpečné místo, kam uložit
  API klíč (statická stránka na GitHub Pages je veřejně čitelná).
  Řešení: proxy přes Google Apps Script (stejný trik jako u Chuťovky)
  — dej vědět, jestli to chceš přidat.
- **Automatický přepis videa na text** — sdílení přes Android dá
  appce jen odkaz (a případně text, který k němu daná appka přiloží),
  ne zvuk/video samotné. Na přepis řeči by bylo potřeba samostatné
  řešení (např. Whisper API).
