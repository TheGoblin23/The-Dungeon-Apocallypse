// --------- ENEMIGOS ---------

export const ENEMIES = [
  {
    id: "goblin",
    name: "Goblin",
    maxHp: 100,
    attackMin: 3,
    attackMax: 8
  },
  {
    id: "orc",
    name: "Orco",
    maxHp: 120,
    attackMin: 5,
    attackMax: 10
  },
  {
    id: "skeleton",
    name: "Esqueleto",
    maxHp: 80,
    attackMin: 4,
    attackMax: 7
  }
];

// --------- CREAR ENEMIGO ---------

export function createEnemy() {
  const base = ENEMIES[Math.floor(Math.random() * ENEMIES.length)];

  return {
    ...base,
    hp: base.maxHp
  };
}

// --------- ATAQUE ENEMIGO ---------

export function enemyAttack(enemy, player, applyDamage) {
  let dmg =
    Math.floor(Math.random() * (enemy.attackMax - enemy.attackMin + 1)) +
    enemy.attackMin;

  applyDamage(player, dmg);

  // Retorna el daño para que game.js pueda mostrarlo en la UI
  return dmg;
}