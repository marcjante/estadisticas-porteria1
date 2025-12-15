// ===== ESTADO GLOBAL =====
const state = {
  config: {
    local: { 
      name: "", 
      goalkeepers: [], 
      fieldPlayers: [],
      createdAt: new Date().toISOString()
    },
  },
  active: {
    local: { 
      goalkeeper: null, 
      players: [],
      formation: "4-0"
    },
  },
  match: {
    startTime: null,
    manualSeconds: 0,
    timerId: null,
    timerRunning: false,
    period: 1,
    score: { local: 0 },
    events: [],
    chat: [],
    currentPlayerWithVoice: null,
    goalkeeperStats: {
      saves: 0,
      goals: 0,
      outs: 0,
      efficiency: 0
    },
    metadata: {
      date: new Date().toLocaleDateString('es-ES'),
      location: "",
      referee: ""
    }
  }
};

// ===== CONSTANTES =====
const EVENT_TYPES = {
  'Gol': { icon: '⚽', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.2)' },
  'Tiro dentro': { icon: '🎯', color: '#0ea5e9', bgColor: 'rgba(14, 165, 233, 0.2)' },
  'Tiro fuera': { icon: '📍', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.2)' },
  'Tiro fallado': { icon: '❌', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.2)' },
  'Falta': { icon: '⚠️', color: '#fb923c', bgColor: 'rgba(251, 146, 60, 0.2)' },
  'Balón perdido': { icon: '🔴', color: '#ec4899', bgColor: 'rgba(236, 72, 153, 0.2)' },
  'Balón recuperado': { icon: '🟢', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.2)' },
  'Parada del portero': { icon: '🧤', color: '#0ea5e9', bgColor: 'rgba(14, 165, 233, 0.2)' },
  'Gol encajado': { icon: '⚽', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.2)' },
  'Comentario por voz': { icon: '🗣️', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.2)' }
};

// ===== UTILIDADES =====
function $(id) { 
  return document.getElementById(id); 
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatDate(date) {
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatDateTime(date) {
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ===== GESTIÓN DE PASOS =====
function changeStep(step) {
  // Actualizar visual de pasos
  document.querySelectorAll('.progress-step').forEach(el => {
    el.classList.toggle('active', parseInt(el.dataset.step) === step);
  });
  
  document.querySelectorAll('.tab').forEach(el => {
    el.classList.toggle('active', parseInt(el.dataset.step) === step);
  });
  
  // Mostrar/ocultar secciones
  document.querySelectorAll('.step-card').forEach(el => {
    el.classList.toggle('hidden', el.id !== `step-${step}`);
  });
  
  // Inicializar paso si es necesario
  if (step === 3 && !state.match.startTime) {
    initializeMatch();
  }
}

function canNavigateToStep(step) {
  switch(step) {
    case 2:
      const localName = $('local-name').value.trim();
      if (!localName) {
        showValidationError('Debes ingresar el nombre del equipo');
        return false;
      }
      return true;
      
    case 3:
      const selectedGk = document.querySelectorAll('input[data-type="gk"]:checked').length;
      const selectedPlayers = document.querySelectorAll('input[data-type="fld"]:checked').length;
      
      if (selectedGk !== 1) {
        showValidationError('Debes seleccionar exactamente 1 portero');
        return false;
      }
      
      if (selectedPlayers !== 4) {
        showValidationError('Debes seleccionar exactamente 4 jugadores de pista');
        return false;
      }
      
      return true;
      
    default:
      return true;
  }
}

// ===== VALIDACIÓN Y MENSAJES =====
function showValidationError(message, duration = 5000) {
  const errorDiv = $('#validation-error');
  errorDiv.innerHTML = `
    <i class="fas fa-exclamation-triangle"></i>
    <div class="message">${message}</div>
    <i class="fas fa-times" onclick="this.parentElement.classList.add('hidden')"></i>
  `;
  errorDiv.classList.remove('hidden');
  
  if (duration > 0) {
    setTimeout(() => {
      errorDiv.classList.add('hidden');
    }, duration);
  }
}

function showSuccessMessage(message, duration = 3000) {
  const errorDiv = $('#validation-error');
  errorDiv.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <div class="message">${message}</div>
    <i class="fas fa-times" onclick="this.parentElement.classList.add('hidden')"></i>
  `;
  errorDiv.style.background = 'linear-gradient(135deg, #10b981, #059669)';
  errorDiv.classList.remove('hidden');
  
  if (duration > 0) {
    setTimeout(() => {
      errorDiv.classList.add('hidden');
      errorDiv.style.background = '';
    }, duration);
  }
}

// ===== PASO 1: CONFIGURACIÓN =====
function initializeStep1() {
  // Limpiar formulario
  $('#clear-step1').addEventListener('click', () => {
    if (confirm('¿Estás seguro de que quieres limpiar todos los campos?')) {
      $('#local-name').value = '';
      for (let i = 1; i <= 2; i++) $(`local-gk${i}`).value = '';
      for (let i = 1; i <= 8; i++) $(`local-p${i}`).value = '';
      showSuccessMessage('Formulario limpiado correctamente');
    }
  });
  
  // Validar en tiempo real
  $('#local-name').addEventListener('input', () => {
    updateTabStates();
  });
  
  // Siguiente paso
  $('#to-step-2').addEventListener('click', () => {
    if (!canNavigateToStep(2)) return;
    
    saveTeamConfig();
    renderActiveSelection();
    changeStep(2);
  });
}

function saveTeamConfig() {
  const localName = $('#local-name').value.trim() || 'Equipo Local';
  state.config.local.name = localName;
  
  // Leer porteros
  const goalkeepers = [];
  for (let i = 1; i <= 2; i++) {
    const name = $(`local-gk${i}`).value.trim() || `Portero ${i}`;
    goalkeepers.push({
      id: `gk${i}`,
      name: name,
      number: i,
      isDefault: !$(`local-gk${i}`).value.trim()
    });
  }
  
  // Leer jugadores
  const fieldPlayers = [];
  for (let i = 1; i <= 8; i++) {
    const name = $(`local-p${i}`).value.trim() || `Jugador ${i}`;
    fieldPlayers.push({
      id: `p${i}`,
      name: name,
      number: i,
      isDefault: !$(`local-p${i}`).value.trim()
    });
  }
  
  state.config.local.goalkeepers = goalkeepers;
  state.config.local.fieldPlayers = fieldPlayers;
}

// ===== PASO 2: SELECCIÓN DE JUGADORES =====
function renderActiveSelection() {
  const localTitle = $('#active-local-title');
  localTitle.innerHTML = `<i class="fas fa-users"></i> ${state.config.local.name}`;
  
  // Renderizar porteros
  const gkList = $('#local-gk-list');
  gkList.innerHTML = '';
  
  state.config.local.goalkeepers.forEach(player => {
    const card = createCheckboxCard('local', 'gk', player);
    gkList.appendChild(card);
  });
  
  // Renderizar jugadores
  const fieldList = $('#local-field-list');
  fieldList.innerHTML = '';
  
  state.config.local.fieldPlayers.forEach(player => {
    const card = createCheckboxCard('local', 'fld', player);
    fieldList.appendChild(card);
  });
  
  updateSelectionCounters();
}

function createCheckboxCard(team, type, player) {
  const wrapper = document.createElement('label');
  wrapper.className = `checkbox-card ${type === 'gk' ? 'portero' : ''}`;
  wrapper.title = `Click para seleccionar`;
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.dataset.team = team;
  checkbox.dataset.type = type;
  checkbox.dataset.id = player.id;
  
  const playerInfo = document.createElement('div');
  playerInfo.className = 'player-info';
  
  const nameSpan = document.createElement('span');
  nameSpan.className = 'player-name-small';
  nameSpan.textContent = player.name;
  
  const numberSpan = document.createElement('span');
  numberSpan.className = 'player-number';
  numberSpan.textContent = `#${player.number}`;
  
  playerInfo.appendChild(nameSpan);
  playerInfo.appendChild(numberSpan);
  
  const icon = document.createElement('i');
  icon.className = type === 'gk' ? 'fas fa-shield-alt' : 'fas fa-running';
  
  wrapper.appendChild(checkbox);
  wrapper.appendChild(icon);
  wrapper.appendChild(playerInfo);
  
  checkbox.addEventListener('change', () => {
    validateSelection(team, type);
    updateSelectionCounters();
    updateTabStates();
    
    // Actualizar estilo visual
    wrapper.classList.toggle('active', checkbox.checked);
    
    // Feedback táctil
    if (checkbox.checked) {
      wrapper.style.transform = 'scale(1.05)';
      setTimeout(() => {
        wrapper.style.transform = '';
      }, 200);
    }
  });
  
  return wrapper;
}

function validateSelection(team, type) {
  const checkboxes = document.querySelectorAll(`input[data-team="${team}"][data-type="${type}"]`);
  const max = type === 'gk' ? 1 : 4;
  const selected = Array.from(checkboxes).filter(cb => cb.checked);
  
  if (selected.length > max) {
    // Desmarcar el último seleccionado
    selected[selected.length - 1].checked = false;
    selected[selected.length - 1].parentElement.classList.remove('active');
  }
}

function updateSelectionCounters() {
  const gkCount = document.querySelectorAll('input[data-type="gk"]:checked').length;
  const playerCount = document.querySelectorAll('input[data-type="fld"]:checked').length;
  
  const gkCounter = $('#local-gk-counter');
  gkCounter.textContent = `${gkCount}/1 porteros seleccionados`;
  gkCounter.className = `selection-counter ${gkCount > 1 ? 'warning' : ''}`;
  
  const playerCounter = $('#local-fld-counter');
  playerCounter.textContent = `${playerCount}/4 jugadores seleccionados`;
  playerCounter.className = `selection-counter ${playerCount > 4 ? 'warning' : ''}`;
}

function updateTabStates() {
  document.querySelectorAll('.tab').forEach(tab => {
    const step = parseInt(tab.dataset.step);
    if (step > 1) {
      const canAccess = canNavigateToStep(step);
      tab.classList.toggle('disabled', !canAccess);
    }
  });
}

// ===== PASO 3: PARTIDO =====
function initializeMatch() {
  state.match.startTime = new Date();
  state.match.manualSeconds = 0;
  state.match.period = 1;
  state.match.score.local = 0;
  state.match.events = [];
  state.match.chat = [];
  state.match.goalkeeperStats = { saves: 0, goals: 0, outs: 0, efficiency: 0 };
  
  // Actualizar fecha en el marcador
  $('#match-date').textContent = formatDate(new Date());
  
  // Actualizar nombre del equipo
  $('#match-local-title').innerHTML = 
    `<i class="fas fa-users"></i> ${state.config.local.name}`;
  
  // Renderizar jugadores activos
  renderActivePlayers();
  
  // Actualizar portero actual
  updateCurrentGoalkeeper();
  
  // Iniciar temporizador
  startTimer();
  
  // Agregar evento inicial
  addSystemEvent('Partido iniciado');
}

function renderActivePlayers() {
  const container = $('#match-local-players');
  container.innerHTML = '';
  
  // Portero
  if (state.active.local.goalkeeper) {
    const gkCard = createPlayerCard('local', state.active.local.goalkeeper, true);
    container.appendChild(gkCard);
  }
  
  // Jugadores
  state.active.local.players.forEach(player => {
    const playerCard = createPlayerCard('local', player, false);
    container.appendChild(playerCard);
  });
}

function createPlayerCard(team, player, isGoalkeeper) {
  const card = document.createElement('div');
  card.className = `player-card ${isGoalkeeper ? 'portero' : ''}`;
  card.dataset.team = team;
  card.dataset.id = player.id;
  card.dataset.role = isGoalkeeper ? 'Portero' : 'Jugador';
  
  const name = document.createElement('div');
  name.className = 'player-name';
  name.textContent = player.name;
  
  const role = document.createElement('div');
  role.className = 'player-role';
  role.innerHTML = `${isGoalkeeper ? '🧤' : '⚽'} ${isGoalkeeper ? 'Portero' : 'Jugador'}`;
  
  const stats = document.createElement('div');
  stats.className = 'player-stats';
  
  const events = document.createElement('div');
  events.className = 'event-count';
  events.textContent = 'Eventos: 0';
  card.dataset.eventsCount = '0';
  
  const voiceIndicator = document.createElement('div');
  voiceIndicator.className = 'voice-indicator';
  voiceIndicator.id = `voice-${team}-${player.id}`;
  
  stats.appendChild(events);
  
  card.appendChild(name);
  card.appendChild(role);
  card.appendChild(stats);
  card.appendChild(voiceIndicator);
  
  // Eventos
  card.addEventListener('click', () => openEventModal(card));
  card.addEventListener('dblclick', () => {
    // Doble click para marcar como jugador con voz activa
    state.match.currentPlayerWithVoice = {
      team: team,
      playerId: player.id,
      playerName: player.name
    };
    updateVoicePlayerIndicator();
    showSuccessMessage(`${player.name} seleccionado para comentarios por voz`, 2000);
  });
  
  return card;
}

function updateCurrentGoalkeeper() {
  if (state.active.local.goalkeeper) {
    $('#current-goalkeeper').textContent = state.active.local.goalkeeper.name;
  }
}

// ===== TEMPORIZADOR =====
function startTimer() {
  if (state.match.timerId) clearInterval(state.match.timerId);
  
  state.match.timerRunning = true;
  $('#toggle-time').innerHTML = '<i class="fas fa-pause"></i> Pausar tiempo';
  
  state.match.timerId = setInterval(() => {
    state.match.manualSeconds++;
    $('#match-time').textContent = formatTime(state.match.manualSeconds);
  }, 1000);
}

function pauseTimer() {
  if (state.match.timerId) {
    clearInterval(state.match.timerId);
    state.match.timerId = null;
  }
  state.match.timerRunning = false;
  $('#toggle-time').innerHTML = '<i class="fas fa-play"></i> Reanudar tiempo';
}

function resetTimer() {
  state.match.manualSeconds = 0;
  $('#match-time').textContent = '00:00';
  addSystemEvent('Temporizador reiniciado');
}

function changePeriod() {
  state.match.period++;
  $('#match-period').textContent = `${state.match.period}ª`;
  addSystemEvent(`Cambio a ${state.match.period}ª parte`);
}

// ===== EVENTOS DEL PARTIDO =====
function openEventModal(playerCard) {
  const team = playerCard.dataset.team;
  const playerId = playerCard.dataset.id;
  const playerName = playerCard.querySelector('.player-name').textContent;
  const role = playerCard.dataset.role;
  
  // Establecer jugador actual para comentarios por voz
  state.match.currentPlayerWithVoice = {
    team: team,
    playerId: playerId,
    playerName: playerName,
    role: role
  };
  
  updateVoicePlayerIndicator();
  
  // Crear modal
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-title">${playerName}</div>
      <div class="modal-subtitle">
        ${state.config.local.name} • ${role}
        <br>
        <small style="color: #8b5cf6; margin-top: 4px; display: block;">
          <i class="fas fa-microphone"></i> Comentarios por voz activados para este jugador
        </small>
      </div>
      
      <div class="event-buttons">
        ${Object.entries(EVENT_TYPES).filter(([key]) => 
          !key.includes('Parada') && !key.includes('Gol encajado') && !key.includes('Comentario')
        ).map(([type, data]) => `
          <button class="event-btn event-${type.toLowerCase().replace(/\s+/g, '-')}" 
                  data-type="${type}">
            ${data.icon} ${type}
            <small>${getEventDescription(type)}</small>
          </button>
        `).join('')}
        
        <button class="event-btn event-cancel" data-type="cancel">
          <i class="fas fa-times"></i> Cancelar
        </button>
      </div>
    </div>
  `;
  
  $('#modal-root').innerHTML = '';
  $('#modal-root').appendChild(modal);
  $('#modal-root').classList.remove('hidden');
  
  // Event listeners para botones
  modal.querySelectorAll('.event-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      if (type !== 'cancel') {
        registerEvent(team, playerId, playerName, type, playerCard);
      }
      $('#modal-root').classList.add('hidden');
    });
  });
  
  // Cerrar al hacer clic fuera
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      $('#modal-root').classList.add('hidden');
    }
  });
}

function getEventDescription(type) {
  const descriptions = {
    'Gol': 'Añade un gol al marcador',
    'Tiro dentro': 'Tiro dentro del área',
    'Tiro fuera': 'Tiro fuera del área',
    'Tiro fallado': 'Oportunidad fallada',
    'Falta': 'Falta cometida',
    'Balón perdido': 'Pérdida de posesión',
    'Balón recuperado': 'Recuperación de balón'
  };
  return descriptions[type] || '';
}

function registerEvent(team, playerId, playerName, type, playerCard) {
  const time = formatTime(state.match.manualSeconds);
  const period = state.match.period;
  const teamName = state.config.local.name;
  
  // Crear evento
  const event = {
    id: Date.now(),
    timestamp: new Date(),
    time: time,
    period: period,
    team: team,
    teamName: teamName,
    playerId: playerId,
    playerName: playerName,
    type: type,
    icon: EVENT_TYPES[type]?.icon || '📝'
  };
  
  state.match.events.push(event);
  
  // Actualizar contador del jugador
  const currentCount = parseInt(playerCard.dataset.eventsCount) || 0;
  const newCount = currentCount + 1;
  playerCard.dataset.eventsCount = newCount;
  playerCard.querySelector('.event-count').textContent = `Eventos: ${newCount}`;
  
  // Actualizar marcador si es gol
  if (type === 'Gol') {
    state.match.score.local++;
    updateScoreboard();
  }
  
  // Renderizar evento en la lista
  renderEvent(event);
  
  // Agregar mensaje al chat
  addChatMessage('system', `${playerName}: ${type}`, time);
  
  // Feedback visual
  playerCard.style.animation = 'none';
  setTimeout(() => {
    playerCard.style.animation = 'pulse 0.5s';
  }, 10);
}

function renderEvent(event) {
  const eventsList = $('#events-list');
  
  // Remover estado vacío si existe
  const emptyState = eventsList.querySelector('.empty-state');
  if (emptyState) {
    emptyState.remove();
  }
  
  const eventElement = document.createElement('div');
  eventElement.className = 'event-item';
  eventElement.dataset.id = event.id;
  
  const typeClass = event.type.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  
  eventElement.innerHTML = `
    <div class="event-time">${event.time}</div>
    <div class="event-period">${event.period}ª</div>
    <div class="event-player">${event.playerName}</div>
    <div class="event-type ${typeClass}">
      ${event.icon} ${event.type}
    </div>
  `;
  
  eventsList.prepend(eventElement);
  
  // Limitar lista a 50 eventos
  const allEvents = eventsList.querySelectorAll('.event-item');
  if (allEvents.length > 50) {
    allEvents[allEvents.length - 1].remove();
  }
  
  // Scroll automático
  eventsList.scrollTop = 0;
}

function addSystemEvent(message) {
  const event = {
    id: Date.now(),
    timestamp: new Date(),
    time: formatTime(state.match.manualSeconds),
    period: state.match.period,
    type: 'Sistema',
    message: message,
    icon: 'ℹ️'
  };
  
  state.match.events.push(event);
  addChatMessage('system', message, event.time);
}

// ===== ESTADÍSTICAS DE PORTERÍA =====
function updateGoalkeeperStats() {
  const stats = state.match.goalkeeperStats;
  
  // Actualizar valores
  $('#gk-saves').textContent = stats.saves;
  $('#gk-goals').textContent = stats.goals;
  $('#gk-outs').textContent = stats.outs;
  
  // Calcular eficacia
  const totalShots = stats.saves + stats.goals;
  stats.efficiency = totalShots > 0 ? 
    Math.round((stats.saves / totalShots) * 100) : 0;
  
  $('#gk-efficiency').textContent = `${stats.efficiency}%`;
}

function registerGoalkeeperEvent(type) {
  if (!state.active.local.goalkeeper) return;
  
  const goalkeeper = state.active.local.goalkeeper;
  const time = formatTime(state.match.manualSeconds);
  const period = state.match.period;
  
  // Actualizar estadísticas
  switch(type) {
    case 'save':
      state.match.goalkeeperStats.saves++;
      registerEvent('local', goalkeeper.id, goalkeeper.name, 'Parada del portero', 
        document.querySelector(`.player-card[data-id="${goalkeeper.id}"]`));
      break;
    case 'goal':
      state.match.goalkeeperStats.goals++;
      registerEvent('local', goalkeeper.id, goalkeeper.name, 'Gol encajado',
        document.querySelector(`.player-card[data-id="${goalkeeper.id}"]`));
      break;
    case 'out':
      state.match.goalkeeperStats.outs++;
      // No es un evento del jugador, solo estadística
      break;
  }
  
  updateGoalkeeperStats();
  
  // Agregar mensaje al chat
  const messages = {
    'save': `🧤 ¡Gran parada de ${goalkeeper.name}!`,
    'goal': `⚽ Gol encajado por ${goalkeeper.name}`,
    'out': `📍 Tiro fuera registrado`
  };
  
  addChatMessage('porteria', messages[type], time);
}

// ===== CHAT DE VOZ =====
let recognition = null;
let recognizing = false;

function setupVoiceRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    $('#voice-text').textContent = 'Reconocimiento de voz no soportado';
    $('#voice-toggle').disabled = true;
    return;
  }
  
  recognition = new SpeechRecognition();
  recognition.lang = 'es-ES';
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  
  recognition.onstart = () => {
    recognizing = true;
    updateVoiceStatus(true);
    $('#voice-toggle').innerHTML = '<i class="fas fa-microphone-slash"></i> Detener voz';
  };
  
  recognition.onend = () => {
    recognizing = false;
    updateVoiceStatus(false);
    $('#voice-toggle').innerHTML = '<i class="fas fa-microphone"></i> Iniciar voz';
  };
  
  recognition.onerror = (event) => {
    console.error('Error de reconocimiento de voz:', event.error);
    recognizing = false;
    updateVoiceStatus(false);
    $('#voice-toggle').innerHTML = '<i class="fas fa-microphone"></i> Iniciar voz';
    showValidationError(`Error de voz: ${event.error}`, 3000);
  };
  
  recognition.onresult = (event) => {
    const transcript = event.results[event.resultIndex][0].transcript.trim();
    if (transcript) {
      processVoiceInput(transcript);
    }
  };
}

function updateVoiceStatus(isListening) {
  const dot = $('#voice-dot');
  const text = $('#voice-text');
  
  if (isListening) {
    dot.classList.add('active');
    text.textContent = 'Escuchando...';
    text.style.color = '#22c55e';
  } else {
    dot.classList.remove('active');
    text.textContent = 'Micrófono desactivado';
    text.style.color = '';
  }
}

function processVoiceInput(text) {
  if (!text || text.length < 2) return;
  
  // Si hay un jugador seleccionado para comentarios por voz
  if (state.match.currentPlayerWithVoice) {
    const { playerName } = state.match.currentPlayerWithVoice;
    
    // Registrar como comentario por voz
    const event = {
      id: Date.now(),
      timestamp: new Date(),
      time: formatTime(state.match.manualSeconds),
      period: state.match.period,
      team: 'local',
      teamName: state.config.local.name,
      playerId: state.match.currentPlayerWithVoice.playerId,
      playerName: playerName,
      type: 'Comentario por voz',
      comment: text,
      icon: '🗣️'
    };
    
    state.match.events.push(event);
    
    // Actualizar contador del jugador
    const playerCard = document.querySelector(
      `.player-card[data-id="${state.match.currentPlayerWithVoice.playerId}"]`
    );
    
    if (playerCard) {
      const currentCount = parseInt(playerCard.dataset.eventsCount) || 0;
      playerCard.dataset.eventsCount = currentCount + 1;
      playerCard.querySelector('.event-count').textContent = `Eventos: ${currentCount + 1}`;
    }
    
    // Agregar al chat
    addChatMessage(`🗣️ ${playerName}`, text, event.time);
    
    // Renderizar evento
    renderEvent(event);
    
  } else {
    // Chat general
    addChatMessage('Voz', text);
  }
}

function addChatMessage(author, message, time = null) {
  const chatLog = $('#chat-log');
  
  // Remover estado vacío si existe
  const emptyState = chatLog.querySelector('.empty-state');
  if (emptyState) {
    emptyState.remove();
  }
  
  const messageElement = document.createElement('div');
  messageElement.className = `chat-message ${author === 'system' ? 'system' : 
                              author.startsWith('🗣️') ? 'voice' : ''}`;
  
  const displayTime = time || formatTime(state.match.manualSeconds);
  
  messageElement.innerHTML = `
    <span class="author">${author}:</span>
    <span class="text">${message}</span>
    <span class="time">${displayTime}</span>
  `;
  
  chatLog.appendChild(messageElement);
  chatLog.scrollTop = chatLog.scrollHeight;
  
  // Limitar mensajes a 100
  const messages = chatLog.querySelectorAll('.chat-message');
  if (messages.length > 100) {
    messages[0].remove();
  }
  
  // Guardar en estado
  state.match.chat.push({
    timestamp: new Date(),
    author: author,
    message: message,
    time: displayTime
  });
}

function clearChat() {
  if (confirm('¿Estás seguro de que quieres limpiar el chat?')) {
    $('#chat-log').innerHTML = `
      <div class="empty-state">
        <i class="fas fa-microphone"></i>
        <p>Inicia el micrófono para comenzar</p>
      </div>
    `;
    state.match.chat = [];
    showSuccessMessage('Chat limpiado correctamente');
  }
}

function updateVoicePlayerIndicator() {
  // Remover indicadores anteriores
  document.querySelectorAll('.player-card.voice-active').forEach(card => {
    card.classList.remove('voice-active');
  });
  
  document.querySelectorAll('.voice-indicator.active').forEach(indicator => {
    indicator.classList.remove('active');
  });
  
  // Activar nuevo indicador
  if (state.match.currentPlayerWithVoice) {
    const { playerId } = state.match.currentPlayerWithVoice;
    const playerCard = document.querySelector(`.player-card[data-id="${playerId}"]`);
    const voiceIndicator = document.getElementById(`voice-local-${playerId}`);
    
    if (playerCard) {
      playerCard.classList.add('voice-active');
    }
    
    if (voiceIndicator) {
      voiceIndicator.classList.add('active');
    }
  }
}

// ===== GENERACIÓN DE PDF =====
async function generatePDF() {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    showValidationError('Error: No se pudo cargar la biblioteca PDF');
    return;
  }
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // Configuración
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = margin;
  
  // ===== ENCABEZADO =====
  doc.setFillColor(26, 75, 140);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORME DE PARTIDO DE HOCKEY', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Documento generado automáticamente', pageWidth / 2, 30, { align: 'center' });
  
  yPos = 50;
  
  // ===== LOGO Y FECHA =====
  doc.setFillColor(240, 245, 255);
  doc.roundedRect(margin, yPos, contentWidth, 20, 3, 3, 'F');
  
  doc.setTextColor(26, 75, 140);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(state.config.local.name, margin + 10, yPos + 12);
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado: ${formatDateTime(new Date())}`, pageWidth - margin - 10, yPos + 12, { align: 'right' });
  
  yPos += 30;
  
  // ===== RESUMEN DEL PARTIDO =====
  doc.setTextColor(26, 75, 140);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMEN DEL PARTIDO', margin, yPos);
  yPos += 10;
  
  doc.setDrawColor(26, 75, 140);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;
  
  const summaryData = [
    ['Equipo', state.config.local.name],
    ['Marcador Final', `${state.match.score.local}`],
    ['Duración', formatTime(state.match.manualSeconds)],
    ['Parte Final', `${state.match.period}ª`],
    ['Fecha', state.match.metadata.date]
  ];
  
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(11);
  
  summaryData.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, margin + 5, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 50, yPos);
    yPos += 7;
  });
  
  yPos += 10;
  
  // ===== ESTADÍSTICAS DE PORTERÍA =====
  doc.setTextColor(26, 75, 140);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('ESTADÍSTICAS DE PORTERÍA', margin, yPos);
  yPos += 10;
  
  doc.setDrawColor(26, 75, 140);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;
  
  const stats = state.match.goalkeeperStats;
  const gkStats = [
    ['Paradas', stats.saves],
    ['Goles Encajados', stats.goals],
    ['Tiros Fuera', stats.outs],
    ['Eficacia', `${stats.efficiency}%`]
  ];
  
  // Tabla de estadísticas
  const tableTop = yPos;
  const col1 = margin + 5;
  const col2 = pageWidth - margin - 20;
  
  gkStats.forEach(([label, value], index) => {
    const rowY = tableTop + (index * 8);
    
    // Fondo alternado
    if (index % 2 === 0) {
      doc.setFillColor(245, 247, 250);
      doc.rect(col1 - 2, rowY - 3, col2 - col1 + 20, 8, 'F');
    }
    
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(label, col1, rowY);
    
    doc.setTextColor(26, 75, 140);
    doc.setFont('helvetica', 'bold');
    doc.text(value.toString(), col2, rowY, { align: 'right' });
  });
  
  yPos = tableTop + (gkStats.length * 8) + 10;
  
  // ===== JUGADORES ACTIVOS =====
  if (yPos > 200) {
    doc.addPage();
    yPos = margin;
  }
  
  doc.setTextColor(26, 75, 140);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('JUGADORES ACTIVOS', margin, yPos);
  yPos += 10;
  
  doc.setDrawColor(26, 75, 140);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;
  
  // Portero
  if (state.active.local.goalkeeper) {
    doc.setFillColor(255, 246, 216);
    doc.roundedRect(margin, yPos, contentWidth, 12, 2, 2, 'F');
    
    doc.setTextColor(140, 100, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('🧤 Portero:', margin + 5, yPos + 8);
    
    doc.setTextColor(50, 50, 50);
    doc.text(state.active.local.goalkeeper.name, margin + 35, yPos + 8);
    
    yPos += 15;
  }
  
  // Jugadores de pista
  doc.setTextColor(26, 75, 140);
  doc.setFontSize(12);
  doc.text('Jugadores de Pista:', margin, yPos);
  yPos += 8;
  
  state.active.local.players.forEach((player, index) => {
    doc.setFillColor(index % 2 === 0 ? 245, 247, 250 : 255, 255, 255);
    doc.rect(margin, yPos, contentWidth, 8, 'F');
    
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`• ${player.name}`, margin + 5, yPos + 6);
    
    yPos += 9;
  });
  
  yPos += 10;
  
  // ===== CRONOLOGÍA DE EVENTOS =====
  if (yPos > 180) {
    doc.addPage();
    yPos = margin;
  }
  
  doc.setTextColor(26, 75, 140);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CRONOLOGÍA DE EVENTOS', margin, yPos);
  yPos += 10;
  
  doc.setDrawColor(26, 75, 140);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;
  
  if (state.match.events.length === 0) {
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    doc.text('No hay eventos registrados', margin + 5, yPos);
    yPos += 10;
  } else {
    // Encabezado de tabla
    doc.setFillColor(26, 75, 140);
    doc.rect(margin, yPos, contentWidth, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Tiempo', margin + 5, yPos + 6);
    doc.text('Parte', margin + 35, yPos + 6);
    doc.text('Jugador', margin + 55, yPos + 6);
    doc.text('Evento', margin + 110, yPos + 6);
    
    yPos += 10;
    
    // Eventos
    state.match.events.forEach((event, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = margin;
      }
      
      // Fondo alternado
      doc.setFillColor(index % 2 === 0 ? 250, 250, 250 : 255, 255, 255);
      doc.rect(margin, yPos, contentWidth, 8, 'F');
      
      // Datos
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      // Tiempo
      doc.text(event.time, margin + 5, yPos + 6);
      
      // Parte
      doc.text(`${event.period}ª`, margin + 35, yPos + 6);
      
      // Jugador (recortar si es muy largo)
      const playerName = event.playerName || 'Sistema';
      const shortName = playerName.length > 15 ? playerName.substring(0, 12) + '...' : playerName;
      doc.text(shortName, margin + 55, yPos + 6);
      
      // Evento con color según tipo
      let eventColor = [50, 50, 50];
      if (event.type === 'Gol') eventColor = [34, 197, 94];
      else if (event.type.includes('Parada')) eventColor = [14, 165, 233];
      else if (event.type.includes('Falta')) eventColor = [251, 146, 60];
      else if (event.type.includes('Comentario')) eventColor = [139, 92, 246];
      
      doc.setTextColor(...eventColor);
      doc.text(event.type, margin + 110, yPos + 6);
      
      // Comentario si existe
      if (event.comment) {
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.text(`"${event.comment}"`, margin + 5, yPos + 12);
        yPos += 6;
      }
      
      yPos += 10;
    });
  }
  
  yPos += 10;
  
  // ===== COMENTARIOS DE VOZ =====
  if (state.match.chat.length > 0) {
    if (yPos > 200) {
      doc.addPage();
      yPos = margin;
    }
    
    doc.setTextColor(26, 75, 140);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('COMENTARIOS DE VOZ', margin, yPos);
    yPos += 10;
    
    doc.setDrawColor(26, 75, 140);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 5;
    
    // Mostrar solo los últimos 20 comentarios
    const recentChat = state.match.chat.slice(-20);
    
    recentChat.forEach((message, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = margin;
      }
      
      // Fondo para comentarios del sistema
      if (message.author === 'system') {
        doc.setFillColor(240, 249, 255);
        doc.rect(margin, yPos - 3, contentWidth, 10, 'F');
      }
      
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      // Autor en negrita
      doc.setFont('helvetica', 'bold');
      doc.text(`${message.author}:`, margin + 5, yPos + 5);
      
      // Mensaje
      const textStart = margin + 30;
      const maxWidth = pageWidth - margin - textStart - 20;
      
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(message.message, maxWidth);
      doc.text(lines, textStart, yPos + 5);
      
      // Hora a la derecha
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(8);
      doc.text(message.time, pageWidth - margin - 5, yPos + 5, { align: 'right' });
      
      yPos += (lines.length * 4) + 6;
    });
  }
  
  // ===== PIE DE PÁGINA =====
  const totalPages = doc.internal.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, 280, pageWidth - margin, 280);
    
    // Número de página
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(10);
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      287,
      { align: 'center' }
    );
    
    // Información del sistema
    doc.text(
      'Generado con Hockey Match Manager',
      margin,
      287
    );
    
    doc.text(
      formatDateTime(new Date()),
      pageWidth - margin,
      287,
      { align: 'right' }
    );
  }
  
  // ===== GUARDAR PDF =====
  const filename = `Partido_${state.config.local.name.replace(/\s+/g, '_')}_${formatDate(new Date()).replace(/\//g, '-')}.pdf`;
  doc.save(filename);
  
  showSuccessMessage('PDF generado y descargado correctamente');
}

// ===== FINALIZACIÓN DEL PARTIDO =====
function finishMatch() {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  
  const totalTime = formatTime(state.match.manualSeconds);
  const totalEvents = state.match.events.length;
  const totalGoals = state.match.score.local;
  
  modal.innerHTML = `
    <div class="modal" style="max-width: 500px;">
      <div class="modal-title">
        <i class="fas fa-flag-checkered"></i> Finalizar Partido
      </div>
      
      <div class="modal-subtitle">
        ¿Estás seguro de que quieres finalizar el partido?
      </div>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
        <h4 style="color: #1a4b8c; margin-bottom: 15px;">
          <i class="fas fa-chart-bar"></i> Resumen del Partido
        </h4>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
          <div style="background: white; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0;">
            <div style="font-size: 24px; font-weight: bold; color: #1a4b8c;">${totalTime}</div>
            <div style="font-size: 12px; color: #64748b;">Duración</div>
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0;">
            <div style="font-size: 24px; font-weight: bold; color: #1a4b8c;">${totalEvents}</div>
            <div style="font-size: 12px; color: #64748b;">Eventos</div>
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0;">
            <div style="font-size: 24px; font-weight: bold; color: #1a4b8c;">${totalGoals}</div>
            <div style="font-size: 12px; color: #64748b;">Goles</div>
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0;">
            <div style="font-size: 24px; font-weight: bold; color: #1a4b8c;">${state.match.goalkeeperStats.efficiency}%</div>
            <div style="font-size: 12px; color: #64748b;">Eficacia portero</div>
          </div>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #fffbeb; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <i class="fas fa-exclamation-triangle"></i>
          <strong style="color: #92400e;">Atención:</strong> Todos los datos del partido actual se perderán.
          Asegúrate de haber descargado el PDF antes de finalizar.
        </div>
      </div>
      
      <div style="display: flex; gap: 10px;">
        <button id="cancel-finish" class="btn btn-secondary" style="flex: 1;">
          <i class="fas fa-times"></i> Cancelar
        </button>
        <button id="confirm-finish" class="btn btn-finish" style="flex: 1;">
          <i class="fas fa-check"></i> Finalizar Partido
        </button>
      </div>
    </div>
  `;
  
  $('#modal-root').innerHTML = '';
  $('#modal-root').appendChild(modal);
  $('#modal-root').classList.remove('hidden');
  
  modal.querySelector('#cancel-finish').addEventListener('click', () => {
    $('#modal-root').classList.add('hidden');
  });
  
  modal.querySelector('#confirm-finish').addEventListener('click', () => {
    resetMatch();
    $('#modal-root').classList.add('hidden');
    showSuccessMessage('Partido finalizado. Puedes comenzar uno nuevo.', 3000);
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      $('#modal-root').classList.add('hidden');
    }
  });
}

function resetMatch() {
  // Parar temporizador
  if (state.match.timerId) {
    clearInterval(state.match.timerId);
    state.match.timerId = null;
  }
  
  // Resetear estado del partido
  state.match = {
    startTime: null,
    manualSeconds: 0,
    timerId: null,
    timerRunning: false,
    period: 1,
    score: { local: 0 },
    events: [],
    chat: [],
    currentPlayerWithVoice: null,
    goalkeeperStats: {
      saves: 0,
      goals: 0,
      outs: 0,
      efficiency: 0
    },
    metadata: {
      date: new Date().toLocaleDateString('es-ES'),
      location: "",
      referee: ""
    }
  };
  
  // Resetear selección activa
  state.active = {
    local: { 
      goalkeeper: null, 
      players: [],
      formation: "4-0"
    }
  };
  
  // Desmarcar checkboxes
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
    cb.parentElement.classList.remove('active');
  });
  
  // Volver al paso 1
  changeStep(1);
  
  // Limpiar formulario
  $('#local-name').value = '';
  for (let i = 1; i <= 2; i++) $(`local-gk${i}`).value = '';
  for (let i = 1; i <= 8; i++) $(`local-p${i}`).value = '';
}

// ===== CAMBIO DE JUGADORES =====
function openChangePlayersModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-title">
        <i class="fas fa-sync-alt"></i> Cambiar Jugadores
      </div>
      
      <div class="modal-subtitle">
        Selecciona 1 portero y 4 jugadores para el partido
      </div>
      
      <div id="change-players-container" style="max-height: 300px; overflow-y: auto; padding: 10px; background: #f8fafc; border-radius: 8px;">
        <!-- Contenido dinámico -->
      </div>
      
      <div style="margin-top: 20px; display: flex; gap: 10px;">
        <button id="cancel-change" class="btn btn-secondary" style="flex: 1;">
          <i class="fas fa-times"></i> Cancelar
        </button>
        <button id="confirm-change" class="btn btn-primary" style="flex: 1;">
          <i class="fas fa-check"></i> Confirmar Cambios
        </button>
      </div>
    </div>
  `;
  
  const container = modal.querySelector('#change-players-container');
  
  // Porteros
  const gkSection = document.createElement('div');
  gkSection.innerHTML = '<h4 style="color: #1a4b8c; margin-bottom: 10px;"><i class="fas fa-shield-alt"></i> Porteros</h4>';
  
  state.config.local.goalkeepers.forEach(gk => {
    const isActive = state.active.local.goalkeeper && 
                     state.active.local.goalkeeper.id === gk.id;
    
    const gkDiv = document.createElement('label');
    gkDiv.className = 'checkbox-card' + (isActive ? ' active' : '');
    gkDiv.innerHTML = `
      <input type="checkbox" data-type="gk" data-id="${gk.id}" ${isActive ? 'checked' : ''}>
      <i class="fas fa-shield-alt"></i>
      <div class="player-info">
        <span class="player-name-small">${gk.name}</span>
        <span class="player-number">#${gk.number}</span>
      </div>
    `;
    
    gkSection.appendChild(gkDiv);
  });
  
  container.appendChild(gkSection);
  
  // Jugadores
  const playersSection = document.createElement('div');
  playersSection.innerHTML = '<h4 style="color: #1a4b8c; margin-top: 20px; margin-bottom: 10px;"><i class="fas fa-running"></i> Jugadores de Pista</h4>';
  
  state.config.local.fieldPlayers.forEach(player => {
    const isActive = state.active.local.players.some(p => p.id === player.id);
    
    const playerDiv = document.createElement('label');
    playerDiv.className = 'checkbox-card' + (isActive ? ' active' : '');
    playerDiv.innerHTML = `
      <input type="checkbox" data-type="fld" data-id="${player.id}" ${isActive ? 'checked' : ''}>
      <i class="fas fa-running"></i>
      <div class="player-info">
        <span class="player-name-small">${player.name}</span>
        <span class="player-number">#${player.number}</span>
      </div>
    `;
    
    playersSection.appendChild(playerDiv);
  });
  
  container.appendChild(playersSection);
  
  $('#modal-root').innerHTML = '';
  $('#modal-root').appendChild(modal);
  $('#modal-root').classList.remove('hidden');
  
  // Validar selección en tiempo real
  container.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox') {
      validateSelectionInModal();
    }
  });
  
  // Confirmar cambios
  modal.querySelector('#confirm-change').addEventListener('click', () => {
    const selectedGks = Array.from(container.querySelectorAll('input[data-type="gk"]:checked'));
    const selectedPlayers = Array.from(container.querySelectorAll('input[data-type="fld"]:checked'));
    
    if (selectedGks.length !== 1 || selectedPlayers.length !== 4) {
      showValidationError('Debes seleccionar 1 portero y 4 jugadores');
      return;
    }
    
    // Actualizar jugadores activos
    const gkId = selectedGks[0].dataset.id;
    state.active.local.goalkeeper = state.config.local.goalkeepers.find(g => g.id === gkId);
    
    const playerIds = selectedPlayers.map(cb => cb.dataset.id);
    state.active.local.players = state.config.local.fieldPlayers.filter(p => 
      playerIds.includes(p.id)
    );
    
    // Actualizar interfaz
    updateCurrentGoalkeeper();
    renderActivePlayers();
    updateGoalkeeperStats();
    
    // Cerrar modal
    $('#modal-root').classList.add('hidden');
    
    // Agregar evento
    addSystemEvent('Cambio de jugadores realizado');
    showSuccessMessage('Jugadores actualizados correctamente');
  });
  
  modal.querySelector('#cancel-change').addEventListener('click', () => {
    $('#modal-root').classList.add('hidden');
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      $('#modal-root').classList.add('hidden');
    }
  });
}

function validateSelectionInModal() {
  const container = document.querySelector('#change-players-container');
  if (!container) return;
  
  const gkCheckboxes = container.querySelectorAll('input[data-type="gk"]');
  const playerCheckboxes = container.querySelectorAll('input[data-type="fld"]');
  
  const selectedGks = Array.from(gkCheckboxes).filter(cb => cb.checked);
  const selectedPlayers = Array.from(playerCheckboxes).filter(cb => cb.checked);
  
  // Limitar selecciones
  if (selectedGks.length > 1) {
    selectedGks[selectedGks.length - 1].checked = false;
  }
  
  if (selectedPlayers.length > 4) {
    selectedPlayers[selectedPlayers.length - 1].checked = false;
  }
  
  // Actualizar estilos
  gkCheckboxes.forEach(cb => {
    cb.parentElement.classList.toggle('active', cb.checked);
  });
  
  playerCheckboxes.forEach(cb => {
    cb.parentElement.classList.toggle('active', cb.checked);
  });
}

// ===== INICIALIZACIÓN =====
function initializeApp() {
  // Navegación entre pasos
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.classList.contains('disabled')) return;
      
      const step = parseInt(tab.dataset.step);
      if (canNavigateToStep(step)) {
        changeStep(step);
      }
    });
  });
  
  // Paso 2 -> Paso 1
  $('#back-to-1').addEventListener('click', () => changeStep(1));
  
  // Paso 2 -> Paso 3
  $('#to-step-3').addEventListener('click', () => {
    if (!canNavigateToStep(3)) return;
    
    // Guardar jugadores activos
    const gkCheckbox = document.querySelector('input[data-type="gk"]:checked');
    const playerCheckboxes = Array.from(
      document.querySelectorAll('input[data-type="fld"]:checked')
    ).slice(0, 4);
    
    if (!gkCheckbox || playerCheckboxes.length !== 4) {
      showValidationError('Selección de jugadores incompleta');
      return;
    }
    
    const gkId = gkCheckbox.dataset.id;
    const playerIds = playerCheckboxes.map(cb => cb.dataset.id);
    
    state.active.local.goalkeeper = state.config.local.goalkeepers.find(g => g.id === gkId);
    state.active.local.players = state.config.local.fieldPlayers.filter(p => 
      playerIds.includes(p.id)
    );
    
    changeStep(3);
  });
  
  // Temporizador
  $('#toggle-time').addEventListener('click', () => {
    if (state.match.timerRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  });
  
  $('#reset-time').addEventListener('click', () => {
    if (confirm('¿Reiniciar el temporizador a 00:00?')) {
      resetTimer();
    }
  });
  
  $('#change-period').addEventListener('click', () => {
    changePeriod();
  });
  
  // Estadísticas de portería
  $('#gk-save-btn').addEventListener('click', () => registerGoalkeeperEvent('save'));
  $('#gk-goal-btn').addEventListener('click', () => registerGoalkeeperEvent('goal'));
  $('#gk-out-btn').addEventListener('click', () => registerGoalkeeperEvent('out'));
  
  // Chat de voz
  $('#voice-toggle').addEventListener('click', () => {
    if (!recognition) {
      showValidationError('Reconocimiento de voz no disponible');
      return;
    }
    
    if (recognizing) {
      recognition.stop();
    } else {
      recognition.start();
    }
  });
  
  $('#voice-clear').addEventListener('click', clearChat);
  
  // Cambio de jugadores
  $('#change-local-players').addEventListener('click', openChangePlayersModal);
  
  // Limpiar eventos
  $('#clear-events').addEventListener('click', () => {
    if (confirm('¿Estás seguro de que quieres limpiar todos los eventos?')) {
      $('#events-list').innerHTML = `
        <div class="empty-state">
          <i class="fas fa-clipboard-list"></i>
          <p>No hay eventos registrados aún</p>
        </div>
      `;
      state.match.events = [];
      showSuccessMessage('Eventos limpiados correctamente');
    }
  });
  
  // Generar PDF
  $('#download-pdf').addEventListener('click', generatePDF);
  
  // Finalizar partido
  $('#finish-match').addEventListener('click', finishMatch);
  
  // Inicializar paso 1
  initializeStep1();
  
  // Configurar reconocimiento de voz
  setupVoiceRecognition();
  
  // Actualizar fecha actual
  $('#match-date').textContent = formatDate(new Date());
  
  console.log('Hockey Match Manager v2.0 inicializado correctamente');
}

// ===== INICIAR APLICACIÓN =====
document.addEventListener('DOMContentLoaded', initializeApp);
