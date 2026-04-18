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
    abilityUsed: false
  };
}

// --------- HABILIDADES ---------

export function useAbility(player, context) {
  if (player.abilityUsed) return;

  switch (player.ability) {

    case "rage":
      // Guerrero: +2 daño este turno
      context.tempDamageBonus += 2;
      break;

    case "draw":
      // Mago: roba 1 carta extra
      context.drawCards(1);
      break;

    case "double":
      // Ladrón: efecto se maneja en dados
      break;
  }

  player.abilityUsed = true;
}

// --------- RESET POR TURNO ---------

export function resetTurn(player) {
  player.energy = 0;
  player.abilityUsed = false;
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