import { calcularRecompensa } from './economia.js';

const ENEMIGOS_DB = [
    { id: "goblin", nombre: "Goblin", hp: 100, minAtk: 3, maxAtk: 8 },
    { id: "orco", nombre: "Orco", hp: 120, minAtk: 5, maxAtk: 10 },
    { id: "esqueleto", nombre: "Esqueleto", hp: 80, minAtk: 4, maxAtk: 7 }
];

export function crearEnemigo(idEspecifico = null) {
    let base;
    if (idEspecifico) {
        base = ENEMIGOS_DB.find(e => e.id === idEspecifico);
    } else {
        const index = Math.floor(Math.random() * ENEMIGOS_DB.length);
        base = ENEMIGOS_DB[index];
    }

    if (!base) base = ENEMIGOS_DB[0];

    return {
        id: base.id,
        nombre: base.nombre,
        hp: base.hp,
        maxHp: base.hp,
        minAtk: base.minAtk,
        maxAtk: base.maxAtk
    };
}

export function ataqueEnemigo(enemigo, jugador, fnAplicarDano) {
    const rango = enemigo.maxAtk - enemigo.minAtk + 1;
    const danoBase = Math.floor(Math.random() * rango) + enemigo.minAtk;
    
    // fnAplicarDano se inyecta desde game.js (que envuelve la de player.js) para permitir 
    // interacciones cruzadas complejas, pero por ahora solo llama a la del player.
    const danoReal = fnAplicarDano(jugador, danoBase);
    
    return danoReal;
}

export function obtenerRecompensa(enemigo, hpRestanteJugador) {
    return calcularRecompensa(enemigo, hpRestanteJugador);
}
