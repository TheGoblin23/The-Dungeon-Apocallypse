// --------- IMPORTS ---------
import { createPlayer, applyDamage, resetTurn } from "./player.js";
import { CARDS, playCard } from "./cards.js";
import { createEnemy, enemyAttack } from "./enemy.js";

// --------- ESTADO GLOBAL ---------

let gameOver = false;

const character = localStorage.getItem("character") || "guerrero";

// --------- PLAYER / ENEMY ---------

let enemy = createEnemy();

// --------- CARTAS ---------

const cards = CARDS;

// --------- UI ---------

function updateUI() {
  document.getElementById("player-name").innerText = player.name;
  document.getElementById("player-hp").innerText = player.hp;
  document.getElementById("enemy-hp").innerText = enemy.hp;
  document.getElementById("energy").innerText = player.energy;
  document.getElementById("enemy-name").innerText = enemy.name;

  // barras de vida
  document.getElementById("player-hp-bar").style.width =
    (player.hp / player.maxHp) * 100 + "%";

  document.getElementById("enemy-hp-bar").style.width =
    (enemy.hp / enemy.maxHp) * 100 + "%";
}

// --------- DADOS ---------

function rollDice() {
  if (gameOver) return;

  let d1 = Math.floor(Math.random() * 6) + 1;
  let d2 = Math.floor(Math.random() * 6) + 1;

  let total = d1 + d2;

  player.energy = total;

  // bonus mago
  if (player.bonusMana) {
    player.energy += player.bonusMana;
  }

  document.getElementById("dice-result").innerText = `${d1} + ${d2} = ${total}`;

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
    return alert("No tenés energía suficiente");
  }

  updateUI();
  checkGameState();
}

// --------- IA ---------

function enemyTurn() {
  if (gameOver) return;

  setTimeout(() => {
    enemyAttack(enemy, player, applyDamage);

    updateUI();
    checkGameState();
  }, 600);
}

// --------- TURNO ---------

function endTurn() {
  if (gameOver) return;

  resetTurn(player); // 🔥 manejo limpio del turno
  enemyTurn();
}

// --------- GAME STATE ---------

function checkGameState() {
  if (enemy.hp <= 0) {
    gameOver = true;
    showResult("🎉 GANASTE");
  }

  if (player.hp <= 0) {
    gameOver = true;
    showResult("💀 PERDISTE");
  }
}

// --------- RESULTADO ---------

function showResult(text) {
  const screen = document.getElementById("result-screen");
  const textEl = document.getElementById("result-text");

  textEl.innerText = text;
  screen.classList.remove("hidden");
}

// --------- RESET / NAV ---------

function restartGame() {
  location.reload();
}

function goToMenu() {
  window.location.href = "index.html";
}

// --------- INIT ---------

renderCards();
updateUI();