// --------- DEFINICIÓN DE CARTAS ---------

export const CARDS = [
  {
    id: "attack",
    name: "Ataque",
    cost: 3,
    description: "Hace 6 de daño",
    effect: ({ player, enemy }) => {
      const dmg = 6 + (player.bonusDamage || 0) + (player.tempDamageBonus || 0);
      enemy.hp -= dmg;
    }
  },

  {
    id: "heavy",
    name: "Golpe Fuerte",
    cost: 5,
    description: "Hace 10 de daño",
    effect: ({ player, enemy }) => {
      const dmg = 10 + (player.bonusDamage || 0) + (player.tempDamageBonus || 0);
      enemy.hp -= dmg;
    }
  },

  {
    id: "heal",
    name: "Curar",
    cost: 4,
    description: "Recupera 6 HP",
    effect: ({ player }) => {
      player.hp += 6;
      if (player.hp > player.maxHp) {
        player.hp = player.maxHp;
      }
    }
  }
];

// --------- EJECUTAR CARTA ---------

export function playCard(card, context) {
  if (context.player.energy < card.cost) {
    return false;
  }

  context.player.energy -= card.cost;

  // ejecuta efecto
  card.effect(context);

  return true;
}