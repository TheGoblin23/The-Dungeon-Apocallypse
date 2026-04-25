import { 
    obtenerFragmentos, 
    obtenerMateriales, 
    ITEMS_TIENDA, 
    PAQUETES_REALES,
    comprarItem,
    iniciarCompraReal,
    MEJORAS,
    obtenerNivelesMejoras,
    mejorarAtributo
} from './js/economia.js';
import { Sonidos } from './js/sonidos.js';

// Elementos UI
const btnMute = document.getElementById("btn-mute");
const fragmentosDisplay = document.getElementById("fragmentos-display");
const cards = document.querySelectorAll(".hero-card");
const btnEmpezar = document.getElementById("btn-empezar");

// Inicialización
let heroeSeleccionado = localStorage.getItem("character") || "guerrero";
actualizarUISeleccion();
actualizarFragmentos();
actualizarBotonMute();

// Datos de Héroes
const HEROES_DATA = {
    guerrero: {
        nombre: "Guerrero",
        imagen: "assets/warrior.png",
        lore: "Un veterano de innumerables batallas, su fuerza proviene de una furia inquebrantable. Empuña armas pesadas para aplastar cualquier obstáculo en la oscuridad.",
        stats: [
            "❤️ HP: 100",
            "🗡️ Daño Bonus: +1",
            "🔥 Habilidad: Furia (+3 Daño)"
        ]
    },
    mago: {
        nombre: "Mago",
        imagen: "assets/wizard.png",
        lore: "Estudioso de artes arcanas prohibidas. Canaliza las energías místicas del vacío para desatar hechizos devastadores, pero es frágil ante ataques físicos.",
        stats: [
            "❤️ HP: 85",
            "⚡ Bonus Energía: +2/dado",
            "✨ Habilidad: Canalizar (+3 Energía)"
        ]
    },
    ladron: {
        nombre: "Ladrón",
        imagen: "assets/rogue.png",
        lore: "Moviéndose ágilmente entre las sombras, confía en la evasión y la suerte. Sus movimientos rápidos le permiten golpear antes de que el enemigo reaccione.",
        stats: [
            "❤️ HP: 90",
            "🛡️ Esquiva: -1 Daño recibido",
            "🎲 Habilidad: Doble Dado"
        ]
    }
};

const modalHeroInfo = document.getElementById("modal-hero-info");
const btnConfirmHero = document.getElementById("btn-confirm-hero");

// Selección de Héroe
cards.forEach(card => {
    card.addEventListener("click", () => {
        Sonidos.carta();
        
        const heroKey = card.dataset.hero;
        const heroData = HEROES_DATA[heroKey];
        
        document.getElementById("hero-info-title").innerText = heroData.nombre;
        document.getElementById("hero-info-image").src = heroData.imagen;
        document.getElementById("hero-info-lore").innerText = `"${heroData.lore}"`;
        
        const statsBox = document.getElementById("hero-info-stats");
        statsBox.innerHTML = "";
        heroData.stats.forEach(stat => {
            const p = document.createElement("p");
            p.innerText = stat;
            statsBox.appendChild(p);
        });

        // Guardar temporalmente el héroe que se está viendo
        modalHeroInfo.dataset.pendingHero = heroKey;
        modalHeroInfo.classList.add("active");
    });
});

btnConfirmHero.addEventListener("click", () => {
    Sonidos.curar();
    heroeSeleccionado = modalHeroInfo.dataset.pendingHero;
    localStorage.setItem("character", heroeSeleccionado);
    actualizarUISeleccion();
    modalHeroInfo.classList.remove("active");
});

function actualizarUISeleccion() {
    cards.forEach(c => {
        if(c.dataset.hero === heroeSeleccionado) {
            c.classList.add("selected");
        } else {
            c.classList.remove("selected");
        }
    });
}

// Empezar Partida
btnEmpezar.addEventListener("click", () => {
    Sonidos.dados();
    // Animación out
    document.body.style.opacity = 0;
    setTimeout(() => {
        window.location.href = "game.html";
    }, 500);
});

// Modales
const modales = {
    "btn-historia": document.getElementById("modal-historia"),
    "btn-reglas": document.getElementById("modal-reglas"),
    "btn-tienda": document.getElementById("modal-tienda"),
    "btn-forja": document.getElementById("modal-forja")
};

for (const id in modales) {
    document.getElementById(id).addEventListener("click", () => {
        Sonidos.carta();
        modales[id].classList.add("active");
        if (id === "btn-tienda") renderTienda();
        if (id === "btn-forja") renderForja();
    });
}

document.querySelectorAll(".close-modal").forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.target.closest(".modal-overlay").classList.remove("active");
    });
});

document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.classList.remove("active");
    });
});

// Tienda
function renderTienda() {
    const contenedorPowerups = document.getElementById("tienda-powerups");
    const contenedorCosmeticos = document.getElementById("tienda-cosmeticos");
    const contenedorReal = document.getElementById("tienda-real");
    
    contenedorPowerups.innerHTML = "";
    contenedorCosmeticos.innerHTML = "";
    contenedorReal.innerHTML = "";

    const frags = obtenerFragmentos();

    ITEMS_TIENDA.powerups.forEach(item => {
        const div = document.createElement("div");
        div.className = "store-item";
        div.innerHTML = `
            <div class="item-info">
                <h4>${item.nombre}</h4>
                <p>${item.descripcion}</p>
            </div>
            <button class="btn-comprar" data-id="${item.id}" ${frags < item.costo ? 'disabled' : ''}>
                ${item.costo} 💎
            </button>
        `;
        contenedorPowerups.appendChild(div);
    });

    ITEMS_TIENDA.cosmeticos.forEach(item => {
        const div = document.createElement("div");
        div.className = "store-item";
        div.innerHTML = `
            <div class="item-info">
                <h4>${item.nombre}</h4>
                <p>🔒 Próximamente</p>
            </div>
            <button disabled>${item.costo} 💎</button>
        `;
        contenedorCosmeticos.appendChild(div);
    });

    PAQUETES_REALES.forEach(paquete => {
        const div = document.createElement("div");
        div.className = "store-item";
        div.innerHTML = `
            <div class="item-info">
                <h4>${paquete.nombre}</h4>
                <p>${paquete.fragmentos} 💎</p>
            </div>
            <button class="btn-comprar-real" data-id="${paquete.id}">$${paquete.precio}</button>
        `;
        contenedorReal.appendChild(div);
    });

    // Eventos de compra
    document.querySelectorAll(".btn-comprar").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.target.dataset.id;
            if (comprarItem(id)) {
                Sonidos.curar();
                actualizarFragmentos();
                renderTienda(); // re-render para deshabilitar botones si no alcanza
                alert("¡Objeto comprado y guardado en el inventario!");
            }
        });
    });

    document.querySelectorAll(".btn-comprar-real").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.target.dataset.id;
            iniciarCompraReal(PAQUETES_REALES.find(p => p.id === id));
        });
    });
}

// Forja
function renderForja() {
    const contenedor = document.getElementById("lista-mejoras");
    const matContenedor = document.getElementById("inventario-materiales");
    
    const materiales = obtenerMateriales();
    const niveles = obtenerNivelesMejoras();

    // Iconos de materiales: 🦴 Hueso, 🦎 Escama, 🦷 Colmillo, 🌟 Astilla, 🔮 Cristal
    matContenedor.innerHTML = `
        <span>🦴: ${materiales.hueso || 0}</span>
        <span>🦎: ${materiales.escama || 0}</span>
        <span>🦷: ${materiales.colmillo || 0}</span>
        <span>🌟: ${materiales.astilla || 0}</span>
        <span>🔮: ${materiales.cristal || 0}</span>
    `;

    contenedor.innerHTML = "";

    MEJORAS.forEach(mejora => {
        const nivelActual = niveles[mejora.id] || 0;
        const alMaximo = nivelActual >= mejora.nivel_max;
        
        let costoHtml = "Maxed";
        let puedePagar = true;

        if (!alMaximo) {
            const costos = mejora.costo(nivelActual);
            costoHtml = Object.entries(costos).map(([mat, cant]) => {
                const tiene = materiales[mat] || 0;
                if (tiene < cant) puedePagar = false;
                let icono = "🦴";
                if(mat === "escama") icono = "🦎";
                if(mat === "colmillo") icono = "🦷";
                if(mat === "astilla") icono = "🌟";
                if(mat === "cristal") icono = "🔮";
                return `<span style="color: ${tiene >= cant ? 'var(--verde-vida)' : 'var(--rojo-vivo)'}">${icono} ${cant}</span>`;
            }).join(" ");
        }

        const div = document.createElement("div");
        div.className = "forge-item";
        div.innerHTML = `
            <div class="item-info">
                <h4>${mejora.nombre} (Nvl ${nivelActual}/${mejora.nivel_max})</h4>
                <p>${mejora.descripcion}</p>
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-end; gap:5px;">
                <div class="materials-cost">${alMaximo ? '' : costoHtml}</div>
                <button class="btn-mejorar" data-id="${mejora.id}" ${(!puedePagar || alMaximo) ? 'disabled' : ''}>
                    ${alMaximo ? 'Máximo' : 'Mejorar'}
                </button>
            </div>
        `;
        contenedor.appendChild(div);
    });

    document.querySelectorAll(".btn-mejorar").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.target.dataset.id;
            if (mejorarAtributo(id)) {
                Sonidos.golpe();
                renderForja();
            }
        });
    });
}

function actualizarFragmentos() {
    fragmentosDisplay.innerText = obtenerFragmentos();
}

// Audio
btnMute.addEventListener("click", () => {
    const isMuted = Sonidos.toggleMute();
    actualizarBotonMute();
});

function actualizarBotonMute() {
    btnMute.innerText = Sonidos.estaMuteado() ? "🔇" : "🔊";
}
