let selectedCharacter = null;

function selectCharacter(char) {
  selectedCharacter = char;
  alert("Elegiste: " + char);
}

function startGame() {
  if (!selectedCharacter) {
    alert("Elegí un personaje primero");
    return;
  }

  localStorage.setItem("character", selectedCharacter);
  window.location.href = "game.html";
}