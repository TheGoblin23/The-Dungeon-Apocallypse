// --------- IMPORTS ---------
import { createPlayer, applyDamage, resetTurn, useAbility } from "./player.js";
import { CARDS, playCard } from "./cards.js";
import { createEnemy, enemyAttack } from "./enemy.js";

// --------- ESTADO GLOBAL ---------

let gameOver = false;
let diceRolled = false;

const character = localStorage.getItem("character") || "guerrero";

// --------- INIT PLAYER / ENEMY ---------
// FIX: player ahora se crea correctamente con el personaje del localStorage
let player = createPlayer(character);
let enemy = createEnemy();

// --------- CARTAS ---------

const cards = CARDS;

// --------- UI ---------

function updateUI() {
  document.getElementById("player-name").innerText = player.name;
  document.getElementById("player-hp").innerText = player.hp;
  document.getElementById("enemy-hp").innerText = enemy.hp;
  document.getElementById("energy").innerText = player.energy;

  // FIX: enemy-name existe ahora en el HTML
  document.getElementById("enemy-name").innerText = enemy.name;

  // FIX: barras de vida existen ahora en el HTML
  document.getElementById("player-hp-bar").style.width =
    (player.hp / player.maxHp) * 100 + "%";

  document.getElementById("enemy-hp-bar").style.width =
    (enemy.hp / enemy.maxHp) * 100 + "%";
}

// --------- DADOS ---------

function rollDice() {
  if (gameOver) return;
  if (diceRolled) {
    alert("Ya tiraste los dados este turno. ¡Terminá el turno primero!");
    return;
  }

  let d1 = Math.floor(Math.random() * 6) + 1;
  let d2 = Math.floor(Math.random() * 6) + 1;
  let total = d1 + d2;

  // Ladrón: tira dos veces y se queda con el mayor
  if (player.doubleDice) {
    let d3 = Math.floor(Math.random() * 6) + 1;
    let d4 = Math.floor(Math.random() * 6) + 1;
    let total2 = d3 + d4;

    if (total2 > total) {
      d1 = d3; d2 = d4; total = total2;
    }

    document.getElementById("dice-result").innerText =
      `🎲 Tirada 1: ${d1} + ${d2} | Tirada 2: ${d3} + ${d4} → Mejor: ${total}`;
  } else {
    document.getElementById("dice-result").innerText = `${d1} + ${d2} = ${total}`;
  }

  player.energy = total;

  // bonus mago
  if (player.bonusMana) {
    player.energy += player.bonusMana;
  }

  diceRolled = true;
  updateUI();
}

// --------- CARTAS ---------

function renderCards() {
  const hand = document.getElementById("hand");
  hand.innerHTML = "";

  cards.forEach((card, index) => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h4>${card.name}</h4>
      <p>${card.description}</p>
      <p>Costo: ${card.cost}</p>
    `;

    div.onclick = () => playCardHandler(index);
    hand.appendChild(div);
  });
}

function playCardHandler(index) {
  if (gameOver) return;

  const card = cards[index];
  const success = playCard(card, { player, enemy });

  if (!success) {
    alert("No tenés energía suficiente");
    return;
  }

  updateUI();
  checkGameState();
}

// --------- HABILIDAD ---------

function activateAbility() {
  if (gameOver) return;

  const success = useAbility(player);

  if (!success) {
    alert("Ya usaste tu habilidad este turno.");
    return;
  }

  updateUI();
}

// --------- IA ---------

function enemyTurn() {
  if (gameOver) return;

  setTimeout(() => {
    const dmg = enemyAttack(enemy, player, applyDamage);
    document.getElementById("dice-result").innerText =
      `⚔️ ${enemy.name} te atacó por ${dmg} de daño`;
    updateUI();
    checkGameState();
  }, 600);
}

// --------- TURNO ---------

function endTurn() {
  if (gameOver) return;

  diceRolled = false;
  resetTurn(player);
  enemyTurn();
}

// --------- GAME STATE ---------

function checkGameState() {
  if (enemy.hp <= 0) {
    enemy.hp = 0;
    updateUI();
    gameOver = true;
    showResult("🎉 GANASTE");
    return;
  }

  if (player.hp <= 0) {
    player.hp = 0;
    updateUI();
    gameOver = true;
    showResult("💀 PERDISTE");
  }
}

// --------- RESULTADO ---------

function showResult(text) {
  // Busca el elemento, si no existe lo crea en el body
  let screen = document.getElementById("result-screen");

  if (!screen) {
    screen = document.createElement("div");
    screen.id = "result-screen";
    screen.className = "result";
    document.body.appendChild(screen);
  }

  screen.innerHTML = `
    <h1>${text}</h1>
    <div class="result-buttons">
      <button class="next-btn" onclick="nextLevel()">⚔️ Siguiente Nivel</button>
      <button class="menu-btn" onclick="goToMenu()">🏠 Menú</button>
    </div>
  `;

  screen.classList.remove("hidden");
}

// --------- SIGUIENTE NIVEL ---------
// Por ahora reinicia el juego. En el futuro navegar a nivel siguiente.
function nextLevel() {
  location.reload();
}

// --------- RESET / NAV ---------

function restartGame() {
  location.reload();
}

function goToMenu() {
  window.location.href = "index.html";
}

// --------- EXPONER FUNCIONES AL HTML ---------
// FIX: como el script es type="module", los onclick del HTML no encuentran
// las funciones si no las exponemos explícitamente en window
window.rollDice = rollDice;
window.endTurn = endTurn;
window.restartGame = restartGame;
window.goToMenu = goToMenu;
window.nextLevel = nextLevel;
window.activateAbility = activateAbility;

// --------- ARRANQUE ---------

renderCards();
updateUI();