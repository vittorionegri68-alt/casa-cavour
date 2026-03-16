// ─────────────────────────────────────────────────────────────────────────────
// posts.js — Articoli del blog per Casa Cavour (versione italiana)
//
// Come aggiungere un nuovo articolo:
// 1. Copia uno dei blocchi qui sotto
// 2. Cambia id, titolo, data, categoria, sommario e contenuto
// 3. Salva — l'articolo appare automaticamente nella sezione Blog
// ─────────────────────────────────────────────────────────────────────────────
 
export const posts = [
  {
    id: "5-cose-da-fare-bertinoro",
    titolo: "5 cose da fare a Bertinoro in un weekend",
    data: "2025-03-10",
    categoria: "Guida locale",
    sommario: "Bertinoro non è solo il Balcone della Romagna — è un borgo medievale ricco di esperienze autentiche. Ecco 5 cose da non perdere durante il tuo soggiorno.",
    contenuto: [
      {
        tipo: "paragrafo",
        testo: "Bertinoro è uno di quei luoghi che sorprende sempre. A soli 15 minuti da Cesena, questo borgo medievale arroccato sulle colline romagnole offre panorami mozzafiato sull'Adriatico e un'atmosfera autentica lontana dal turismo di massa."
      },
      {
        tipo: "titoletto",
        testo: "1. Passeggia per il centro storico"
      },
      {
        tipo: "paragrafo",
        testo: "Le stradine del centro storico di Bertinoro sono un labirinto affascinante di vicoli medievali, palazzi storici e scorci panoramici. La Colonna dell'Ospitalità — un anello di ferro dove i visitatori venivano invitati a legare il proprio cavallo e diventare ospiti dei bertinoresi — è il simbolo del famoso spirito accogliente della città."
      },
      {
        tipo: "titoletto",
        testo: "2. Visita la Rocca Albornoziana"
      },
      {
        tipo: "paragrafo",
        testo: "La Rocca domina il borgo dall'alto e ospita oggi il Centro Residenziale Universitario di Bertinoro. Vale la pena salire per ammirare la vista a 360 gradi sulle colline romagnole fino all'Adriatico. Nelle giornate limpide si intravedono persino le Alpi."
      },
      {
        tipo: "titoletto",
        testo: "3. Fai un wine tour tra le cantine locali"
      },
      {
        tipo: "paragrafo",
        testo: "La zona di Bertinoro è famosa per l'Albana di Romagna DOCG — il primo vino bianco italiano a ottenere la denominazione di origine controllata e garantita. A soli 10 minuti in auto si trovano alcune delle cantine storiche più belle della regione. Molte offrono degustazioni su prenotazione."
      },
      {
        tipo: "titoletto",
        testo: "4. Assapora la cucina romagnola autentica"
      },
      {
        tipo: "paragrafo",
        testo: "Piadina, tagliatelle al ragù, passatelli in brodo, squacquerone. Bertinoro ha una manciata di osterie e trattorie dove i locali mangiano da generazioni. Chiedete a chi vi ospita dove vanno i bertinoresi veri — non finire in un posto per turisti."
      },
      {
        tipo: "titoletto",
        testo: "5. Ammira il tramonto dal belvedere"
      },
      {
        tipo: "paragrafo",
        testo: "Il belvedere panoramico di Bertinoro è uno dei più belli della Romagna. Al tramonto, quando la luce dora le colline e il mare Adriatico brilla all'orizzonte, capisci perché questo borgo viene chiamato il Balcone della Romagna. Portati una bottiglia di Sangiovese locale e goditi lo spettacolo."
      }
    ],
    attivo: true,
  },
  {
    id: "affitti-brevi-romagna-cosa-vedere",
    titolo: "Affitti brevi in Romagna: cosa vedere nei dintorni di Cesena",
    data: "2025-03-18",
    categoria: "Territorio",
    sommario: "Scegliere un affitto breve nella zona di Cesena significa avere accesso a mare, colline, borghi medievali e ottimo cibo — tutto a portata di auto. Ecco la nostra guida.",
    contenuto: [
      {
        tipo: "paragrafo",
        testo: "La Romagna è una regione straordinariamente varia. In meno di un'ora d'auto si passa dalla Riviera Adriatica all'Appennino, attraversando borghi medievali, vigneti e città d'arte. Soggiornare in un affitto breve vicino a Cesena — come Casa Cavour a Bertinoro — significa avere questo intero territorio a portata di mano."
      },
      {
        tipo: "titoletto",
        testo: "Il mare: Cesenatico e la Riviera"
      },
      {
        tipo: "paragrafo",
        testo: "A 30 minuti da Bertinoro, Cesenatico è uno dei borghi marinari più autentici della Riviera. Il porto canale leonardesco — progettato da Leonardo da Vinci nel 1502 — è uno spettacolo unico. D'estate le spiagge sono animate e il pesce fresco al porto è imperdibile. Rimini, con la sua storia millenaria e le sue spiagge, è a soli 40 minuti."
      },
      {
        tipo: "titoletto",
        testo: "San Marino: la Repubblica più antica del mondo"
      },
      {
        tipo: "paragrafo",
        testo: "A 35 minuti da Bertinoro sorge la Repubblica di San Marino, lo stato indipendente più antico del mondo. Le tre torri medievali che dominano il monte Titano sono un simbolo iconico. Vale assolutamente una mezza giornata — l'ingresso al centro storico è gratuito."
      },
      {
        tipo: "titoletto",
        testo: "Ravenna: i mosaici bizantini"
      },
      {
        tipo: "paragrafo",
        testo: "A 50 minuti da Bertinoro, Ravenna è Patrimonio UNESCO per i suoi straordinari mosaici bizantini. I mausolei e le basiliche del V e VI secolo conservano i mosaici meglio conservati al mondo. Una visita culturale imperdibile durante un soggiorno in Romagna."
      },
      {
        tipo: "titoletto",
        testo: "Bologna: la grassa, la dotta, la rossa"
      },
      {
        tipo: "paragrafo",
        testo: "A 60 minuti da Bertinoro (in auto o in treno da Cesena), Bologna offre uno dei centri storici medievali più belli d'Italia, una gastronomia leggendaria e una vita culturale vivace. Ideale per una gita di un giorno."
      }
    ],
    attivo: true,
  },
  {
    id: "bertinoro-weekend-romantico",
    titolo: "Perché Bertinoro è il posto perfetto per un weekend romantico",
    data: "2025-03-25",
    categoria: "Ispirazione",
    sommario: "Colline dorate, tramonti sull'Adriatico, vino locale e un appartamento di design solo per voi. Scopri perché Bertinoro è la meta romantica perfetta in Romagna.",
    contenuto: [
      {
        tipo: "paragrafo",
        testo: "Stai cercando una fuga romantica lontana dal caos delle città, ma non vuoi rinunciare al comfort e alla bellezza? Bertinoro, il Balcone della Romagna, è la risposta. Un borgo medievale sulle colline romagnole che combina paesaggi straordinari, cucina eccellente e un ritmo di vita lento e autentico."
      },
      {
        tipo: "titoletto",
        testo: "Un appartamento tutto per voi"
      },
      {
        tipo: "paragrafo",
        testo: "A differenza di un hotel, un appartamento come Casa Cavour vi dà la libertà di vivere il borgo come veri locali. Fare la spesa al mercato mattutino, cucinare con i prodotti freschi della zona, aprire una bottiglia di Albana al tramonto sul belvedere. Intimità e autenticità che nessun hotel può offrire."
      },
      {
        tipo: "titoletto",
        testo: "Il tramonto piu bello della Romagna"
      },
      {
        tipo: "paragrafo",
        testo: "Il belvedere panoramico di Bertinoro offre uno dei tramonti piu spettacolari della regione. Quando il sole scende dietro le colline e il mare Adriatico si tinge di arancione all'orizzonte, il momento diventa magico. Portatevi un bicchiere di Sangiovese e godetevi lo spettacolo insieme."
      },
      {
        tipo: "titoletto",
        testo: "Cene indimenticabili"
      },
      {
        tipo: "paragrafo",
        testo: "La cucina romagnola è fatta per essere condivisa. Tagliatelle al ragu tirate a mano, piadina calda con squacquerone e rucola, passatelli in brodo, costine di maiale alla brace. Le trattorie di Bertinoro e dintorni sono luoghi dove il tempo si ferma e ogni pasto diventa un ricordo."
      },
      {
        tipo: "titoletto",
        testo: "Un wine tour tra i vigneti"
      },
      {
        tipo: "paragrafo",
        testo: "A 10 minuti da Bertinoro si trovano alcune delle cantine piu caratteristiche della Romagna. Un pomeriggio tra i filari, con degustazione di Albana DOCG e Sangiovese, e uno dei modi piu romantici per scoprire il territorio. Molte cantine accettano visite su prenotazione — chiedete a noi per i contatti giusti."
      }
    ],
    attivo: true,
  },
];
