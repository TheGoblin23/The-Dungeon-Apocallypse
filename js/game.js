import { crearJugador, usarHabilidad, reiniciarTurno, aplicarDaño as playerAplicarDaño } from './player.js';
import { crearEnemigo, ataqueEnemigo, obtenerRecompensa } from './enemy.js';
import { CARTAS_DB, obtenerManoInicial, jugarCarta, barajarMano } from './cards.js';
import { obtenerFragmentos, agregarFragmentos, agregarMateriales, obtenerInventario, usarItem, ITEMS_TIENDA } from './economia.js';
import { Sonidos } from './sonidos.js';

// ESTADO CENTRALIZADO
const GameState = {
    jugador: null,
    enemigo: null,
    mano: [],
    turno: 'jugador', // 'jugador' | 'enemigo'
    dadosTirados: false,
    finJuego: false,
    inventarioBatalla: []
};

// UI Elements
const ui = {
    hpJugadorBar: document.getElementById('barra-hp-jugador'),
    hpJugadorText: document.getElementById('texto-hp-jugador'),
    hpEnemigoBar: document.getElementById('barra-hp-enemigo'),
    hpEnemigoText: document.getElementById('texto-hp-enemigo'),
    energiaValor: document.getElementById('energia-valor'),
    dadosContainer: document.getElementById('resultado-dados'),
    btnTirar: document.getElementById('btn-tirar-dados'),
    btnHabilidad: document.getElementById('btn-habilidad'),
    manoCartas: document.getElementById('mano-cartas'),
    log: document.getElementById('game-log'),
    resultadoOverlay: document.getElementById('pantalla-resultado'),
    powerupsBar: document.getElementById('barra-powerups'),
    fragDisplay: document.getElementById('fragmentos-display')
};

function init() {
    // Inicializar Sonidos (aunque requiera interacción, por si ya la hubo en el menú)
    if(localStorage.getItem("muted") === null) {
        localStorage.setItem("muted", false);
    }

    const clase = localStorage.getItem("character") || "guerrero";
    GameState.jugador = crearJugador(clase);
    GameState.enemigo = crearEnemigo();
    GameState.mano = obtenerManoInicial();
    GameState.inventarioBatalla = obtenerInventario();
    GameState.dadosTirados = false;
    GameState.finJuego = false;
    GameState.turno = 'jugador';

    setupUI();
    updateUI();
    mostrarLog("¡La batalla comienza!");
}

function setupUI() {
    // Iconos de jugador
    const icons = { guerrero: "⚔️", mago: "🧙", ladron: "🗡️" };
    document.getElementById("jugador-icono").innerText = icons[GameState.jugador.clase] || "⚔️";
    document.getElementById("jugador-nombre").innerText = GameState.jugador.clase.charAt(0).toUpperCase() + GameState.jugador.clase.slice(1);
    
    // Habilidad
    ui.btnHabilidad.innerText = GameState.jugador.habilidad;
    
    // Enemigo
    document.getElementById("enemigo-nombre").innerText = GameState.enemigo.nombre;
    const enemyIcons = { goblin: "👹", orco: "🦍", esqueleto: "💀" };
    document.getElementById("enemigo-icono").innerText = enemyIcons[GameState.enemigo.id] || "👾";

    // Ocultar resultado
    ui.resultadoOverlay.classList.remove("active");
}

function updateUI() {
    // HP Jugador
    const hpJ = GameState.jugador.hp;
    const maxHpJ = GameState.jugador.maxHp;
    ui.hpJugadorText.innerText = `${hpJ}/${maxHpJ}`;
    ui.hpJugadorBar.style.width = `${(hpJ / maxHpJ) * 100}%`;

    // HP Enemigo
    const hpE = GameState.enemigo.hp;
    const maxHpE = GameState.enemigo.maxHp;
    ui.hpEnemigoText.innerText = `${hpE}/${maxHpE}`;
    ui.hpEnemigoBar.style.width = `${(hpE / maxHpE) * 100}%`;

    // Energía
    ui.energiaValor.innerText = GameState.jugador.energia;

    // Botones
    ui.btnTirar.disabled = GameState.dadosTirados || GameState.turno !== 'jugador';
    ui.btnHabilidad.disabled = GameState.jugador.habilidadUsada || GameState.turno !== 'jugador';

    ui.fragDisplay.innerText = obtenerFragmentos();

    renderCartas();
    renderPowerups();
}

function renderCartas() {
    ui.manoCartas.innerHTML = "";
    GameState.mano.forEach((idCarta, index) => {
        const c = CARTAS_DB[idCarta];
        if(!c) return;
        
        const div = document.createElement("div");
        const puedeJugar = GameState.jugador.energia >= c.costo && GameState.turno === 'jugador';
        
        div.className = `carta ${puedeJugar ? '' : 'disabled'}`;
        div.innerHTML = `
            <div class="carta-costo">${c.costo}</div>
            <div class="carta-nombre">${c.nombre}</div>
            <div class="carta-desc">${c.descripcion}</div>
        `;
        
        if (puedeJugar) {
            div.onclick = () => procesarJugarCarta(idCarta, index);
        }
        
        ui.manoCartas.appendChild(div);
    });
}

function renderPowerups() {
    ui.powerupsBar.innerHTML = "";
    // Solo mostrar powerups de combate
    const validos = ["reroll", "shuffle", "potion", "shield"];
    
    // Contar items
    const conteo = {};
    GameState.inventarioBatalla.forEach(item => {
        if(validos.includes(item)) {
            conteo[item] = (conteo[item] || 0) + 1;
        }
    });

    for (const [id, cant] of Object.entries(conteo)) {
        const itemInfo = ITEMS_TIENDA.powerups.find(i => i.id === id);
        if(!itemInfo) continue;

        const btn = document.createElement("button");
        btn.className = "btn-powerup";
        btn.innerText = `${itemInfo.nombre} (x${cant})`;
        // Deshabilitar si no es tu turno
        btn.disabled = GameState.turno !== 'jugador';
        btn.onclick = () => window.usarPowerUp(id);
        
        ui.powerupsBar.appendChild(btn);
    }
}

let logTimeout;
function mostrarLog(msg) {
    ui.log.innerText = msg;
    ui.log.classList.add("visible");
    clearTimeout(logTimeout);
    logTimeout = setTimeout(() => {
        ui.log.classList.remove("visible");
    }, 2500);
}

function animarEntidad(idEntidad, animClase) {
    const el = document.getElementById(idEntidad);
    if(el) {
        el.classList.add(animClase);
        setTimeout(() => el.classList.remove(animClase), 300);
    }
}

// --- ACCIONES EXPORTADAS A WINDOW ---

window.tirarDados = function() {
    if(GameState.dadosTirados || GameState.turno !== 'jugador') return;
    
    Sonidos.dados();
    
    ui.dadosContainer.innerHTML = "";
    
    // Tirar 1 o 2 dados (habilidad ladrón)
    const tiradas = GameState.jugador.doubleDice ? 2 : 1;
    let max = 0;

    for(let i=0; i<tiradas; i++) {
        const d = document.createElement("div");
        d.className = "dado rodando";
        d.innerText = "?";
        ui.dadosContainer.appendChild(d);

        setTimeout(() => {
            const val = Math.floor(Math.random() * 6) + 1;
            d.classList.remove("rodando");
            d.innerText = val;
            if(val > max) max = val;

            if (i === tiradas - 1) {
                // Aplicar valor final
                const bonus = GameState.jugador.bonusMana;
                let energiaGanada = max + bonus;
                
                // Mínimo de energía (mejora)
                if (energiaGanada < GameState.jugador.minEnergia) {
                    energiaGanada = GameState.jugador.minEnergia;
                }

                GameState.jugador.energia += energiaGanada;
                GameState.dadosTirados = true;
                mostrarLog(`Sacaste ${max}${bonus>0 ? ` (+${bonus})`: ''}. Obtienes ${energiaGanada} ⚡`);
                updateUI();
            }
        }, 500);
    }
};

window.activarHabilidad = function() {
    if(GameState.jugador.habilidadUsada || GameState.turno !== 'jugador') return;
    
    if (usarHabilidad(GameState.jugador)) {
        Sonidos.habilidad();
        mostrarLog(`Habilidad ${GameState.jugador.habilidad} activada!`);
        updateUI();
    }
};

function procesarJugarCarta(idCarta, index) {
    if (GameState.turno !== 'jugador' || GameState.finJuego) return;

    Sonidos.carta();
    const result = jugarCarta(idCarta, GameState.jugador, GameState.enemigo);
    
    if (result.success) {
        // Remover carta de la mano (temporal: en este diseño no se roban cartas nuevas por ahora,
        // o si queremos que se descarten, lo hacemos. Si no, las dejamos y solo gastan maná)
        // Por ahora no quitaremos la carta de la mano para no complicar el bucle, a menos que se desee deckbuilding real.
        // Asumo mano fija que se refresca, pero para dar sensación táctica, no la quitamos, 
        // simplemente dejamos que el maná limite su uso.

        if (result.tipo === "ataque") {
            Sonidos.golpe();
            animarEntidad("jugador-entidad", "atacando");
            setTimeout(() => animarEntidad("enemigo-entidad", "danado"), 200);
        } else {
            Sonidos.curar();
            animarEntidad("jugador-entidad", "danado"); // hack para efecto visual
        }

        mostrarLog(result.msg);
        updateUI();

        verificarMuerte();
    }
}

window.terminarTurno = function() {
    if(GameState.turno !== 'jugador' || GameState.finJuego) return;
    
    GameState.turno = 'enemigo';
    updateUI();
    
    setTimeout(turnoEnemigo, 1000);
};

// Powerups en batalla
window.usarPowerUp = function(idPowerup) {
    if (GameState.turno !== 'jugador' || GameState.finJuego) return;
    
    // Verificar que esté en el inventario de esta batalla y remover de localStorage
    const idx = GameState.inventarioBatalla.indexOf(idPowerup);
    if(idx === -1) return;
    
    // Remueve 1 de la BD local
    usarItem(idPowerup);
    // Remueve de la memoria de la partida
    GameState.inventarioBatalla.splice(idx, 1);

    Sonidos.habilidad();

    switch(idPowerup) {
        case "reroll":
            GameState.dadosTirados = false;
            mostrarLog("Usaste Reroll. ¡Puedes volver a tirar!");
            break;
        case "shuffle":
            GameState.mano = barajarMano(GameState.mano);
            mostrarLog("Mano barajada aleatoriamente.");
            break;
        case "potion":
            Sonidos.curar();
            GameState.jugador.hp += 15;
            if(GameState.jugador.hp > GameState.jugador.maxHp) GameState.jugador.hp = GameState.jugador.maxHp;
            mostrarLog("Te curaste 15 HP.");
            break;
        case "shield":
            // Modificamos temporalmente al jugador para el próximo ataque
            GameState.jugador.escudoActivado = true;
            mostrarLog("Escudo de Sombra activado. Bloqueará el próximo ataque.");
            break;
    }
    
    updateUI();
};

function turnoEnemigo() {
    if(GameState.finJuego) return;

    mostrarLog("Turno del enemigo...");
    
    setTimeout(() => {
        if(GameState.finJuego) return;

        Sonidos.golpe();
        animarEntidad("enemigo-entidad", "atacando");

        // Custom aplicar daño para incluir el escudo
        const fnDano = (jug, dmgBase) => {
            if (jug.escudoActivado) {
                jug.escudoActivado = false;
                mostrarLog("¡Tu Escudo de Sombra absorbió todo el daño!");
                return 0;
            }
            return playerAplicarDaño(jug, dmgBase);
        };

        const danoHecho = ataqueEnemigo(GameState.enemigo, GameState.jugador, fnDano);
        
        if (danoHecho > 0) {
            animarEntidad("jugador-entidad", "danado");
            mostrarLog(`${GameState.enemigo.nombre} ataca y causa ${danoHecho} de daño.`);
        }

        updateUI();
        verificarMuerte();

        if (!GameState.finJuego) {
            setTimeout(() => {
                // Nuevo turno jugador
                GameState.turno = 'jugador';
                reiniciarTurno(GameState.jugador);
                GameState.dadosTirados = false;
                ui.dadosContainer.innerHTML = '<div class="dado">?</div>';
                mostrarLog("Tu turno. Tira los dados.");
                updateUI();
            }, 1000);
        }

    }, 1000);
}

function verificarMuerte() {
    if (GameState.enemigo.hp <= 0) {
        GameState.finJuego = true;
        GameState.enemigo.hp = 0;
        updateUI();
        Sonidos.victoria();
        setTimeout(victoria, 1000);
    } else if (GameState.jugador.hp <= 0) {
        GameState.finJuego = true;
        GameState.jugador.hp = 0;
        updateUI();
        Sonidos.derrota();
        setTimeout(derrota, 1000);
    }
}

function victoria() {
    document.getElementById("resultado-titulo").innerText = "¡Victoria!";
    document.getElementById("resultado-titulo").style.color = "var(--verde-vida)";
    
    const recompensa = obtenerRecompensa(GameState.enemigo, GameState.jugador.hp);
    
    // Guardar
    agregarFragmentos(recompensa.fragmentos);
    agregarMateriales(recompensa.materiales);

    // Mostrar UI
    document.getElementById("loot-fragmentos").innerText = `+${recompensa.fragmentos}`;
    
    const matCont = document.getElementById("loot-materiales");
    matCont.innerHTML = "";
    for (const [mat, cant] of Object.entries(recompensa.materiales)) {
        let icono = "🦴";
        if(mat === "escama") icono = "🦎";
        if(mat === "colmillo") icono = "🦷";
        if(mat === "astilla") icono = "🌟";
        if(mat === "cristal") icono = "🔮";
        matCont.innerHTML += `<div class="loot-item">${icono} +${cant}</div>`;
    }

    document.getElementById("resultado-loot-container").style.display = "block";
    document.getElementById("btn-siguiente-nivel").style.display = "inline-block";
    ui.resultadoOverlay.classList.add("active");
}

function derrota() {
    document.getElementById("resultado-titulo").innerText = "Has Muerto";
    document.getElementById("resultado-titulo").style.color = "var(--rojo-vivo)";
    document.getElementById("resultado-loot-container").style.display = "none";
    document.getElementById("btn-siguiente-nivel").style.display = "none";
    
    ui.resultadoOverlay.classList.add("active");
}

window.irAlMenu = function() {
    document.body.style.opacity = 0;
    setTimeout(() => {
        window.location.href = "index.html";
    }, 500);
};

window.siguienteNivel = function() {
    ui.resultadoOverlay.classList.remove("active");
    // Curar un poco entre batallas y generar nuevo enemigo
    GameState.jugador.hp += 20;
    if(GameState.jugador.hp > GameState.jugador.maxHp) GameState.jugador.hp = GameState.jugador.maxHp;
    
    GameState.enemigo = crearEnemigo();
    GameState.finJuego = false;
    GameState.turno = 'jugador';
    reiniciarTurno(GameState.jugador);
    GameState.dadosTirados = false;
    ui.dadosContainer.innerHTML = '<div class="dado">?</div>';
    
    setupUI();
    updateUI();
    mostrarLog(`Un nuevo ${GameState.enemigo.nombre} aparece...`);
};

// Start
init();
