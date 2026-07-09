// Tallennetaan solmut taulukkoon objekteina
// x ja y ovat prosenttiosuuksia, verkkokartta-alueen koosta.
const verkonSolmut = [
    { id: "SRV-01", x: 10, y:10 },
    { id: "RTR-A",  x: 50, y: 10 },
    { id: "RTR-B",  x: 90, y: 33 },
    { id: "SRV-02", x: 90, y: 66 },
    { id: "RTR-C",  x: 10, y: 50 },
    { id: "RTR-D",  x: 50, y: 50 },
    { id: "SRV-03", x: 10, y: 90 },
    { id: "RTR-E",  x: 50, y: 90 }
];

// Määritellään kaapeliyhteydet
const verkonKaapelit = [
    { mista: "SRV-01", mihin: "RTR-A" },
    { mista: "RTR-A",  mihin: "RTR-B" },
    { mista: "RTR-A",  mihin: "RTR-D" },
    { mista: "RTR-B",  mihin: "SRV-02" },
    { mista: "SRV-02", mihin: "RTR-E" },
    { mista: "RTR-D",  mihin: "RTR-E" },
    { mista: "RTR-E",  mihin: "SRV-03" },
    { mista: "RTR-C", mihin: "SRV-01" },
    { mista: "SRV-03", mihin: "RTR-D" },
    { mista: "RTR-C",  mihin: "RTR-D" },
    { mista: "RTR-B",  mihin: "RTR-D" },
    { mista: "RTR-C",  mihin: "SRV-03" },
    { mista: "SRV-01", mihin: "RTR-D" },
    { mista: "RTR-D",  mihin: "SRV-02" }
];

const toolbox = document.getElementById('toolbox');

// Piirtää solmut näytölle
function alustaSolmut() {
    const alustaSivu = document.getElementById('networkContainer');

    // Käydään jokainen solmu läpi
    verkonSolmut.forEach(solmu => {

        // Luodaan uusi tyhjä <div> elementti solmua varten
        const solmuElementti = document.createElement("div");

        // Annetaan CSS luokka
        solmuElementti.className = 'network-node';

        // Sijoitetaan solmu oikeaan kohtaan prosenttien avulla
        solmuElementti.style.left = solmu.x + "%";
        solmuElementti.style.top = solmu.y + "%";

        // Luodaan solmulle sisäosa taustaväriä ja tekstiä varten
        const sisaosa = document.createElement("div");
        sisaosa.className = "node-internal";
        sisaosa.textContent = solmu.id;

        // Laitetaan sisäosa solmu-elementin sisälle
        solmuElementti.appendChild(sisaosa);

        // Lopuksi liitetään koko solmu näkyviin verkkokarttaan
        alustaSivu.appendChild(solmuElementti);
    });
}

// Piirtää kaapelit solmujen välille
function alustaKaapelit() {
    const svgAlusta = document.getElementById('svgCanvas');

    // Käydään läpi kaikki kaapelit
    verkonKaapelit.forEach((kaapeli,indeksi) => {

        // Etsitään lähtösolmun tiedot
        const lahtoSolmu = verkonSolmut.find(solmu => solmu.id === kaapeli.mista);

        // Etsitään kohdesolmun tiedot
        const kohdeSolmu = verkonSolmut.find(solmu => solmu.id === kaapeli.mihin);

        // Jos molemmat solmut löytyivät, piirretään viiva
        if (lahtoSolmu && kohdeSolmu) {

            // SVG elementtejä luodessa pitää selaimelle kertoa virallinen osoite
            const svgNamespace = "http://www.w3.org/2000/svg";
            const viiva = document.createElementNS(svgNamespace, "line");

            // Asetetaan viivalle luokka tyylitiedostoa varten
            viiva.classList.add('network-cable');
            viiva.style.pointerEvents = 'all';
            viiva.style.cursor = 'pointer';

            // Määritellään mistä prosenttipisteestä viiva alkaa
            viiva.setAttribute("x1", lahtoSolmu.x);
            viiva.setAttribute("y1", lahtoSolmu.y);

            // Määritellään mihin prosenttipisteeseen viiva päättyy
            viiva.setAttribute("x2", kohdeSolmu.x);
            viiva.setAttribute("y2", kohdeSolmu.y);

            viiva.dataset.indeksi = indeksi;

            console.log(`Viiva: ${lahtoSolmu.id}(${lahtoSolmu.x},${lahtoSolmu.y}) → ${kohdeSolmu.id}(${kohdeSolmu.x},${kohdeSolmu.y})`);

            // Liitetään valmis viiva SVG-alustan sisälle näkyviin
            svgAlusta.appendChild(viiva);

            viiva.addEventListener('click', function(e) {
                e.stopPropagation();
                const rect = svgAlusta.getBoundingClientRect();
                const toolX = e.clientX;
                const toolY = e.clientY;

                // Tallenna kaapelin indeksi työkalupakkiin
                toolbox.dataset.indeksi = indeksi;

                // Näytä työkalupakki klikkauksen kohdalla
                toolbox.style.left = toolX + 'px';
                toolbox.style.top = toolY + 'px';
                toolbox.style.display = 'block';
            });

            const teksti = document.createElementNS(svgNamespace, "text");
            teksti.setAttribute("x", (lahtoSolmu.x + kohdeSolmu.x) / 2);
            teksti.setAttribute("y", (lahtoSolmu.y + kohdeSolmu.y) / 2);
            teksti.setAttribute("text-anchor", "middle");
            teksti.setAttribute("dominant-baseline", "middle");
            teksti.setAttribute("font-size", "5");
            teksti.setAttribute("fill", "#8ac4d0");
            teksti.setAttribute("font-family", "Courier New, monospace");
            teksti.setAttribute("font-weight", "bold");
            teksti.textContent = kaapeli.viive + "ms";

            // Tallennetaan kaapelin indeksi myös tekstiin
            teksti.dataset.indeksi = indeksi;

            svgAlusta.appendChild(teksti);
        }
    });
}

// Sovelluksen tila
const tila = {
    lahdeId: null,
    kohdeId: null,
    reitti: [],
    kokonaisViive: 0
};

// Solmujen valinta klikkaamalla
function valitseSolmu() {
    const solmuElementit = document.querySelectorAll('.network-node');

    solmuElementit.forEach((elementti, indeksi) => {
        elementti.addEventListener('click', function(e) {
            e.stopPropagation();

            // Etsitään lähdesolmun ID
            const solmuId = verkonSolmut[indeksi].id;

            // Jos ei ole valittua lähdettä, aseta se
            if (tila.lahdeId === null) {
                tila.lahdeId = solmuId;
                korostaSolmut();
                console.log(`Lähde valittu: ${solmuId}`);
                return;
            }

            // Jos lähde on jo valittu, mutta kohde ei, aseta kohde
            if (tila.kohdeId === null && solmuId !== tila.lahdeId) {
                tila.kohdeId = solmuId;
                korostaSolmut();
                console.log(`Kohde valittu: ${solmuId}`);

                laskeReitti();
                return;
            }

            // Jos klikataan jo valittua solmua, nollataan valinta
            if (solmuId === tila.lahdeId || solmuId === tila.kohdeId) {
                tila.lahdeId = null;
                tila.kohdeId = null;
                tila.reitti = [];
                korostaSolmut();
                poistaReitinKorostus();
                console.log('Valinnat nollattu');
                return;
            }

            // Muuten vaihdetaan lähde ja nollataan kohde
            tila.lahdeId = solmuId;
            tila.kohdeId = null;
            tila.reitti = [];
            korostaSolmut();
            poistaReitinKorostus();
            console.log(`Lähde vaihdettu: ${solmuId}`);
        });
    });
}

// Solmujen korostus
function korostaSolmut() {
    const solmuElementit = document.querySelectorAll('.network-node');
    const solmuTeksti = document.querySelectorAll('.node-internal');

    solmuElementit.forEach((elementti, indeksi) => {
        const solmuId = verkonSolmut[indeksi].id;
        const tekstiElementti = solmuTeksti[indeksi];

        // Poistetaan vanhat korostukset
        elementti.style.border = 'none';
        elementti.style.boxShadow = 'none';
        elementti.style.background = 'linear-gradient(135deg, var(--neon-cyan) 0%, rgba(0, 240, 255, 0.6) 100%)';
        tekstiElementti.style.color = '';

        // Lisää uudet korostukset
        if (solmuId === tila.lahdeId) {
            elementti.style.border = '3px solid #39FF14';
            elementti.style.boxShadow = '0 0 20px rgba(57, 255, 20, 0.6)';
            elementti.style.background = 'linear-gradient(135deg, var(--neon-green) 0%, rgba(57, 255, 20, 0.6) 100%)';
            tekstiElementti.style.color = '#39FF14';
        } else if (solmuId === tila.kohdeId) {
            elementti.style.border = '3px solid #39FF14';
            elementti.style.boxShadow = '0 0 20px rgba(57, 255, 20, 0.6)';
            elementti.style.background = 'linear-gradient(135deg, var(--neon-green) 0%, rgba(57, 255, 20, 0.6) 100%)';
            tekstiElementti.style.color = '#39FF14';
        }
    });
}

// Reitin korostuksen poisto
function poistaReitinKorostus() {
    const kaapelit = document.querySelectorAll('.network-cable');
    const tekstit = document.querySelectorAll('#svgCanvas text');

    kaapelit.forEach((kaapeli, indeksi) => {
        const verkonKaapeli = verkonKaapelit[indeksi];
        if (!verkonKaapeli) return;

        // Palauta väri tilan mukaan
        let vari = 'rgba(0, 240, 255, 0.4)';
        if (verkonKaapeli.tila === 'cut') vari = '#ff3355';
        else if (verkonKaapeli.tila === 'jammed') vari = '#ff8833';

        kaapeli.style.stroke = vari;
        kaapeli.style.strokeWidth = '3';
        if (verkonKaapeli.tila === 'cut') {
            kaapeli.style.strokeDasharray = '5';
        } else {
            kaapeli.style.strokeDasharray = 'none';
        }
    });

    tekstit.forEach((teksti, indeksi) => {
        const verkonKaapeli = verkonKaapelit[indeksi];
        if (!verkonKaapeli) return;

        let vari = '#8ac4d0';
        if (verkonKaapeli.tila === 'cut') vari = '#ff6b8a';
        else if (verkonKaapeli.tila === 'jammed') vari = '#f5a042';

        teksti.setAttribute('fill', vari);
    });
}

// Päivittää yksittäisen kaapelin värin tilan mukaan
function paivitaKaapelinVari(indeksi) {
    const kaapeli = verkonKaapelit[indeksi];
    const kaapelitSvg = document.querySelectorAll('.network-cable');
    const tekstit = document.querySelectorAll('#svgCanvas text');

    if (!kaapeli || !kaapelitSvg[indeksi]) return;

    const viiva = kaapelitSvg[indeksi];
    const teksti = tekstit[indeksi];

    // Aseta väri tilan mukaan
    let vari = 'rgba(0, 240, 255, 0.4)';
    let tekstivari = '#8ac4d0';

    if (kaapeli.tila === 'cut') {
        vari = '#ff3355';
        tekstivari = '#ff6b8a';
        viiva.style.strokeDasharray = '6,6';
    } else if (kaapeli.tila === 'jammed') {
        vari = '#ff8833';
        tekstivari = '#f5a042';
        viiva.style.strokeDasharray = 'none';
    } else {
        vari = 'rgba(0, 240, 255, 0.4)';
        tekstivari = '#8ac4d0';
        viiva.style.strokeDasharray = 'none';
    }

    viiva.style.stroke = vari;
    if (teksti) {
        teksti.setAttribute('fill', tekstivari);
    }
}

// Viiveet (painoarvot kaapeleille) ja tila
function arvoViiveet() {
    verkonKaapelit.forEach(kaapeli => {
        kaapeli.viive = Math.floor(Math.random() * 145) + 5;
        kaapeli.tila = 'normal';
    });
}

// Kutsutaan alustuksen yhteydessä
arvoViiveet();

// Apufunktio kaapelin viiveen hakemiseksi ja huomioi tila
function haeKaapelinViive(kaapeli) {
    if (kaapeli.tila === 'cut') return Infinity;
    if (kaapeli.tila === 'jammed') return kaapeli.viive * 5;
    return kaapeli.viive;
}

// Dijkstra algoritmi
function dijkstra(lahdeId, kohdeId) {
    const solmut = verkonSolmut;
    const kaapelit = verkonKaapelit;

    // Alusta etäisyydet ja edeltäjät
    const etaisyydet = {};
    const edeltajat = {};
    const kasitelty = {};

    solmut.forEach(s => {
        etaisyydet[s.id] = Infinity;
        edeltajat[s.id] = null;
        kasitelty[s.id] = false;
    });
    etaisyydet[lahdeId] = 0;

    // prioriteettijono
    const jono = [{ id: lahdeId, etaisyys: 0 }];

    while (jono.length > 0) {

        // Järjestetään jonon pienin etaisyys ensimmäiseksi
        jono.sort((a, b) => a.etaisyys - b.etaisyys);
        const nykyinen = jono.shift();
        const nykyinenId = nykyinen.id;

        if (kasitelty[nykyinenId]) continue;
        kasitelty[nykyinenId] = true;

        // Jos maalissa, voidaan lopettaa
        if (nykyinenId === kohdeId) break;

        // Käydään läpi kaikki kaapelit, jossa nykyinen solmu mukana
        kaapelit.forEach(kaapeli => {
            let naapuri = null;
            if (kaapeli.mista === nykyinenId) naapuri = kaapeli.mihin;
            else if (kaapeli.mihin === nykyinenId) naapuri = kaapeli.mista;
            else return;

            if (kasitelty[naapuri]) return;

            const viive = haeKaapelinViive(kaapeli);
            if (viive === Infinity) return; // Kaapeli katkaistu

            const uusiEtaisyys = etaisyydet[nykyinenId] + viive;
            if (uusiEtaisyys < etaisyydet[naapuri]) {
                etaisyydet[naapuri] = uusiEtaisyys;
                edeltajat[naapuri] = nykyinenId;
                jono.push({ id: naapuri, etaisyys: uusiEtaisyys });
            }
        });
    }

    // Jos kohdetta ei tavoiteta
    if (etaisyydet[kohdeId] === Infinity) {
        return { reitti: [], kokonaisViive: Infinity };
    }

    // Rakennetaan reitti takaisinpäin
    const reitti = [];
    let nykyinen = kohdeId;
    
    while (nykyinen !== null) {
        reitti.unshift(nykyinen);
        nykyinen = edeltajat[nykyinen];
    }
    if (reitti[0] !== lahdeId) {
        return { reitti: [], kokonaisViive: etaisyydet[kohdeId] };
    }
    return { reitti: reitti, kokonaisViive: etaisyydet[kohdeId] };
}

// Reitin laskenta ja näyttö
function laskeReitti() {
    if (tila.lahdeId === null || tila.kohdeId === null) {
        tila.reitti = [];
        tila.kokonaisViive = 0;
        paivitaReittilista();
        poistaReitinKorostus();
        return;
    }

    const tulos = dijkstra(tila.lahdeId, tila.kohdeId);
    tila.reitti = tulos.reitti;
    tila.kokonaisViive = tulos.kokonaisViive;

    if (tila.reitti.length > 1 && tila.kokonaisViive < Infinity) {
        korostaReitti();
    } else {
        poistaReitinKorostus();
    }
    paivitaReittilista();
    console.log('Reitti laskettu:', tila.reitti, 'Viive:', tila.kokonaisViive);
}

// Reitin korostus
function korostaReitti() {

    // Poista vanha korostus
    poistaReitinKorostus();

    const kaapelitSvg = document.querySelectorAll('.network-cable');
    const tekstit = document.querySelectorAll('#svgCanvas text');

    // Käy läpi reitin vierekkäiset solmut
    for (let i = 0; i < tila.reitti.length - 1; i++) {
        const fromId = tila.reitti[i];
        const toId = tila.reitti[i + 1];

        // Etsi vastaava kaapeli
        const kaapeli = verkonKaapelit.find(k => (k.mista === fromId && k.mihin === toId) || (k.mista === toId && k.mihin === fromId));
        if (!kaapeli) continue;

        // Etsi SVG-viiva (oletetaan että ne on lisätty samass järjestyksessä)
        //const kaapelitSvg = document.querySelectorAll('.network-cable');
        const indeksi = verkonKaapelit.indexOf(kaapeli);

        if (indeksi !== - 1 && kaapelitSvg[indeksi]) {
            kaapelitSvg[indeksi].style.stroke = '#39FF14';
            kaapelitSvg[indeksi].style.strokeWidth = '3';
            kaapelitSvg[indeksi].style.strokeDasharray = 'none';
        }

        if (indeksi !== -1 && tekstit[indeksi]) {
            tekstit[indeksi].setAttribute('fill', '#39FF14');
        }
    }
}

// Reittilistan päivitys
function paivitaReittilista() {
    const listaElementti = document.getElementById('reittilista');
    if (!listaElementti) return;

    if (tila.reitti.length > 1 && tila.kokonaisViive < Infinity) {
        const nimet = tila.reitti.map(id => {
            const solmu = verkonSolmut.find(s => s.id === id);
            return solmu ? solmu.id : id;
        });
        const reittiTeksti = nimet.join(' → ');
        listaElementti.innerHTML = `
            <div style="color: #FFD700; font-weight: bold;">Reitti:</div>
            <div>${reittiTeksti}</div>
            <div style="color: #8ac4d0; margin-top: 8px;">Kokonaisviive: ${tila.kokonaisViive} ms</div>
        `;
    } else if (tila.lahdeId !== null && tila.kohdeId !== null) {
        listaElementti.innerHTML = `<div style="color: #ff6b8a;">⚠ Yhteyttä ei löytynyt (katkaistu tai ruuhkautunut)</div>`;
    } else {
        listaElementti.innerHTML = `<div style="color: #4a6a7a;">Valitse lähde ja kohde</div>`;
    }
}

// Resetointi ja uudelleen arvonta
function uudelleenarvonta() {

    // Arvo uudet viiveet
    arvoViiveet();

    // Nollaa kaikkien kaapleiden tila
    verkonKaapelit.forEach(k => k.tila = 'normal');

    // Nollaa valinnat
    tila.lahdeId = null;
    tila.kohdeId = null;
    tila.reitti = [];
    tila.kokonaisViive = 0;

    const vanhatKaapelit = document.querySelectorAll('.network-cable');
    vanhatKaapelit.forEach(kaapeli => kaapeli.remove());
    const vanhatTekstit = document.querySelectorAll('#svgCanvas text');
    vanhatTekstit.forEach(teksti => teksti.remove());

    // Päivitä näkymä
    alustaKaapelit();
    korostaSolmut();
    poistaReitinKorostus();
    paivitaReittilista();

    // Päivitä viiveiden näyttö
    console.log('Verkko uudelleenarvottu!');
}

// Kytketään reset nappi
document.addEventListener('DOMContentLoaded', function() {
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', uudelleenarvonta);
    }
});

// Työkalupakin toiminnot
document.querySelectorAll('#toolbox .tool-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.stopPropagation();

        const indeksi = parseInt(toolbox.dataset.indeksi);
        if (isNaN(indeksi)) return;

        const kaapeli = verkonKaapelit[indeksi];
        if (!kaapeli) return;

        const action = this.dataset.action;

        switch (action) {
            case 'cut':
                if (kaapeli.tila === 'cut') {
                    // Jos katkaistu, ei tehdä mitään
                } else {
                    kaapeli.tila = 'cut';
                }
                break;
            case 'jam':
                if (kaapeli.tila === 'jammed') {
                    kaapeli.tila = 'normal';
                } else {
                    kaapeli.tila = 'jammed';
                }
                break;
            case 'restore':
                kaapeli.tila = 'normal';
                break;
            default:
                break;
        }

        // Suljetaan työkalupakki
        toolbox.style.display = 'none';

        // Päivitetään kaapelin väri
        paivitaKaapelinVari(indeksi);

        // Lasketaan reitti uudelleen
        laskeReitti();
    });
});

// Sulje työkalupakki klikkaamalla muualle
document.addEventListener('click', function(e) {
    if (!toolbox.contains(e.target)) {
        toolbox.style.display = 'none';
    }
});

// Piirretaan solmut ja yhteydet
window.onload = function() {
    alustaSolmut();
    alustaKaapelit();
    valitseSolmu();
    paivitaReittilista();
    console.log('Sovellus käynnistetty! Klikkaa solmuja valitaksesi lähteen ja kohteen.');
};