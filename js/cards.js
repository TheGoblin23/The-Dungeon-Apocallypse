import { curar } from './player.js';

export const CARTAS_DB = {
    "ataque": {
        id: "ataque",
        nombre: "Ataque Sombrío",
        costo: 3,
        descripcion: "Inflige daño básico.",
        tipo: "ataque",
        baseEfecto: 6
    },
    "golpe_fuerte": {
        id: "golpe_fuerte",
        nombre: "Golpe del Condenado",
        costo: 5,
        descripcion: "Un golpe devastador.",
        tipo: "ataque",
        baseEfecto: 10
    },
    "curar": {
        id: "curar",
        nombre: "Pacto de Sangre",
        costo: 4,
        descripcion: "Restaura salud usando magia oscura.",
        tipo: "curacion",
        baseEfecto: 6
    }
};

export function obtenerManoInicial() {
    // Por ahora, todos tienen la misma mano inicial (se podría personalizar por clase)
    return ["ataque", "ataque", "golpe_fuerte", "curar"];
}

// Devuelve un objeto con { success, effect, type }
export function jugarCarta(idCarta, jugador, enemigo) {
    const carta = CARTAS_DB[idCarta];
    if (!carta) return { success: false, msg: "Carta no encontrada" };

    if (jugador.energia < carta.costo) {
        return { success: false, msg: "Energía insuficiente" };
    }

    jugador.energia -= carta.costo;
    
    let resultado = { success: true, tipo: carta.tipo, valor: 0 };

    if (carta.tipo === "ataque") {
        // Cálculo del daño: base + bonus de mejoras + bonus de héroe + tempBonus
        const totalDamage = carta.baseEfecto + jugador.bonusDamage + jugador.tempDamageBonus;
        enemigo.hp -= totalDamage;
        if (enemigo.hp < 0) enemigo.hp = 0;
        resultado.valor = totalDamage;
        resultado.msg = `Infliges ${totalDamage} de daño.`;
    } 
    else if (carta.tipo === "curacion") {
        curar(jugador, carta.baseEfecto);
        resultado.valor = carta.baseEfecto;
        resultado.msg = `Te curas ${carta.baseEfecto} HP.`;
    }

    return resultado;
}

export function barajarMano(mano) {
    let nuevaMano = [...mano];
    for (let i = nuevaMano.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [nuevaMano[i], nuevaMano[j]] = [nuevaMano[j], nuevaMano[i]];
    }
    return nuevaMano;
}
