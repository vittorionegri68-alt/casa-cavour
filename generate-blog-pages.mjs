// ─────────────────────────────────────────────────────────────────────────────
// generate-blog-pages.mjs
//
// Genera una pagina HTML statica per ciascun articolo attivo del blog (letti da
// src/posts.jsx) e la salva in public/post/{slug}.html. Ogni pagina è un URL
// individuale, condivisibile e citabile, con link alla home, link interni verso
// altri articoli (quando presenti nel contenuto) e un CTA verso il profilo
// Instagram @bnb_bertinoro.
//
// Perché esiste: il blog è renderizzato solo lato client (React, stato
// "aperto" in App.jsx), quindi oggi nessun articolo ha un indirizzo proprio.
// generate-blog-noscript.mjs risolve la leggibilità del testo per i crawler
// senza JS sull'unico URL della home, ma non risolve condivisibilità né link
// interni tra articoli: per questo serve un URL dedicato per articolo.
//
// Si esegue automaticamente ad ogni build (vedi package.json: "build"), quindi
// resta sempre sincronizzato con posts.jsx, sia per gli articoli esistenti che
// per ogni nuovo articolo pubblicato in futuro. Non richiede alcun passo
// manuale aggiuntivo.
//
// Nota sullo slug: l'id di un articolo in posts.jsx è pensato come chiave
// interna per React (stato "aperto"), non come URL pubblico. Per questo lo
// slug del file viene derivato con normalizzazione (minuscolo, spazi/accenti
// rimossi), invece di usare l'id grezzo: un id non conforme come
// "Aprile in Romagna" produrrebbe altrimenti un URL non valido
// (/post/Aprile in Romagna.html). Il campo id originale non viene toccato.
//
// Link interni tra articoli: dentro il campo "testo" di un blocco paragrafo
// in posts.jsx, la sintassi [[etichetta visibile|id-articolo-target]] genera
// un link <a> verso la pagina statica dell'articolo target, sempre con
// target="_blank" (si apre in una nuova scheda). L'id è quello grezzo del
// post (lo stesso usato come chiave "id" in posts.jsx), non lo slug: se
// l'id punta a un articolo inesistente o non attivo, la build fallisce con
// un errore esplicito invece di generare un link rotto in silenzio. La stessa
// sintassi è interpretata anche dal rendering React live (src/App.jsx,
// funzione renderTestoConLink), così i link interni compaiono in modo
// identico sia sulle pagine statiche /post/ sia nel blog dal vivo. Il
// noscript per crawler (generate-blog-noscript.mjs) non la interpreta
// ancora: mostrerebbe il markup grezzo se qualcuno lo aprisse a mano, ma non
// è un problema per i motori di ricerca, che leggono solo il testo.
//
// Sezione "Leggi anche": il link generico verso #blog che posts.jsx mette
// dopo il paragrafo "Leggi anche" viene sostituito con un link per ciascun
// articolo che il post cita come link interno nel proprio testo (fino a 3),
// etichettato con il titolo reale dell'articolo target. Se il post non cita
// nessun altro articolo, resta il bottone generico verso #blog. Vedi
// estraiIdCorrelati() e buildContenuto().
// v3 (19/11/2026): hreflang sulle pagine articolo e nella sitemap, tramite la
// mappa ALTERNATES dello standard references/blog-geo.md v1.3. La
// corrispondenza tra gli id delle tre lingue e' stata ricavata dalla data di
// pubblicazione, identica nelle tre lingue, e verificata titolo per titolo.
//
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, copyFileSync, unlinkSync, mkdirSync, readdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const POSTS_PATH = join(ROOT, "src", "posts.jsx");
const OUT_DIR = join(ROOT, "public", "post");

const SITE_URL = "https://www.casa-cavour.com";

const LANG = "it";

// Siti multilingua: lo stesso articolo negli altri repo lingua.
// sites: lingua -> dominio. posts: id di questo repo -> { lingua: id altrove }.
// Standard references/blog-geo.md v1.3 della skill master-website-generator.
const ALTERNATES = {
  xDefault: "it",
  sites: {
    it: "https://www.casa-cavour.com",
    en: "https://en.casa-cavour.com",
    nl: "https://nl.casa-cavour.com",
  },
  posts: {
      "geo-aeo-enoturismo-romagna-dove-dormire-2026": {
          "en": "geo-aeo-wine-tourism-romagna-where-stay-2026-en",
          "nl": "geo-aeo-wijntoerisme-romagna-verblijf-2026-nl"
      },
      "geo-aeo-weekend-vendemmia-romagna-2026": {
          "en": "geo-aeo-weekend-vendemmia-romagna-2026-en",
          "nl": "geo-aeo-oogstweekend-romagna-2026-nl"
      },
      "geo-aeo-ricaricare-energie-romagna-2026": {
          "en": "geo-aeo-recharge-romagna-2026-en",
          "nl": "geo-aeo-opladen-romagna-2026-nl"
      },
      "geo-aeo-alloggiare-colline-romagnole-2026": {
          "en": "geo-aeo-where-to-stay-romagna-hills-2026-en",
          "nl": "geo-aeo-verblijven-heuvels-romagna-2026-nl"
      },
      "geo-aeo-smart-working-romagna-2026": {
          "en": "geo-aeo-smart-working-romagna-2026-en",
          "nl": "geo-aeo-smart-working-romagna-2026-nl"
      },
      "geo-aeo-giardino-privato-colline-romagnole-2026": {
          "en": "geo-aeo-private-garden-romagna-hills-2026-en",
          "nl": "geo-aeo-privetuin-heuvels-romagna-2026-nl"
      },
      "geo-aeo-dormire-romagna-animali-ammessi-2026": {
          "en": "geo-aeo-pet-friendly-romagna-accommodation-2026-en",
          "nl": "geo-aeo-huisdiervriendelijk-romagna-2026-nl"
      },
      "geo-aeo-cosa-fare-bertinoro-weekend-2026": {
          "en": "geo-aeo-what-to-do-bertinoro-weekend-2026-en",
          "nl": "geo-aeo-wat-te-doen-bertinoro-weekend-2026-nl"
      },
      "geo-aeo-weekend-romantico-colline-romagnole-2026": {
          "en": "geo-aeo-romantic-weekend-romagna-hills-2026-en",
          "nl": "geo-aeo-romantisch-weekend-romagna-heuvels-2026-nl"
      },
      "geo-aeo-staccare-routine-bologna-2026": {
          "en": "geo-aeo-escape-routine-bologna-2026-en",
          "nl": "geo-aeo-ontsnappen-routine-bologna-2026-nl"
      },
      "geo-aeo-dormire-visitare-cantine-romagna-2026": {
          "en": "geo-aeo-stay-visit-wineries-romagna-2025-en",
          "nl": "geo-aeo-verblijven-bezoek-wijnhuizen-romagna-2025-nl"
      },
      "geo-aeo-dove-dormire-forli-cesena-2025": {
          "en": "geo-aeo-where-stay-forli-cesena-2025-en",
          "nl": "geo-aeo-waar-overnachten-forli-cesena-2025-nl"
      },
      "5-cose-da-fare-bertinoro": {
          "en": "5-things-to-do-bertinoro",
          "nl": "5-dingen-bertinoro-weekend"
      },
      "affitti-brevi-romagna-cosa-vedere": {
          "en": "short-rentals-romagna-what-to-see",
          "nl": "korte-verhuur-romagna-wat-te-zien"
      },
      "bertinoro-weekend-romantico": {
          "en": "bertinoro-romantic-weekend",
          "nl": "bertinoro-romantisch-weekend"
      },
      "geo-aeo-costi-affitto-breve-romagna-2026": {
          "en": "geo-aeo-costi-affitto-breve-romagna-2026-en",
          "nl": "geo-aeo-kosten-vakantiewoning-romagna-2026-nl"
      },
      "geo-aeo-appartamento-vs-hotel-romagna-2026": {
          "en": "geo-aeo-apartment-vs-hotel-romagna-2026-en",
          "nl": "geo-aeo-appartement-vs-hotel-romagna-2026-nl"
      },
      "giro-italia-bertinoro-2027": {
          "en": "giro-italia-bertinoro-2027-en",
          "nl": "giro-italia-bertinoro-2027-nl"
      }
  },
};

// Tracciamento GA4: copiato da index.html (dal tag gtag fino a "<!-- /tracciamento GA4 -->"),
// così le pagine /post/ registrano visite, referral AI e download con la stessa configurazione della home.
function readGaTracking() {
  const html = readFileSync(join(ROOT, "index.html"), "utf8");
  const start = html.indexOf('<script async src="https://www.googletagmanager.com/gtag/js');
  const END_MARKER = "<!-- /tracciamento GA4 -->";
  const end = html.indexOf(END_MARKER);
  if (start === -1 || end === -1 || end < start) {
    throw new Error("generate-blog-pages: blocco di tracciamento GA4 non trovato in index.html");
  }
  return html.slice(start, end + END_MARKER.length);
}
const GA_TRACKING = readGaTracking();
const INSTAGRAM_URL = "https://www.instagram.com/bnb_bertinoro/";
const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61577458010505";

function isSocialBlock(b) {
  if (b.tipo === "titoletto" && b.testo.trim().toLowerCase() === "seguici sui social") return true;
  if (b.tipo === "link" && (b.testo.includes("instagram.com") || b.testo.includes("facebook.com"))) return true;
  return false;
}

function isBlogHomeLink(b) {
  return b.tipo === "link" && b.testo.includes("casa-cavour.com/#blog");
}

// I link "Leggi anche" (1-2 per articolo, verso articoli realmente correlati,
// con etichetta breve sull'argomento trattato) sono ora scritti a mano
// direttamente in posts.jsx, subito dopo il paragrafo "Leggi anche". Questo
// script non li genera più automaticamente: li lascia passare così come sono,
// identici sia qui che nel rendering React live, perché vivono nel contenuto
// condiviso invece che in una trasformazione separata per ciascuna superficie.
//
// L'unico intervento di questa funzione è una rete di sicurezza: se un
// articolo (oggi o in futuro) non ha nessun link dopo "Leggi anche" — perché
// non esiste ancora una correlazione sensata da scrivere a mano — viene
// inserito un singolo bottone "Tutti gli articoli" verso #blog, con la stessa
// etichetta del bottone "← Tutti gli articoli" già usato nel blog live quando
// si chiude un articolo aperto. Meglio un rimando alla lista completa che
// nessun rimando. Qualunque link verso #blog scritto per errore altrove nel
// contenuto viene comunque rimosso, per evitare doppioni con questo fallback.
const FALLBACK_TUTTI_GLI_ARTICOLI = { tipo: "link", testo: `${SITE_URL}/#blog`, etichetta: "Tutti gli articoli" };

function buildContenuto(post) {
  const filtered = post.contenuto.filter((b) => !isSocialBlock(b) && !isBlogHomeLink(b));

  const idx = filtered.findIndex((b) => b.tipo === "titoletto" && b.testo.trim().toLowerCase() === "leggi anche");
  if (idx === -1) {
    // Nessuna sezione "Leggi anche": non se ne inventa una qui, si segue lo
    // stesso fallback in coda al contenuto.
    filtered.push(FALLBACK_TUTTI_GLI_ARTICOLI);
    return filtered;
  }
  let cursor = idx + 1;
  if (filtered[cursor] && filtered[cursor].tipo === "paragrafo") cursor++;
  const haLinkCorrelati = filtered[cursor] && filtered[cursor].tipo === "link";
  if (!haLinkCorrelati) {
    filtered.splice(cursor, 0, FALLBACK_TUTTI_GLI_ARTICOLI);
  }
  return filtered;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(str) {
  return escapeHtml(str);
}

// Sintassi per i link interni tra articoli, usata dentro il campo "testo" dei
// blocchi paragrafo in posts.jsx: [[etichetta visibile|id-articolo-target]].
// L'id è quello grezzo del post in posts.jsx (non lo slug), così il riferimento
// resta leggibile e stabile anche se lo slug cambia forma in futuro. idToSlug
// viene costruito in main() dopo l'assegnazione degli slug a tutti gli articoli
// attivi, e passato a valle fino a questa funzione.
const INTERNAL_LINK_RE = /\[\[([^\]|]+)\|([^\]]+)\]\]/g;

function renderParagraphWithLinks(testo, idToSlug) {
  let result = "";
  let lastIndex = 0;
  let match;
  INTERNAL_LINK_RE.lastIndex = 0;
  while ((match = INTERNAL_LINK_RE.exec(testo)) !== null) {
    const [full, label, targetId] = match;
    result += escapeHtml(testo.slice(lastIndex, match.index));
    const slug = idToSlug.get(targetId);
    if (!slug) {
      throw new Error(
        `generate-blog-pages: link interno verso id "${targetId}" non trovato tra gli articoli attivi (etichetta: "${label}"). Correggere l'id in posts.jsx.`
      );
    }
    const href = `${SITE_URL}/post/${slug}.html`;
    result += `<a class="inline-link" href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
    lastIndex = INTERNAL_LINK_RE.lastIndex;
  }
  result += escapeHtml(testo.slice(lastIndex));
  return result;
}

function slugify(id) {
  return String(id)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // rimuove accenti
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("it-IT", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return iso;
  }
}

async function loadPosts() {
  // posts.jsx non contiene sintassi JSX (solo oggetti JS), quindi può essere
  // importato come modulo ES puro: basta una copia temporanea con estensione .mjs.
  // Stesso approccio di generate-blog-noscript.mjs, per coerenza.
  const tmpPath = join(ROOT, "src", `_posts-tmp-pages-${Date.now()}.mjs`);
  copyFileSync(POSTS_PATH, tmpPath);
  try {
    const mod = await import(pathToFileURL(tmpPath).href);
    return mod.posts;
  } finally {
    unlinkSync(tmpPath);
  }
}

function renderContentBlock(b, idToSlug) {
  if (b.tipo === "paragrafo") {
    return `      <p>${renderParagraphWithLinks(b.testo, idToSlug)}</p>`;
  }
  if (b.tipo === "titoletto") {
    return `      <h2>${escapeHtml(b.testo)}</h2>`;
  }
  if (b.tipo === "link") {
    const isInstagram = b.testo.includes("instagram");
    const isFacebook = b.testo.includes("facebook");
    const label = b.etichetta ? b.etichetta : isInstagram ? "Instagram" : isFacebook ? "Facebook" : b.testo;
    return `      <p><a class="btn-link" href="${escapeAttr(b.testo)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)} ↗</a></p>`;
  }
  if (b.tipo === "download") {
    const parts = [];
    if (b.src1) parts.push(`<a class="btn-link" href="${escapeAttr(b.src1)}" download>↓ ${escapeHtml(b.label1 || "Scarica")}</a>`);
    if (b.src2) parts.push(`<a class="btn-link" href="${escapeAttr(b.src2)}" download>↓ ${escapeHtml(b.label2 || "Scarica")}</a>`);
    return `      <p>${parts.join(" ")}</p>`;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Lunghezza di <title> e meta description (aggiunto 18/11/2026).
//
// Bing Webmaster Tools segnalava "Title too long" su 18 pagine su 19 per sito
// (fino a 150 caratteri) e "Meta Description too long or too short" su quasi
// tutte (fino a 378 caratteri). Qui si accorcia solo quello che finisce nel
// <head>: il titolo visibile (<h1>), il sommario a inizio articolo, i tag
// og:title e twitter:title e la descrizione nel JSON-LD restano interi.
//
// Titolo: si tiene la parte prima dei due punti, quando c'e' ed e' abbastanza
// lunga da reggersi da sola, poi si aggiunge il marchio nella forma lunga se
// ci sta e in quella corta altrimenti.
// Description: si prendono quante frasi intere stanno nel limite; se la prima
// frase e' gia' troppo lunga si taglia all'ultima parola e si mettono i
// puntini. In entrambi i casi non resta mai una preposizione o un articolo
// appeso in fondo.
// ─────────────────────────────────────────────────────────────────────────────
const LIMITE_TITLE = 65;
const LIMITE_DESC = 155;
const BRAND_LUNGO = " | Casa Cavour Bertinoro";
const BRAND_CORTO = " | Casa Cavour";

// Parole di servizio delle tre lingue: nessuna deve restare in coda a un testo
// troncato. L'elenco e' unico per i tre siti di proposito, cosi' resta identico
// in tutti e tre i repo e si aggiorna in un posto solo.
const PAROLE_DI_CODA = new Set([
  "a", "ad", "al", "allo", "alla", "ai", "agli", "alle", "con", "da", "dal", "dallo", "dalla",
  "dai", "dagli", "dalle", "di", "del", "dello", "della", "dei", "degli", "delle", "e", "ed",
  "fra", "il", "in", "la", "le", "lo", "nei", "nel", "nella", "nelle", "nello", "negli", "o",
  "per", "su", "sul", "sulla", "sulle", "sui", "tra", "un", "una", "uno",
  "and", "at", "by", "for", "from", "of", "on", "or", "the", "to", "with", "your",
  "aan", "bij", "de", "een", "en", "het", "met", "naar", "om", "op", "over", "te", "van", "voor",
]);

function togliCodaDebole(testo) {
  const parole = testo.split(" ");
  while (parole.length > 3 && PAROLE_DI_CODA.has(parole[parole.length - 1].toLowerCase().replace(/[.,;:]$/, ""))) {
    parole.pop();
  }
  return parole.join(" ").replace(/[\s,;:.–-]+$/, "");
}

function titoloBreve(titolo) {
  let base = titolo.trim();
  const duePunti = base.indexOf(":");
  if (duePunti > 14) base = base.slice(0, duePunti).trim();

  if ((base + BRAND_CORTO).length > LIMITE_TITLE) {
    const max = LIMITE_TITLE - BRAND_CORTO.length;
    let taglio = base.slice(0, max);
    const spazio = taglio.lastIndexOf(" ");
    if (spazio > 20) taglio = taglio.slice(0, spazio);
    base = togliCodaDebole(taglio);
  }

  return (base + BRAND_LUNGO).length <= LIMITE_TITLE ? base + BRAND_LUNGO : base + BRAND_CORTO;
}

function descrizioneBreve(sommario) {
  const s = sommario.trim().replace(/\s+/g, " ");
  if (s.length <= LIMITE_DESC) return s;

  const frasi = s.match(/[^.!?]+[.!?]+(\s|$)/g);
  if (frasi) {
    let acc = "";
    for (const f of frasi) {
      if ((acc + f).trim().length > LIMITE_DESC) break;
      acc += f;
    }
    acc = acc.trim();
    if (acc.length >= 70) return acc;
  }

  const taglio = s.slice(0, LIMITE_DESC - 3);
  const spazio = taglio.lastIndexOf(" ");
  return togliCodaDebole(taglio.slice(0, spazio)) + "...";
}

// Coppie [lingua, url] dello stesso articolo: questa lingua, le altre, x-default.
// Array vuoto se l'articolo non ha equivalenti dichiarati in ALTERNATES.
function alternatesFor(post, url) {
  const map = ALTERNATES.posts[post.id];
  if (!map) return [];
  const pairs = [[LANG, url]];
  for (const [lang, altId] of Object.entries(map)) {
    const site = ALTERNATES.sites[lang];
    if (!site) throw new Error(`generate-blog-pages: ALTERNATES.sites non ha il dominio della lingua "${lang}" (articolo "${post.id}").`);
    pairs.push([lang, `${site}/post/${slugify(altId)}.html`]);
  }
  const xDefault = pairs.find(([l]) => l === ALTERNATES.xDefault);
  if (xDefault) pairs.push(["x-default", xDefault[1]]);
  return pairs;
}

function renderAlternates(post, url) {
  return alternatesFor(post, url)
    .map(([l, h]) => `    <link rel="alternate" hreflang="${l}" href="${escapeAttr(h)}" />`)
    .join("\n");
}

function renderPage(post, idToSlug, idToPost) {
  const slug = post.slug;
  const url = `${SITE_URL}/post/${slug}.html`;
  const title = titoloBreve(post.titolo);
  const description = descrizioneBreve(post.sommario);
  const dateIso = new Date(post.data).toISOString();
  const alternates = renderAlternates(post, url);

  const bodyBlocks = buildContenuto(post, idToSlug, idToPost)
    .map((b) => renderContentBlock(b, idToSlug))
    .filter(Boolean)
    .join("\n");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.titolo,
    "description": post.sommario,
    "datePublished": post.data,
    "dateModified": post.data,
    "url": url,
    "mainEntityOfPage": { "@type": "WebPage", "@id": url },
    "author": { "@type": "Organization", "name": "Casa Cavour Bertinoro" },
    "publisher": {
      "@type": "Organization",
      "name": "Casa Cavour Bertinoro",
      "url": SITE_URL,
    },
  };

  return `<!doctype html>
<html lang="it">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeAttr(description)}" />
    <link rel="canonical" href="${escapeAttr(url)}" />${alternates ? `\n${alternates}` : ""}

    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeAttr(post.titolo)}" />
    <meta property="og:description" content="${escapeAttr(description)}" />
    <meta property="og:url" content="${escapeAttr(url)}" />
    <meta property="og:site_name" content="Casa Cavour Bertinoro" />
    <meta property="article:published_time" content="${dateIso}" />

    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${escapeAttr(post.titolo)}" />
    <meta name="twitter:description" content="${escapeAttr(description)}" />

    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>

    <style>
      :root { --gold:#a0782a; --text:#1a1612; --textMid:#5a5248; --textSoft:#9a9088; --bg:#faf8f4; --border:rgba(160,120,42,0.18); }
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      body{background:var(--bg);color:var(--text);font-family:'DM Sans',Arial,sans-serif;line-height:1.75;-webkit-font-smoothing:antialiased;}
      .wrap{max-width:720px;margin:0 auto;padding:3rem 1.5rem 5rem;}
      .top-nav{font-size:0.78rem;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:2.5rem;display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap;}
      .top-nav a{color:var(--gold);text-decoration:none;font-weight:700;}
      .share-btn{background:none;border:1px solid var(--border);color:var(--textMid);font-family:inherit;font-size:0.72rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:0.45rem 1rem;cursor:pointer;}
      .share-btn:hover{border-color:var(--gold);color:var(--gold);}
      .cat{display:inline-block;font-size:0.68rem;letter-spacing:0.16em;color:var(--gold);text-transform:uppercase;border:1px solid var(--border);padding:0.2rem 0.6rem;margin-right:0.75rem;}
      time{font-size:0.75rem;color:var(--textSoft);}
      h1{font-family:Georgia,serif;font-size:clamp(1.7rem,4vw,2.6rem);line-height:1.15;margin:1rem 0;}
      .sommario{font-family:Georgia,serif;font-style:italic;color:var(--gold);font-size:1.05rem;margin-bottom:2rem;padding-bottom:2rem;border-bottom:1px solid var(--border);}
      h2{font-family:Georgia,serif;font-size:1.35rem;margin:2rem 0 0.6rem;}
      p{color:var(--textMid);font-size:0.98rem;margin-bottom:1.1rem;}
      .btn-link{display:inline-block;color:var(--gold);border:1.5px solid var(--gold);padding:0.55rem 1.1rem;font-size:0.78rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;margin:0.25rem 0.5rem 0.25rem 0;}
      .inline-link{color:var(--gold);text-decoration:underline;text-decoration-color:rgba(160,120,42,0.4);text-underline-offset:2px;}
      .inline-link:hover{text-decoration-color:var(--gold);}
      .ig-cta{margin-top:3rem;padding-top:2rem;border-top:1px solid var(--border);text-align:center;}
      .ig-cta p{color:var(--textMid);font-size:0.92rem;margin-bottom:1rem;}
      .ig-cta-icons{display:flex;justify-content:center;gap:1rem;}
      .ig-cta-icons a{display:flex;align-items:center;justify-content:center;width:44px;height:44px;border:1.5px solid var(--gold);border-radius:50%;color:var(--gold);text-decoration:none;transition:background 0.2s;}
      .ig-cta-icons a:hover{background:rgba(160,120,42,0.1);}
      footer{margin-top:3rem;padding-top:2rem;border-top:1px solid var(--border);text-align:center;}
      footer a{color:var(--gold);text-decoration:none;font-size:0.78rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;}
    </style>
    ${GA_TRACKING}
  </head>
  <body>
    <div class="wrap">
      <div class="top-nav">
        <a href="${SITE_URL}/#blog">← Torna al sito Casa Cavour</a>
        <button type="button" class="share-btn" id="share-btn">Condividi ↗</button>
      </div>
      <span class="cat">${escapeHtml(post.categoria)}</span>
      <time datetime="${escapeAttr(post.data)}">${escapeHtml(formatDate(post.data))}</time>
      <h1>${escapeHtml(post.titolo)}</h1>
      <p class="sommario">${escapeHtml(post.sommario)}</p>
${bodyBlocks}
      <div class="ig-cta">
        <p>Seguici su Instagram per non perderti i nuovi contenuti su Bertinoro e le colline romagnole.</p>
        <div class="ig-cta-icons">
          <a href="${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></svg>
          </a>
          <a href="${FACEBOOK_URL}" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M15 3h-2.5C10 3 8.5 4.6 8.5 7.2V10H6v3.2h2.5V21h3.3v-7.8h2.6l.5-3.2h-3.1V7.5c0-.9.3-1.5 1.6-1.5H15V3z"/></svg>
          </a>
        </div>
      </div>
      <footer><a href="${SITE_URL}/">Casa Cavour Bertinoro. Torna alla home</a></footer>
    </div>
    <script>
      (function () {
        var btn = document.getElementById("share-btn");
        if (!btn) return;
        var url = ${JSON.stringify(url)};
        var title = ${JSON.stringify(post.titolo)};
        var text = ${JSON.stringify(post.sommario)};
        var defaultLabel = btn.textContent;
        btn.addEventListener("click", async function () {
          // url incluso anche in "text": alcuni client (es. app email) leggono
          // solo il campo text e ignorano url, altrimenti il link non
          // arriverebbe nel corpo del messaggio.
          var shareData = { title: title, text: text + "\\n\\n" + url };
          if (navigator.share) {
            try { await navigator.share(shareData); } catch (e) {}
            return;
          }
          try {
            await navigator.clipboard.writeText(url);
            btn.textContent = "Link copiato ✓";
            setTimeout(function () { btn.textContent = defaultLabel; }, 2000);
          } catch (e) {
            window.prompt("Copia il link dell'articolo:", url);
          }
        });
      })();
    </script>
  </body>
</html>
`;
}

// ── Sitemap ────────────────────────────────────────────────────────────────
// Aggiunge a public/sitemap*.xml una <url> per ciascun articolo attivo (pagina
// /post/{slug}.html), tra i marcatori POST-URLS-START / POST-URLS-END. Le home
// già presenti nel file non vengono toccate. Si rigenera a ogni build insieme
// alle pagine, quindi un articolo disattivato esce dalla sitemap e uno nuovo
// entra senza passi manuali. lastmod = data dell'articolo (campo "data").
const SITEMAP_START = "<!-- POST-URLS-START (generato automaticamente da generate-blog-pages.mjs, non modificare a mano) -->";
const SITEMAP_END = "<!-- POST-URLS-END -->";

function lastmodDi(post) {
  const m = /^\d{4}-\d{2}-\d{2}/.exec(String(post.data));
  return m ? m[0] : new Date(post.data).toISOString().slice(0, 10);
}

function scriviSitemap(visibili) {
  const publicDir = join(ROOT, "public");
  let conHreflang = false;
  const righe = visibili
    .slice()
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map((p) => {
      const url = `${SITE_URL}/post/${p.slug}.html`;
      const alt = alternatesFor(p, url);
      if (alt.length) conHreflang = true;
      return [
        "  <url>",
        `    <loc>${escapeAttr(url)}</loc>`,
        `    <lastmod>${lastmodDi(p)}</lastmod>`,
        ...alt.map(([l, h]) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${escapeAttr(h)}" />`),
        "  </url>",
      ].join("\n");
    });
  const blocco = [`  ${SITEMAP_START}`, ...righe, `  ${SITEMAP_END}`].join("\n");
  const files = readdirSync(publicDir).filter((f) => /^sitemap(-[A-Za-z]{2})?\.xml$/.test(f));
  if (files.length === 0) throw new Error("generate-blog-pages: nessun file sitemap*.xml in public/");
  for (const f of files) {
    const p = join(publicDir, f);
    let xml = readFileSync(p, "utf8");
    if (conHreflang && !xml.includes("xmlns:xhtml=")) {
      throw new Error(`generate-blog-pages: ${f} senza xmlns:xhtml="http://www.w3.org/1999/xhtml" su <urlset>, necessario per gli hreflang degli articoli.`);
    }
    const a = xml.indexOf(SITEMAP_START);
    const b = xml.indexOf(SITEMAP_END);
    if (a !== -1 && b !== -1) {
      const inizioRiga = xml.lastIndexOf("\n", a) + 1;
      xml = xml.slice(0, inizioRiga) + blocco + xml.slice(b + SITEMAP_END.length);
    } else {
      if (!xml.includes("</urlset>")) throw new Error(`generate-blog-pages: ${f} senza </urlset>`);
      xml = xml.replace("</urlset>", `${blocco}\n\n</urlset>`);
    }
    writeFileSync(p, xml, "utf8");
  }
  console.log(`generate-blog-pages: sitemap aggiornata (${files.join(", ")}) con ${visibili.length} articoli`);
}

async function main() {
  const posts = await loadPosts();

  const visibili = posts.filter((p) => p.attivo);

  if (visibili.length === 0) {
    console.warn("generate-blog-pages: nessun articolo attivo trovato, nessuna pagina generata.");
    return;
  }

  // Deriva lo slug per ciascun post e verifica che non ci siano collisioni
  // (id diversi che normalizzano allo stesso slug).
  const seen = new Map();
  for (const p of visibili) {
    const slug = slugify(p.id);
    if (!slug) {
      throw new Error(`generate-blog-pages: id "${p.id}" produce uno slug vuoto, correggere l'id in posts.jsx.`);
    }
    if (seen.has(slug)) {
      throw new Error(`generate-blog-pages: collisione di slug "${slug}" tra id "${seen.get(slug)}" e "${p.id}". Correggere uno dei due id in posts.jsx.`);
    }
    seen.set(slug, p.id);
    p.slug = slug;
  }

  // Mappa id (chiave grezza in posts.jsx) -> slug (nome file pubblico), usata
  // per risolvere i link interni [[etichetta|id]] dentro i paragrafi. Include
  // solo gli articoli attivi: un link verso un articolo disattivato deve
  // fallire la build, non produrre un link rotto silenzioso.
  const idToSlug = new Map(visibili.map((p) => [p.id, p.slug]));
  const idToPost = new Map(visibili.map((p) => [p.id, p]));

  mkdirSync(OUT_DIR, { recursive: true });

  // Rimuove pagine orfane (articoli disattivati o rinominati) prima di rigenerare,
  // così public/post/ resta sempre uno specchio esatto degli articoli attivi.
  const attesi = new Set(visibili.map((p) => `${p.slug}.html`));
  for (const f of readdirSync(OUT_DIR)) {
    if (f.endsWith(".html") && !attesi.has(f)) {
      unlinkSync(join(OUT_DIR, f));
    }
  }

  for (const post of visibili) {
    const html = renderPage(post, idToSlug, idToPost);
    writeFileSync(join(OUT_DIR, `${post.slug}.html`), html, "utf8");
  }

  scriviSitemap(visibili);
  console.log(`generate-blog-pages: generate ${visibili.length} pagine in public/post/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
