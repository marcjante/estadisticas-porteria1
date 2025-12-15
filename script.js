// ===== VARIABLES GLOBALES =====
let appState = {
    // Estado del sistema
    initialized: false,
    sessionStartTime: null,
    sessionDuration: 0,
    sessionTimer: null,
    
    // Estado de selección
    selectedPlayer: null,
    selectedZone: null,
    selectedSection: null, // 'defense' o 'attack'
    
    // Estadísticas del portero
    goalkeeperStats: {
        saves: 0,
        goals: 0,
        misses: 0,
        effectiveness: 0
    },
    
    // Estadísticas por jugador
    playersStats: {}, // { playerNumber: { shots: 0, goals: 0, saves: 0, misses: 0 } }
    playersList: [], // Lista de números de jugadores
    
    // Eventos del partido
    events: [],
    
    // Resumen del equipo
    teamSummary: {
        totalShots: 0,
        totalGoals: 0,
        totalSaves: 0,
        totalMisses: 0,
        effectiveness: 0
    }
};

// ===== CONSTANTES =====
const ZONES = {
    1: { name: 'Zona 1', position: 'top-left', color: '#ef4444' },
    2: { name: 'Zona 2', position: 'top-center', color: '#f59e0b' },
    3: { name: 'Zona 3', position: 'top-right', color: '#10b981' },
    4: { name: 'Zona 4', position: 'center-left', color: '#3b82f6' },
    5: { name: 'Zona 5', position: 'center', color: '#8b5cf6' },
    6: { name: 'Zona 6', position: 'center-right', color: '#ec4899' },
    7: { name: 'Zona 7', position: 'bottom-left', color: '#6366f1' },
    8: { name: 'Zona 8', position: 'bottom-center', color: '#14b8a6' },
    9: { name: 'Zona 9', position: 'bottom-right', color: '#84cc16' }
};

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    if (appState.initialized) return;
    
    // Iniciar temporizador de sesión
    appState.sessionStartTime = new Date();
    startSessionTimer();
    
    // Inicializar interfaz
    initializeGoalGrids();
    initializeZoneButtons();
    initializePlayerSelector();
    initializeControls();
    initializeModals();
    
    // Actualizar interfaces
    updateAllDisplays();
    
    appState.initialized = true;
    console.log('Sistema de Estadísticas de Portería inicializado');
}

// ===== INICIALIZACIÓN DE INTERFAZ =====
function initializeGoalGrids() {
    const defenseGrid = document.getElementById('goal-grid-defense');
    const attackGrid = document.getElementById('goal-grid-attack');
    
    // Limpiar grids
    defenseGrid.innerHTML = '';
    attackGrid.innerHTML = '';
    
    // Crear zonas para ambos grids
    for (let zone = 1; zone <= 9; zone++) {
        const zoneData = ZONES[zone];
        
        // Crear elemento de zona para defensa
        const defenseZone = document.createElement('div');
        defenseZone.className = 'goal-zone';
        defenseZone.dataset.zone = zone;
        defenseZone.dataset.section = 'defense';
        defenseZone.style.borderColor = zoneData.color;
        defenseZone.innerHTML = `
            <div class="zone-number">${zone}</div>
            <div class="zone-stats" id="defense-zone-${zone}">
                <span class="zone-goals">0</span>/<span class="zone-saves">0</span>
            </div>
        `;
        defenseGrid.appendChild(defenseZone);
        
        // Crear elemento de zona para ataque
        const attackZone = document.createElement('div');
        attackZone.className = 'goal-zone';
        attackZone.dataset.zone = zone;
        attackZone.dataset.section = 'attack';
        attackZone.style.borderColor = zoneData.color;
        attackZone.innerHTML = `
            <div class="zone-number">${zone}</div>
            <div class="zone-stats" id="attack-zone-${zone}">
                <span class="zone-goals">0</span>/<span class="zone-saves">0</span>
            </div>
        `;
        attackGrid.appendChild(attackZone);
    }
}

function initializeZoneButtons() {
    const defenseButtons = document.getElementById('zone-buttons-defense');
    const attackButtons = document.getElementById('zone-buttons-attack');
    
    // Limpiar botones existentes
    defenseButtons.innerHTML = '';
    attackButtons.innerHTML = '';
    
    // Crear botones para cada zona
    for (let zone = 1; zone <= 9; zone++) {
        const zoneData = ZONES[zone];
        
        // Botón para defensa
        const defenseBtn = document.createElement('button');
        defenseBtn.className = 'zone-btn';
        defenseBtn.dataset.zone = zone;
        defenseBtn.dataset.section = 'defense';
        defenseBtn.innerHTML = `
            <span class="zone-btn-number">${zone}</span>
            <span class="zone-btn-name">${zoneData.name}</span>
        `;
        defenseButtons.appendChild(defenseBtn);
        
        // Botón para ataque
        const attackBtn = document.createElement('button');
        attackBtn.className = 'zone-btn';
        attackBtn.dataset.zone = zone;
        attackBtn.dataset.section = 'attack';
        attackBtn.innerHTML = `
            <span class="zone-btn-number">${zone}</span>
            <span class="zone-btn-name">${zoneData.name}</span>
        `;
        attackButtons.appendChild(attackBtn);
        
        // Event listeners para selección de zona
        defenseBtn.addEventListener('click', () => selectZone(zone, 'defense'));
        attackBtn.addEventListener('click', () => selectZone(zone, 'attack'));
    }
}

function initializePlayerSelector() {
    const playerInput = document.getElementById('player-number-input');
    const addPlayerBtn = document.getElementById('add-player-btn');
    const playerButtonsContainer = document.getElementById('player-buttons-container');
    
    // Event listener para añadir jugador
    addPlayerBtn.addEventListener('click', addPlayer);
    playerInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addPlayer();
    });
    
    // Inicializar lista vacía de jugadores
    updatePlayerButtons();
}

function initializeControls() {
    // Botones de defensa
    document.getElementById('save-btn-defense').addEventListener('click', () => {
        if (appState.selectedZone && appState.selectedSection === 'defense') {
            recordAction('save', 'defense');
        } else {
            showNotification('Selecciona una zona primero', 'warning');
        }
    });
    
    document.getElementById('goal-btn-defense').addEventListener('click', () => {
        if (appState.selectedZone && appState.selectedSection === 'defense') {
            recordAction('goal', 'defense');
        } else {
            showNotification('Selecciona una zona primero', 'warning');
        }
    });
    
    document.getElementById('outside-btn-defense').addEventListener('click', () => {
        recordAction('miss', 'defense');
    });
    
    // Botones de ataque
    document.getElementById('save-btn-attack').addEventListener('click', () => {
        if (appState.selectedPlayer && appState.selectedZone && appState.selectedSection === 'attack') {
            recordAction('save', 'attack');
        } else {
            showNotification('Selecciona un jugador y una zona primero', 'warning');
        }
    });
    
    document.getElementById('goal-btn-attack').addEventListener('click', () => {
        if (appState.selectedPlayer && appState.selectedZone && appState.selectedSection === 'attack') {
            recordAction('goal', 'attack');
        } else {
            showNotification('Selecciona un jugador y una zona primero', 'warning');
        }
    });
    
    document.getElementById('outside-btn-attack').addEventListener('click', () => {
        if (appState.selectedPlayer) {
            recordAction('miss', 'attack');
        } else {
            showNotification('Selecciona un jugador primero', 'warning');
        }
    });
    
    // Controles globales
    document.getElementById('reset-btn').addEventListener('click', removeLastAction);
    document.getElementById('clear-all-btn').addEventListener('click', confirmClearAll);
    document.getElementById('pdf-btn').addEventListener('click', generatePDF);
    document.getElementById('email-btn').addEventListener('click', openEmailModal);
}

function initializeModals() {
    const emailModal = document.getElementById('email-modal');
    const confirmModal = document.getElementById('confirm-modal');
    
    // Modal de email
    document.getElementById('cancel-email-btn').addEventListener('click', closeEmailModal);
    document.getElementById('close-email-modal').addEventListener('click', closeEmailModal);
    document.getElementById('send-email-btn').addEventListener('click', sendEmail);
    
    // Modal de confirmación
    document.getElementById('confirm-cancel-btn').addEventListener('click', closeConfirmModal);
    
    // Cerrar modales al hacer clic fuera
    [emailModal, confirmModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                if (modal.id === 'email-modal') closeEmailModal();
                else if (modal.id === 'confirm-modal') closeConfirmModal();
            }
        });
    });
}

// ===== FUNCIONES DE SELECCIÓN =====
function selectZone(zone, section) {
    appState.selectedZone = zone;
    appState.selectedSection = section;
    
    // Actualizar botones de zona
    document.querySelectorAll('.zone-btn').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.zone) === zone && btn.dataset.section === section) {
            btn.classList.add('active');
        }
    });
    
    // Actualizar información de selección
    const selectionInfo = document.getElementById(`selection-info-${section}`);
    if (section === 'defense') {
        selectionInfo.textContent = `Zona ${zone} seleccionada - Acción del portero`;
    } else {
        selectionInfo.textContent = `Jugador ${appState.selectedPlayer || '?'} - Zona ${zone} seleccionada`;
    }
    
    // Efecto visual
    const zoneElement = document.querySelector(`.goal-zone[data-zone="${zone}"][data-section="${section}"]`);
    if (zoneElement) {
        zoneElement.classList.add('pulse');
        setTimeout(() => zoneElement.classList.remove('pulse'), 500);
    }
}

function addPlayer() {
    const playerInput = document.getElementById('player-number-input');
    const playerNumber = playerInput.value.trim();
    const errorElement = document.getElementById('player-input-error');
    
    // Validaciones
    if (!playerNumber) {
        errorElement.textContent = 'Ingresa un número de jugador';
        playerInput.classList.add('error');
        return;
    }
    
    const num = parseInt(playerNumber);
    if (isNaN(num) || num < 1 || num > 99) {
        errorElement.textContent = 'Número inválido (1-99)';
        playerInput.classList.add('error');
        return;
    }
    
    if (appState.playersList.length >= 8) {
        errorElement.textContent = 'Máximo 8 jugadores permitidos';
        playerInput.classList.add('error');
        return;
    }
    
    if (appState.playersList.includes(num)) {
        errorElement.textContent = 'Este jugador ya existe';
        playerInput.classList.add('error');
        return;
    }
    
    // Añadir jugador
    appState.playersList.push(num);
    appState.playersStats[num] = {
        shots: 0,
        goals: 0,
        saves: 0,
        misses: 0
    };
    
    // Limpiar input y error
    playerInput.value = '';
    playerInput.classList.remove('error');
    errorElement.textContent = '';
    
    // Actualizar botones de jugadores
    updatePlayerButtons();
    
    // Seleccionar automáticamente el nuevo jugador
    selectPlayer(num);
    
    showNotification(`Jugador ${num} añadido correctamente`, 'success');
}

function selectPlayer(playerNumber) {
    appState.selectedPlayer = playerNumber;
    
    // Actualizar botones de jugadores
    document.querySelectorAll('.player-btn').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.player) === playerNumber) {
            btn.classList.add('active');
        }
    });
    
    // Actualizar información de selección
    if (appState.selectedSection === 'attack') {
        const selectionInfo = document.getElementById('selection-info-attack');
        selectionInfo.textContent = `Jugador ${playerNumber} seleccionado${appState.selectedZone ? ` - Zona ${appState.selectedZone}` : ''}`;
    }
    
    showNotification(`Jugador ${playerNumber} seleccionado`, 'info');
}

function updatePlayerButtons() {
    const container = document.getElementById('player-buttons-container');
    container.innerHTML = '';
    
    // Ordenar jugadores numéricamente
    appState.playersList.sort((a, b) => a - b).forEach(playerNumber => {
        const btn = document.createElement('button');
        btn.className = `player-btn ${appState.selectedPlayer === playerNumber ? 'active' : ''}`;
        btn.dataset.player = playerNumber;
        btn.textContent = playerNumber;
        
        btn.addEventListener('click', () => selectPlayer(playerNumber));
        container.appendChild(btn);
    });
}

// ===== FUNCIONES DE REGISTRO =====
function recordAction(actionType, section) {
    const timestamp = new Date();
    const timeString = timestamp.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    let event = {
        id: Date.now(),
        timestamp: timestamp,
        time: timeString,
        type: actionType,
        section: section
    };
    
    if (section === 'defense') {
        // Acción del portero
        event.zone = appState.selectedZone;
        
        // Actualizar estadísticas del portero
        switch(actionType) {
            case 'save':
                appState.goalkeeperStats.saves++;
                break;
            case 'goal':
                appState.goalkeeperStats.goals++;
                break;
            case 'miss':
                appState.goalkeeperStats.misses++;
                break;
        }
        
        // Añadir descripción
        event.description = `Portero - ${actionType === 'save' ? 'Parada' : actionType === 'goal' ? 'Gol recibido' : 'Tiro fuera'} en Zona ${appState.selectedZone}`;
        
    } else {
        // Acción de ataque
        if (!appState.selectedPlayer) {
            showNotification('Selecciona un jugador primero', 'warning');
            return;
        }
        
        event.player = appState.selectedPlayer;
        event.zone = actionType === 'miss' ? null : appState.selectedZone;
        
        // Actualizar estadísticas del jugador
        const playerStats = appState.playersStats[appState.selectedPlayer];
        if (!playerStats) return;
        
        playerStats.shots++;
        switch(actionType) {
            case 'goal':
                playerStats.goals++;
                appState.teamSummary.totalGoals++;
                break;
            case 'save':
                playerStats.saves++;
                appState.teamSummary.totalSaves++;
                break;
            case 'miss':
                playerStats.misses++;
                appState.teamSummary.totalMisses++;
                break;
        }
        
        // Actualizar totales del equipo
        appState.teamSummary.totalShots++;
        
        // Añadir descripción
        event.description = `Jugador ${appState.selectedPlayer} - ${actionType === 'goal' ? 'Gol' : actionType === 'save' ? 'Tiro parado' : 'Tiro fuera'}${event.zone ? ` en Zona ${event.zone}` : ''}`;
    }
    
    // Añadir evento a la lista
    appState.events.push(event);
    
    // Actualizar todas las interfaces
    updateAllDisplays();
    
    // Efecto de confirmación
    showNotification('Acción registrada correctamente', 'success');
    
    // Resetear selección de zona (opcional)
    if (actionType !== 'miss') {
        appState.selectedZone = null;
        document.querySelectorAll('.zone-btn.active').forEach(btn => btn.classList.remove('active'));
    }
}

// ===== FUNCIONES DE ACTUALIZACIÓN =====
function updateAllDisplays() {
    updateGoalkeeperStats();
    updateTeamSummary();
    updatePlayersStatsTable();
    updateEventsList();
    updateZoneStats();
    updateSessionDuration();
}

function updateGoalkeeperStats() {
    const stats = appState.goalkeeperStats;
    
    // Calcular efectividad
    const totalShotsOnGoal = stats.saves + stats.goals;
    stats.effectiveness = totalShotsOnGoal > 0 ? 
        Math.round((stats.saves / totalShotsOnGoal) * 100) : 0;
    
    // Actualizar valores en la interfaz
    document.getElementById('goalkeeper-saves').textContent = stats.saves;
    document.getElementById('goalkeeper-goals').textContent = stats.goals;
    document.getElementById('goalkeeper-misses').textContent = stats.misses;
    document.getElementById('goalkeeper-effectiveness').textContent = `${stats.effectiveness}%`;
}

function updateTeamSummary() {
    const summary = appState.teamSummary;
    
    // Calcular efectividad del equipo
    summary.effectiveness = summary.totalShots > 0 ? 
        Math.round((summary.totalGoals / summary.totalShots) * 100) : 0;
    
    // Actualizar valores en la interfaz
    document.getElementById('total-shots').textContent = summary.totalShots;
    document.getElementById('total-goals').textContent = summary.totalGoals;
    document.getElementById('total-saves-summary').textContent = summary.totalSaves;
    document.getElementById('team-effectiveness').textContent = `${summary.effectiveness}%`;
}

function updatePlayersStatsTable() {
    const tbody = document.getElementById('players-stats-body');
    tbody.innerHTML = '';
    
    // Variables para totales
    let totalShots = 0;
    let totalGoals = 0;
    let totalSaves = 0;
    let totalMisses = 0;
    
    // Crear filas para cada jugador
    appState.playersList.sort((a, b) => a - b).forEach(playerNumber => {
        const stats = appState.playersStats[playerNumber];
        
        // Sumar a totales
        totalShots += stats.shots;
        totalGoals += stats.goals;
        totalSaves += stats.saves;
        totalMisses += stats.misses;
        
        // Calcular porcentaje de acierto
        const accuracy = stats.shots > 0 ? 
            Math.round((stats.goals / stats.shots) * 100) : 0;
        
        // Determinar clase de porcentaje
        let accuracyClass = '';
        if (accuracy >= 50) accuracyClass = 'accuracy-high';
        else if (accuracy >= 25) accuracyClass = 'accuracy-medium';
        else if (accuracy > 0) accuracyClass = 'accuracy-low';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>Jugador ${playerNumber}</strong></td>
            <td>${stats.shots}</td>
            <td>${stats.goals}</td>
            <td>${stats.saves}</td>
            <td>${stats.misses}</td>
            <td class="${accuracyClass}">${accuracy}%</td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Actualizar totales del equipo
    const teamAccuracy = totalShots > 0 ? 
        Math.round((totalGoals / totalShots) * 100) : 0;
    
    document.getElementById('total-team-shots').textContent = totalShots;
    document.getElementById('total-team-goals').textContent = totalGoals;
    document.getElementById('total-team-saves').textContent = totalSaves;
    document.getElementById('total-team-misses').textContent = totalMisses;
    document.getElementById('total-team-accuracy').textContent = `${teamAccuracy}%`;
}

function updateEventsList() {
    const container = document.getElementById('events-list');
    container.innerHTML = '';
    
    // Mostrar eventos en orden inverso (más reciente primero)
    appState.events.slice().reverse().forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = `event-item ${event.section} fade-in`;
        
        let typeText = '';
        let typeClass = '';
        switch(event.type) {
            case 'save':
                typeText = event.section === 'defense' ? 'PARADA' : 'PARADO';
                typeClass = 'save';
                break;
            case 'goal':
                typeText = 'GOL';
                typeClass = 'goal';
                break;
            case 'miss':
                typeText = 'FUERA';
                typeClass = 'miss';
                break;
        }
        
        let playerInfo = '';
        if (event.player) {
            playerInfo = `<span class="event-player">J${event.player}</span>`;
        }
        
        let zoneInfo = '';
        if (event.zone) {
            zoneInfo = `<span class="event-zone">Z${event.zone}</span>`;
        }
        
        eventElement.innerHTML = `
            <span class="event-time">${event.time}</span>
            <span class="event-type ${typeClass}">${typeText}</span>
            ${playerInfo}
            ${zoneInfo}
        `;
        
        container.appendChild(eventElement);
    });
    
    // Si no hay eventos, mostrar mensaje
    if (appState.events.length === 0) {
        container.innerHTML = `
            <div class="no-events">
                <i class="fas fa-clipboard-list"></i>
                <p>No hay eventos registrados aún</p>
            </div>
        `;
    }
}

function updateZoneStats() {
    // Esta función actualizaría las estadísticas por zona
    // Se implementaría si se quiere mostrar estadísticas detalladas por zona
}

// ===== FUNCIONES DE GESTIÓN =====
function removeLastAction() {
    if (appState.events.length === 0) {
        showNotification('No hay acciones para eliminar', 'warning');
        return;
    }
    
    const lastEvent = appState.events.pop();
    
    // Revertir estadísticas según el tipo de evento
    if (lastEvent.section === 'defense') {
        // Revertir estadísticas del portero
        switch(lastEvent.type) {
            case 'save':
                appState.goalkeeperStats.saves--;
                break;
            case 'goal':
                appState.goalkeeperStats.goals--;
                break;
            case 'miss':
                appState.goalkeeperStats.misses--;
                break;
        }
    } else {
        // Revertir estadísticas del jugador
        if (lastEvent.player && appState.playersStats[lastEvent.player]) {
            const playerStats = appState.playersStats[lastEvent.player];
            
            playerStats.shots--;
            switch(lastEvent.type) {
                case 'goal':
                    playerStats.goals--;
                    appState.teamSummary.totalGoals--;
                    break;
                case 'save':
                    playerStats.saves--;
                    appState.teamSummary.totalSaves--;
                    break;
                case 'miss':
                    playerStats.misses--;
                    appState.teamSummary.totalMisses--;
                    break;
            }
            
            // Si el jugador no tiene más estadísticas, eliminarlo de la lista
            if (playerStats.shots === 0) {
                const index = appState.playersList.indexOf(lastEvent.player);
                if (index > -1) {
                    appState.playersList.splice(index, 1);
                    delete appState.playersStats[lastEvent.player];
                }
            }
            
            appState.teamSummary.totalShots--;
        }
    }
    
    // Actualizar interfaces
    updateAllDisplays();
    
    showNotification('Última acción eliminada', 'info');
}

function confirmClearAll() {
    if (appState.events.length === 0) {
        showNotification('No hay datos para limpiar', 'warning');
        return;
    }
    
    const modal = document.getElementById('confirm-modal');
    const message = document.getElementById('confirm-message');
    const confirmBtn = document.getElementById('confirm-ok-btn');
    
    message.textContent = '¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.';
    
    // Configurar botón de confirmación
    confirmBtn.onclick = clearAllData;
    
    // Mostrar modal
    modal.style.display = 'flex';
}

function clearAllData() {
    // Resetear todo el estado
    appState = {
        initialized: true,
        sessionStartTime: new Date(),
        sessionDuration: 0,
        sessionTimer: appState.sessionTimer,
        selectedPlayer: null,
        selectedZone: null,
        selectedSection: null,
        goalkeeperStats: { saves: 0, goals: 0, misses: 0, effectiveness: 0 },
        playersStats: {},
        playersList: [],
        events: [],
        teamSummary: { totalShots: 0, totalGoals: 0, totalSaves: 0, totalMisses: 0, effectiveness: 0 }
    };
    
    // Resetear interfaz
    document.getElementById('player-number-input').value = '';
    document.querySelectorAll('.zone-btn.active').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.player-btn.active').forEach(btn => btn.classList.remove('active'));
    
    // Actualizar displays
    updateAllDisplays();
    updatePlayerButtons();
    
    // Cerrar modal
    closeConfirmModal();
    
    showNotification('Todos los datos han sido eliminados', 'success');
}

// ===== FUNCIONES DE TEMPORIZADOR =====
function startSessionTimer() {
    appState.sessionTimer = setInterval(() => {
        appState.sessionDuration++;
        updateSessionDuration();
    }, 1000);
}

function updateSessionDuration() {
    const durationElement = document.getElementById('session-duration');
    if (durationElement) {
        const minutes = Math.floor(appState.sessionDuration / 60);
        const seconds = appState.sessionDuration % 60;
        durationElement.textContent = `Duración: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Actualizar hora actual
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
}

// ===== FUNCIONES DE MODALES =====
function openEmailModal() {
    const modal = document.getElementById('email-modal');
    modal.style.display = 'flex';
    
    // Autocompletar con datos del partido
    document.getElementById('email-subject').value = 
        `Estadísticas de Portería - ${new Date().toLocaleDateString('es-ES')}`;
    
    document.getElementById('email-message').value = 
        `Adjunto las estadísticas del partido registradas hasta el momento.\n\n` +
        `Resumen:\n` +
        `• Tiros totales: ${appState.teamSummary.totalShots}\n` +
        `• Goles: ${appState.teamSummary.totalGoals}\n` +
        `• Efectividad equipo: ${appState.teamSummary.effectiveness}%\n` +
        `• Efectividad portero: ${appState.goalkeeperStats.effectiveness}%\n\n` +
        `Saludos cordiales.`;
}

function closeEmailModal() {
    document.getElementById('email-modal').style.display = 'none';
}

function closeConfirmModal() {
    document.getElementById('confirm-modal').style.display = 'none';
}

async function sendEmail() {
    const to = document.getElementById('email-to').value;
    const subject = document.getElementById('email-subject').value;
    const message = document.getElementById('email-message').value;
    
    if (!to) {
        showNotification('Ingresa un email destinatario', 'error');
        return;
    }
    
    // En un entorno real, aquí se enviaría el email
    // Por ahora, simulamos el envío
    showNotification('Enviando email...', 'info');
    
    // Simular envío
    setTimeout(() => {
        showNotification('Email enviado correctamente', 'success');
        closeEmailModal();
    }, 2000);
}

// ===== FUNCIÓN PARA GENERAR PDF =====
async function generatePDF() {
    showNotification('Generando PDF...', 'info');
    
    // Usar html2canvas para capturar la página
    const element = document.querySelector('.container');
    
    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        
        // Guardar PDF
        const filename = `estadisticas-porteria-${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(filename);
        
        showNotification('PDF generado correctamente', 'success');
    } catch (error) {
        console.error('Error generando PDF:', error);
        showNotification('Error al generar PDF', 'error');
    }
}

// ===== FUNCIONES DE NOTIFICACIÓN =====
function showNotification(message, type = 'info') {
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = '';
    switch(type) {
        case 'success': icon = 'fa-check-circle'; break;
        case 'error': icon = 'fa-exclamation-circle'; break;
        case 'warning': icon = 'fa-exclamation-triangle'; break;
        default: icon = 'fa-info-circle'; break;
    }
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    // Añadir al body
    document.body.appendChild(notification);
    
    // Auto-eliminar después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ===== FUNCIONES ADICIONALES =====
function exportData() {
    const data = {
        timestamp: new Date().toISOString(),
        sessionDuration: appState.sessionDuration,
        goalkeeperStats: appState.goalkeeperStats,
        playersStats: appState.playersStats,
        teamSummary: appState.teamSummary,
        events: appState.events
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `estadisticas-porteria-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Datos exportados correctamente', 'success');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Validar datos
            if (!data.goalkeeperStats || !data.playersStats) {
                throw new Error('Formato de archivo inválido');
            }
            
            // Importar datos
            appState.goalkeeperStats = data.goalkeeperStats;
            appState.playersStats = data.playersStats;
            appState.teamSummary = data.teamSummary || appState.teamSummary;
            appState.events = data.events || [];
            
            // Reconstruir lista de jugadores
            appState.playersList = Object.keys(appState.playersStats).map(Number);
            
            // Actualizar interfaces
            updateAllDisplays();
            updatePlayerButtons();
            
            showNotification('Datos importados correctamente', 'success');
        } catch (error) {
            console.error('Error importando datos:', error);
            showNotification('Error al importar datos', 'error');
        }
    };
    reader.readAsText(file);
}

// ===== MANEJO DE ERRORES =====
window.addEventListener('error', function(event) {
    console.error('Error capturado:', event.error);
    showNotification(`Error: ${event.message}`, 'error');
});

// ===== INICIALIZACIÓN FINAL =====
// Añadir CSS adicional dinámicamente
const style = document.createElement('style');
style.textContent = `
    .goal-zone {
        position: absolute;
        border: 2px solid;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .goal-zone:hover {
        transform: scale(1.05);
        box-shadow: 0 0 15px rgba(0,0,0,0.2);
        z-index: 1;
    }
    
    .zone-number {
        font-size: 1.5rem;
        font-weight: bold;
    }
    
    .zone-stats {
        font-size: 0.8rem;
        margin-top: 5px;
    }
    
    .zone-goals {
        color: #ef4444;
        font-weight: bold;
    }
    
    .zone-saves {
        color: #10b981;
        font-weight: bold;
    }
    
    .no-events {
        text-align: center;
        padding: 2rem;
        color: #718096;
    }
    
    .no-events i {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.5;
    }
    
    .no-events p {
        font-style: italic;
    }
    
    .error {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
    }
`;
document.head.appendChild(style);

// Posicionar zonas en la portería
setTimeout(() => {
    const zones = {
        1: { top: '0%', left: '0%', width: '33.33%', height: '33.33%' },
        2: { top: '0%', left: '33.33%', width: '33.33%', height: '33.33%' },
        3: { top: '0%', left: '66.66%', width: '33.33%', height: '33.33%' },
        4: { top: '33.33%', left: '0%', width: '33.33%', height: '33.33%' },
        5: { top: '33.33%', left: '33.33%', width: '33.33%', height: '33.33%' },
        6: { top: '33.33%', left: '66.66%', width: '33.33%', height: '33.33%' },
        7: { top: '66.66%', left: '0%', width: '33.33%', height: '33.33%' },
        8: { top: '66.66%', left: '33.33%', width: '33.33%', height: '33.33%' },
        9: { top: '66.66%', left: '66.66%', width: '33.33%', height: '33.33%' }
    };
    
    document.querySelectorAll('.goal-zone').forEach(zone => {
        const zoneNum = parseInt(zone.dataset.zone);
        const position = zones[zoneNum];
        if (position) {
            Object.assign(zone.style, position);
        }
    });
}, 100);
