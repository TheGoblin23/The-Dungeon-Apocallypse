import { obtenerNivelesMejoras } from './economia.js';

export function crearJugador(claveHeroe) {
    const mejoras = obtenerNivelesMejoras();
    const bonusHp = (mejoras.hp_max || 0) * 10;
    const bonusDano = (mejoras.dano_base || 0) * 1;
    const bonusEnergia = (mejoras.energia_max || 0) * 1;

    let jugador = {
        clase: claveHeroe,
        hp: 0,
        maxHp: 0,
        energia: 0,
        habilidadUsada: false,
        tempDamageBonus: 0,
        doubleDice: false,
        bonusDamage: bonusDano,
        bonusMana: 0,
        esquiva: 0,
        habilidad: "",
        minEnergia: bonusEnergia // De la mejora "Canal Arcano"
    };

    switch (claveHeroe) {
        case 'guerrero':
            jugador.maxHp = 100 + bonusHp;
            jugador.bonusDamage += 1;
            jugador.habilidad = "Furia";
            break;
        case 'mago':
            jugador.maxHp = 85 + bonusHp;
            jugador.bonusMana = 2;
            jugador.habilidad = "Canalizar";
            break;
        case 'ladron':
            jugador.maxHp = 90 + bonusHp;
            jugador.esquiva = 1;
            jugador.habilidad = "Doble Dado";
            break;
        default:
            jugador.maxHp = 100;
    }

    jugador.hp = jugador.maxHp;
    return jugador;
}

export function usarHabilidad(jugador) {
    if (jugador.habilidadUsada) return false;

    jugador.habilidadUsada = true;

    switch (jugador.clase) {
        case 'guerrero':
            jugador.tempDamageBonus = 3;
            break;
        case 'mago':
            jugador.energia += 3;
            break;
        case 'ladron':
            jugador.doubleDice = true;
            break;
    }
    return true;
}

export function reiniciarTurno(jugador) {
    jugador.energia = 0;
    jugador.habilidadUsada = false;
    jugador.tempDamageBonus = 0;
    jugador.doubleDice = false;
}

export function aplicarDaño(jugador, dmg) {
    // Aplica esquiva del ladrón (reducción de daño plana)
    let danoReal = dmg - jugador.esquiva;
    if (danoReal < 0) danoReal = 0;

    jugador.hp -= danoReal;
    if (jugador.hp < 0) jugador.hp = 0;
    
    return danoReal;
}

export function curar(jugador, amount) {
    jugador.hp += amount;
    if (jugador.hp > jugador.maxHp) jugador.hp = jugador.maxHp;
}
