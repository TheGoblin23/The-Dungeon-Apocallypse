// --------- HEROES ---------

export const HEROES = {
  guerrero: {
    name: "Guerrero",
    maxHp: 100,
    bonusDamage: 1,
    ability: "rage"
  },

  mago: {
    name: "Mago",
    maxHp: 85,
    bonusMana: 2,
    ability: "draw"
  },

  ladron: {
    name: "Ladrón",
    maxHp: 90,
    dodge: 1,
    ability: "double"
  }
};

// --------- CREAR PLAYER ---------

export function createPlayer(heroKey) {
  const base = HEROES[heroKey];

  return {
    ...base,
    hp: base.maxHp,
    energy: 0,
    hand: [],
    deck: [],
    discard: [],
    abilityUsed: false,
    tempDamageBonus: 0,
    doubleDice: false
  };
}

// --------- HABILIDADES ---------

export function useAbility(player) {
  if (player.abilityUsed) return false;

  switch (player.ability) {

    case "rage":
      // Guerrero: +3 de daño en todas las cartas este turno
      player.tempDamageBonus = 3;
      break;

    case "draw":
      // Mago: +3 de energía extra este turno
      player.energy += 3;
      break;

    case "double":
      // Ladrón: señal para tirar dados dos veces en rollDice
      player.doubleDice = true;
      break;
  }

  player.abilityUsed = true;
  return true;
}

// --------- RESET POR TURNO ---------

export function resetTurn(player) {
  player.energy = 0;
  player.abilityUsed = false;
  player.tempDamageBonus = 0;
  player.doubleDice = false;
}

// --------- DAÑO ---------

export function applyDamage(player, dmg) {
  let finalDamage = dmg;

  // esquiva del ladrón
  if (player.dodge) {
    finalDamage -= player.dodge;
  }

  if (finalDamage < 0) finalDamage = 0;

  player.hp -= finalDamage;
}