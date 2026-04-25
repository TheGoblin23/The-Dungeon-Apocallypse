// Sistema de economía y progresión

export function obtenerFragmentos() {
    return parseInt(localStorage.getItem("fragmentos") || "0");
}

export function agregarFragmentos(cantidad) {
    const actuales = obtenerFragmentos();
    localStorage.setItem("fragmentos", actuales + cantidad);
    return obtenerFragmentos();
}

export function gastarFragmentos(cantidad) {
    const actuales = obtenerFragmentos();
    if (actuales >= cantidad) {
        localStorage.setItem("fragmentos", actuales - cantidad);
        return true;
    }
    return false;
}

export function obtenerMateriales() {
    const defaultMats = { hueso: 0, escama: 0, colmillo: 0, astilla: 0, cristal: 0 };
    try {
        return JSON.parse(localStorage.getItem("materiales")) || defaultMats;
    } catch {
        return defaultMats;
    }
}

export function agregarMateriales(nuevosMateriales) {
    const materiales = obtenerMateriales();
    for (const key in nuevosMateriales) {
        if (materiales[key] !== undefined) {
            materiales[key] += nuevosMateriales[key];
        }
    }
    localStorage.setItem("materiales", JSON.stringify(materiales));
    return materiales;
}

export function calcularRecompensa(enemigo, hpRestante) {
    let fragmentosBase = 0;
    const materialesGanados = {};
    const r = Math.random();

    // Materiales comunes (siempre)
    materialesGanados.hueso = Math.floor(Math.random() * 2) + 1;

    switch (enemigo.id) {
        case "goblin":
            fragmentosBase = 15;
            materialesGanados.escama = 1;
            break;
        case "orco":
            fragmentosBase = 25;
            materialesGanados.colmillo = 1;
            break;
        case "esqueleto":
            fragmentosBase = 20;
            if (r < 0.05) materialesGanados.cristal = 1;
            break;
    }

    // Materiales raros (10% chance global)
    if (Math.random() < 0.10) materialesGanados.astilla = 1;

    // Bonus por HP restante (+1 por cada 10 HP)
    const bonusHp = Math.floor(hpRestante / 10);
    const totalFragmentos = fragmentosBase + bonusHp;

    return {
        fragmentos: totalFragmentos,
        materiales: materialesGanados
    };
}

// -- INVENTARIO (POWER-UPS) --

export function obtenerInventario() {
    try {
        return JSON.parse(localStorage.getItem("inventario")) || [];
    } catch {
        return [];
    }
}

export function agregarAInventario(idItem) {
    const inv = obtenerInventario();
    inv.push(idItem);
    localStorage.setItem("inventario", JSON.stringify(inv));
}

export function usarItem(idItem) {
    const inv = obtenerInventario();
    const index = inv.indexOf(idItem);
    if (index > -1) {
        inv.splice(index, 1);
        localStorage.setItem("inventario", JSON.stringify(inv));
        return true;
    }
    return false;
}

export const ITEMS_TIENDA = {
    powerups: [
        { id: "reroll", nombre: "Volver a tirar dados", descripcion: "Permite tirar los dados una segunda vez", costo: 30 },
        { id: "shuffle", nombre: "Barajar cartas", descripcion: "Reordena aleatoriamente tu mano", costo: 25 },
        { id: "potion", nombre: "Poción menor", descripcion: "Cura 15 HP en batalla", costo: 20 },
        { id: "shield", nombre: "Escudo de sombra", descripcion: "Bloquea el próximo ataque enemigo", costo: 35 }
    ],
    cosmeticos: [
        { id: "board_obsidian", nombre: "Tablero de obsidiana", costo: 150, locked: true },
        { id: "card_gold", nombre: "Marco de cartas dorado", costo: 100, locked: true },
        { id: "hp_blood", nombre: "Efecto de sangre en HP", costo: 80, locked: true }
    ]
};

export function comprarItem(idItem) {
    // Buscar en powerups
    const item = ITEMS_TIENDA.powerups.find(i => i.id === idItem);
    if (item && gastarFragmentos(item.costo)) {
        agregarAInventario(idItem);
        return true;
    }
    return false;
}

// -- COMPRAS REALES (STUB) --
export function iniciarCompraReal(paquete) {
    console.warn("Compra real no implementada aún para el paquete:", paquete.id);
    alert("Próximamente: Integración con pasarela de pago.");
}

export const PAQUETES_REALES = [
    { id: "starter", nombre: "Bolsa de Fragmentos", fragmentos: 200, precio: 1.99 },
    { id: "medium",  nombre: "Cofre de Fragmentos", fragmentos: 600, precio: 4.99 },
    { id: "large",   nombre: "Tesoro del Dragón",   fragmentos: 1500, precio: 9.99 }
];

// -- MEJORAS --
export function obtenerNivelesMejoras() {
    try {
        return JSON.parse(localStorage.getItem("mejoras")) || { hp_max: 0, dano_base: 0, energia_max: 0 };
    } catch {
        return { hp_max: 0, dano_base: 0, energia_max: 0 };
    }
}

export const MEJORAS = [
    {
        id: "hp_max",
        nombre: "Fortaleza Oscura",
        descripcion: "+10 HP máximo permanente",
        nivel_max: 5,
        costo: (nivel) => ({ hueso: (nivel + 1) * 3, escama: (nivel + 1) })
    },
    {
        id: "dano_base",
        nombre: "Filo Maldito",
        descripcion: "+1 daño base en todas las cartas",
        nivel_max: 3,
        costo: (nivel) => ({ colmillo: (nivel + 1), astilla: 1 })
    },
    {
        id: "energia_max",
        nombre: "Canal Arcano",
        descripcion: "+1 energía mínima garantizada por turno",
        nivel_max: 3,
        costo: (nivel) => ({ escama: (nivel + 1) * 2, cristal: 1 })
    }
];

export function mejorarAtributo(idMejora) {
    const mejora = MEJORAS.find(m => m.id === idMejora);
    if (!mejora) return false;

    const niveles = obtenerNivelesMejoras();
    const nivelActual = niveles[idMejora] || 0;

    if (nivelActual >= mejora.nivel_max) return false;

    const costos = mejora.costo(nivelActual);
    const materiales = obtenerMateriales();

    // Validar fondos
    for (const mat in costos) {
        if ((materiales[mat] || 0) < costos[mat]) {
            return false;
        }
    }

    // Pagar
    for (const mat in costos) {
        materiales[mat] -= costos[mat];
    }
    localStorage.setItem("materiales", JSON.stringify(materiales));

    // Aplicar
    niveles[idMejora] = nivelActual + 1;
    localStorage.setItem("mejoras", JSON.stringify(niveles));

    return true;
}
