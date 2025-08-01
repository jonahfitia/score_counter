let players = [];
let countdown = null;
let currentAudio = null;

const countdownAudio = document.getElementById("countdownSound");
const endAudio = document.getElementById("endSound");

// Affiche la page sélectionnée, cache les autres
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// Charger les joueurs depuis localStorage
function loadPlayers() {
  const stored = localStorage.getItem("players");
  if (stored) {
    players = JSON.parse(stored);
  } else {
    players = [];
  }
}

// Sauvegarder les joueurs dans localStorage
function savePlayers() {
  localStorage.setItem("players", JSON.stringify(players));
}

// Ajouter un nouveau joueur
function addPlayer() {
  const name = document.getElementById("playerName").value.trim();
  const district = document.getElementById("playerDistrict").value;
  const section = document.getElementById("playerSection").value;
  const imageFile = document.getElementById("playerImage").files[0];

  if (!name || !district || !section) {
    alert("Fenoy anarana, distrika, ary section");
    return;
  }

  if (imageFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      addPlayerToList(name, district, section, e.target.result);
    };
    reader.readAsDataURL(imageFile);
  } else {
    addPlayerToList(name, district, section, "");
  }

  // Reset form
  document.getElementById("playerName").value = "";
  document.getElementById("playerDistrict").value = "";
  document.getElementById("playerSection").value = "";
  document.getElementById("playerImage").value = "";
}

// Fonction pour ajouter le joueur dans la liste et mettre à jour
function addPlayerToList(name, district, section, image) {
  const player = {
    name,
    district,
    section,
    image,
    score: 0,
  };
  players.push(player);
  savePlayers();
  renderAllSections();
  renderPlayerList();
}

// Afficher la liste des joueurs (max 16) dans la page d'ajout
function renderPlayerList() {
  const listContainer = document.getElementById("playerList");
  listContainer.innerHTML = "";

  const visiblePlayers = players.slice(0, 16);

  visiblePlayers.forEach((p, index) => {
    const card = document.createElement("div");
    card.className = "player-card";
    card.innerHTML = `
      <img src="${p.image || 'logo/default.jpg'}" alt="Image de ${p.name}" />
      <h4>${p.name}</h4>
      <p>📍 ${p.district}</p>
      <p>🎖️ ${p.section}</p>
      <button onclick="deletePlayer(${index})">🗑️</button>
    `;
    listContainer.appendChild(card);
  });
}

// Supprimer un joueur
function deletePlayer(index) {
  if (confirm("Hafafana ve ity mpifaninana ity?")) {
    players.splice(index, 1);
    savePlayers();
    renderPlayerList();
    renderAllSections();
  }
}

// Modifier le score d'un joueur
function changeScore(name, delta) {
  const player = players.find(p => p.name === name);
  if (player) {
    player.score += delta;
    savePlayers();
    renderAllSections();
  }
}

// Afficher tous les joueurs triés par section dans leurs pages respectives
function renderAllSections() {
  const sections = ["aventurier", "explorateur", "ambassadeur", "jeune"];
  sections.forEach(sec => {
    const container = document.getElementById(`players_${sec}`);
    if (!container) return;
    container.innerHTML = "";

    // On prend jusqu'à 4 joueurs max
    const playersInSection = players.filter(p => p.section.toLowerCase() === sec).slice(0, 4);

    playersInSection.forEach(p => {
      const div = document.createElement("div");
      div.className = "player";
      div.innerHTML = `
        <div class="player-header">
          <h4>${p.name}</h4>
          <small>${p.district}</small>
        </div>
        ${p.image ? `<img src="${p.image}" alt="Image de ${p.name}" />` : ""}
        <p class="score"><strong>Score: ${p.score}</strong></p>
        <div class="score-buttons">
          ${[5, 2, 1].map(n => `<button onclick="changeScore('${p.name}', -${n})">-${n}</button>`).join(" ")}
          ${[1, 2, 5].map(n => `<button onclick="changeScore('${p.name}', ${n})">+${n}</button>`).join(" ")}
        </div>
      `;
      container.appendChild(div);
    });
  });
}

// Timer pour chaque section
function startTimer(section) {
  clearInterval(countdown);
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  const time = parseInt(document.getElementById(`timeSelect_${section}`).value);
  let timer = time;
  document.getElementById(`timer_${section}`).innerText = timer;

  countdownAudio.currentTime = 0;
  countdownAudio.play();
  currentAudio = countdownAudio;

  countdown = setInterval(() => {
    timer--;
    document.getElementById(`timer_${section}`).innerText = timer;
    if (timer <= 0) {
      clearInterval(countdown);
      countdownAudio.pause();
      countdownAudio.currentTime = 0;
      endAudio.play();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(countdown);
  if (currentAudio) currentAudio.pause();
}

function resetTimer() {
  clearInterval(countdown);
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  document.querySelectorAll("[id^='timer_']").forEach(span => {
    span.innerText = "0";
  });
}

// Exporter les résultats dans un fichier texte
function exportResults() {
  let text = "";
  const sections = ["Aventurier", "Explorateur", "Ambassadeur", "Jeune Adulte"];
  sections.forEach(sec => {
    text += `== Résultats ${sec} ==\n`;
    players
      .filter(p => p.section.toLowerCase() === sec.toLowerCase())
      .forEach(p => {
        text += `Nom: ${p.name}, Distrika: ${p.district}, Score: ${p.score}\n`;
      });
    text += "\n";
  });

  document.getElementById("finalResults").innerText = text;

  const blob = new Blob([text], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "resultats_best.txt";
  link.click();
}

// Au chargement de la page, charger la liste et afficher la page "add"
window.onload = function () {
  loadPlayers();
  renderPlayerList();
  renderAllSections();
  showPage('add');
};