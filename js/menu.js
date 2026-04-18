// --------- ESTADO ---------

let selectedCharacter = null;
let muted = false;

// --------- SELECCIÓN DE PERSONAJE ---------

function selectCharacter(char) {
  selectedCharacter = char;

  // Quitar selección anterior
  document.querySelectorAll(".hero-card").forEach(card => {
    card.classList.remove("selected");
  });

  // Marcar el seleccionado
  document.getElementById("hero-" + char).classList.add("selected");
}

// --------- INICIAR PARTIDA ---------

function startGame() {
  if (!selectedCharacter) {
    alert("¡Elegí un personaje primero!");
    return;
  }

  localStorage.setItem("character", selectedCharacter);
  window.location.href = "game.html";
}

// --------- MODALES ---------

function openModal(id) {
  document.getElementById(id).classList.remove("hidden");
}

function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}

// Cerrar modal clickeando fuera del box
document.querySelectorAll(".modal").forEach(modal => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });
});

// --------- MUTE ---------

function toggleMute() {
  muted = !muted;
  document.getElementById("mute-btn").innerText = muted ? "🔇" : "🔊";
  // Cuando haya audio, acá se silencia/activa
}
