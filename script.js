// ---------- VARIABLES GLOBALES ----------
const state = {
    // Para defensa
    defenseSelectedZone: null,
    
    // Para ataque
    attackSelectedZone: null,
    selectedPlayer: null,
    
    // Estadísticas del portero (defensa)
    goalkeeperStats: {
        totalSaves: 0,
        totalGoals: 0,
        totalMisses: 0,
        zones: {
            'A1': { saves: 0, goals: 0 },
            'A2': { saves: 0, goals: 0 },
            'A3': { saves: 0, goals: 0 },
            'B1': { saves: 0, goals: 0 },
            'B2': { saves: 0, goals: 0 },
            'B3': { saves: 0, goals: 0 },
            'C1': { saves: 0, goals: 0 },
            'C2': { saves: 0, goals: 0 },
            'C3': { saves: 0, goals: 0 }
        }
    },
    
    // Estadísticas de atacantes
    attackersStats: {
        players: {}, // Se llenará dinámicamente
        zones: {
            'A1': { shots: 0, goals: 0 },
            'A2': { shots: 0, goals: 0 },
            'A3': { shots: 0, goals: 0 },
            'B1': { shots: 0, goals: 0 },
            'B2': { shots: 0, goals: 0 },
            'B3': { shots: 0, goals: 0 },
            'C1': { shots: 0, goals: 0 },
            'C2': { shots: 0, goals: 0 },
            'C3': { shots: 0, goals: 0 }
        }
    },
    
    events: [],
    playerNumbers: [], // Para almacenar los números de jugadores agregados
};

// ---------- FUNCIONES UTILITARIAS ----------
function $(id) {
    return document.getElementById(id);
}

function showError(elementId, message) {
    const errorElement = $(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 3000);
    }
}

function addEventMessage(message) {
    const eventsList = $("events-list");
    const msgDiv = document.createElement("div");
    msgDiv.className = "event-item";
    msgDiv.innerHTML = message;
    eventsList.appendChild(msgDiv);
    eventsList.scrollTop = eventsList.scrollHeight;
}

function getCurrentTime() {
    const now = new Date();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// ---------- CREAR PORTERÍAS VISUALES ----------
function createGoalVisuals() {
    createGoalVisual('defense');
    createGoalVisual('attack');
}

function createGoalVisual(mode) {
    const goalGrid = $(`goal-grid-${mode}`);
    const zoneButtons = $(`zone-buttons-${mode}`);
    
    if (!goalGrid || !zoneButtons) return;
    
    goalGrid.innerHTML = "";
    zoneButtons.innerHTML = "";
    
    const zones = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'];
    
    zones.forEach(zone => {
        // Crear zona en la portería visual
        const zoneDiv = document.createElement("div");
        zoneDiv.className = "goal-zone";
        zoneDiv.dataset.zone = zone;
        zoneDiv.dataset.mode = mode;
        zoneDiv.id = `zone-${mode}-${zone}`;
        
        const zoneStats = document.createElement("div");
        zoneStats.className = "zone-stats";
        zoneStats.id = `zone-stats-${mode}-${zone}`;
        zoneStats.textContent = "0-0";
        
        const zoneLabel = document.createElement("div");
        zoneLabel.className = "zone-label";
        zoneLabel.textContent = zone;
        
        zoneDiv.appendChild(zoneStats);
        zoneDiv.appendChild(zoneLabel);
        
        zoneDiv.addEventListener("click", () => selectZone(mode, zone));
        goalGrid.appendChild(zoneDiv);
        
        // Crear botón de zona
        const zoneBtn = document.createElement("button");
        zoneBtn.className = "zone-btn";
        zoneBtn.dataset.zone = zone;
        zoneBtn.dataset.mode = mode;
        zoneBtn.textContent = zone;
        zoneBtn.addEventListener("click", () => selectZone(mode, zone));
        zoneButtons.appendChild(zoneBtn);
    });
    
    updateZoneStats(mode);
}

function selectZone(mode, zone) {
    if (mode === 'defense') {
        if (state.defenseSelectedZone) {
            const prevZone = document.querySelector(`#zone-defense-${state.defenseSelectedZone}`);
            const prevBtn = document.querySelector(`.zone-btn[data-mode="defense"][data-zone="${state.defenseSelectedZone}"]`);
            if (prevZone) prevZone.classList.remove('active-goal', 'active-save', 'active-miss');
            if (prevBtn) prevBtn.classList.remove('active');
        }
        
        state.defenseSelectedZone = zone;
        $("selection-info-defense").textContent = `Zona ${zone} seleccionada para defensa`;
        
    } else if (mode === 'attack') {
        if (state.attackSelectedZone) {
            const prevZone = document.querySelector(`#zone-attack-${state.attackSelectedZone}`);
            const prevBtn = document.querySelector(`.zone-btn[data-mode="attack"][data-zone="${state.attackSelectedZone}"]`);
            if (prevZone) prevZone.classList.remove('active-goal', 'active-save', 'active-miss');
            if (prevBtn) prevBtn.classList.remove('active');
        }
        
        state.attackSelectedZone = zone;
        $("selection-info-attack").textContent = state.selectedPlayer 
            ? `Zona ${zone} | Jugador ${state.selectedPlayer} seleccionado`
            : `Zona ${zone} seleccionada | Selecciona un jugador`;
    }
    
    const zoneDiv = document.querySelector(`#zone-${mode}-${zone}`);
    const zoneBtn = document.querySelector(`.zone-btn[data-mode="${mode}"][data-zone="${zone}"]`);
    
    if (zoneBtn) zoneBtn.classList.add('active');
}

function updateZoneStats(mode) {
    const zones = mode === 'defense' ? state.goalkeeperStats.zones : state.attackersStats.zones;
    
    for (const zone in zones) {
        const stats = zones[zone];
        const zoneStats = document.getElementById(`zone-stats-${mode}-${zone}`);
        
        if (zoneStats) {
            zoneStats.textContent = mode === 'defense' 
                ? `${stats.saves}-${stats.goals}`
                : `${stats.shots}-${stats.goals}`;
        }
    }
}

// ---------- GESTIÓN DE JUGADORES ----------
function addPlayer() {
    const input = $("player-number-input");
    const playerNumber = input.value.trim();
    
    if (!playerNumber) {
        showError('player-input-error', 'Introduce un número de jugador');
        return;
    }
    
    if (isNaN(playerNumber) || parseInt(playerNumber) < 1 || parseInt(playerNumber) > 99) {
        showError('player-input-error', 'Número inválido (1-99)');
        return;
    }
    
    if (state.playerNumbers.includes(playerNumber)) {
        showError('player-input-error', `El jugador ${playerNumber} ya está agregado`);
        input.value = "";
        return;
    }
    
    if (state.playerNumbers.length >= 8) {
        showError('player-input-error', 'Máximo 8 jugadores permitidos');
        return;
    }
    
    state.playerNumbers.push(playerNumber);
    
    if (!state.attackersStats.players[playerNumber]) {
        state.attackersStats.players[playerNumber] = {
            shots: 0,
            goals: 0,
            saves: 0,
            misses: 0,
            name: `Jugador ${playerNumber}`
        };
    }
    
    createPlayerButton(playerNumber);
    input.value = "";
    addEventMessage(`<span style="color: #059669"><i class="fas fa-check-circle"></i> Jugador ${playerNumber} agregado</span>`);
    selectPlayer(playerNumber);
    updatePlayerStats();
}

function createPlayerButton(playerNumber) {
    const container = $("player-buttons-container");
    
    if (!container) return;
    
    if (document.querySelector(`.player-btn[data-player="${playerNumber}"]`)) return;
    
    const playerBtn = document.createElement("button");
    playerBtn.className = "player-btn";
    playerBtn.dataset.player = playerNumber;
    playerBtn.textContent = playerNumber;
    playerBtn.addEventListener("click", () => selectPlayer(playerNumber));
    container.appendChild(playerBtn);
}

function selectPlayer(playerNumber) {
    if (state.selectedPlayer) {
        const prevPlayerBtn = document.querySelector(`.player-btn[data-player="${state.selectedPlayer}"]`);
        if (prevPlayerBtn) prevPlayerBtn.classList.remove('active');
    }
    
    state.selectedPlayer = playerNumber;
    const playerBtn = document.querySelector(`.player-btn[data-player="${playerNumber}"]`);
    
    if (playerBtn) playerBtn.classList.add('active');
    
    $("selection-info-attack").textContent = state.attackSelectedZone 
        ? `Zona ${state.attackSelectedZone} | Jugador ${playerNumber} seleccionado`
        : `Jugador ${playerNumber} seleccionado | Selecciona una zona`;
    
    addEventMessage(`<span style="color: #059669"><i class="fas fa-user-check"></i> Jugador ${playerNumber} seleccionado para ataque</span>`);
}

function updatePlayerStats() {
    const statsBody = $("players-stats-body");
    const totalsRow = $("players-stats-totals");
    
    if (!statsBody || !totalsRow) return;
    
    statsBody.innerHTML = "";
    
    const playerIds = state.playerNumbers.sort((a, b) => {
        const numA = parseInt(a) || 0;
        const numB = parseInt(b) || 0;
        return numA - numB;
    });
    
    // Variables para calcular totales
    let totalShots = 0;
    let totalGoals = 0;
    let totalSaves = 0;
    let totalMisses = 0;
    
    playerIds.forEach(playerId => {
        const playerStats = state.attackersStats.players[playerId];
        if (!playerStats) return;
        
        const shots = playerStats.shots || 0;
        const goals = playerStats.goals || 0;
        const saves = playerStats.saves || 0;
        const misses = playerStats.misses || 0;
        const accuracy = shots > 0 ? Math.round((goals / shots) * 100) : 0;
        
        // Sumar a totales
        totalShots += shots;
        totalGoals += goals;
        totalSaves += saves;
        totalMisses += misses;
        
        const row = document.createElement("tr");
        
        let playerClass = "";
        if (shots > 0) {
            if (accuracy >= 50) playerClass = "goal";
            else if (accuracy >= 30) playerClass = "save";
            else playerClass = "miss";
        }
        
        row.innerHTML = `
            <td><span class="player-btn ${playerClass}" style="width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;">${playerId}</span></td>
            <td>${shots}</td>
            <td>${goals}</td>
            <td>${saves}</td>
            <td>${misses}</td>
            <td>${accuracy}%</td>
        `;
        
        statsBody.appendChild(row);
    });
    
    // Calcular precisión total
    const totalAccuracy = totalShots > 0 ? Math.round((totalGoals / totalShots) * 100) : 0;
    
    // Actualizar fila de totales
    totalsRow.innerHTML = `
        <tr class="totals-row">
            <td><strong>TOTAL</strong></td>
            <td><strong>${totalShots}</strong></td>
            <td><strong>${totalGoals}</strong></td>
            <td><strong>${totalSaves}</strong></td>
            <td><strong>${totalMisses}</strong></td>
            <td><strong>${totalAccuracy}%</strong></td>
        </tr>
    `;
}

// ---------- REGISTRO DE ACCIONES ----------
function registerDefenseAction(actionType) {
    if (!state.defenseSelectedZone && actionType !== 'miss') {
        addEventMessage(`<span style="color: #dc2626"><i class="fas fa-exclamation-circle"></i> Error: Selecciona una zona en la portería de defensa</span>`);
        return;
    }
    
    const time = getCurrentTime();
    
    if (actionType === 'miss') {
        state.goalkeeperStats.totalMisses++;
        
        const actionText = `Tiro fuera del portero`;
        state.events.push({
            time,
            playerName: "Portero",
            type: actionText,
            zone: 'FUERA',
            actionType: actionType,
            mode: 'defense'
        });
        
        updateGoalkeeperStats();
        addEventMessage(`<span style="color: #f59e0b"><i class="fas fa-external-link-alt"></i> [${time}] ${actionText}</span>`);
        return;
    }
    
    const zone = state.defenseSelectedZone;
    
    if (actionType === 'save') {
        state.goalkeeperStats.zones[zone].saves++;
        state.goalkeeperStats.totalSaves++;
    } else if (actionType === 'goal') {
        state.goalkeeperStats.zones[zone].goals++;
        state.goalkeeperStats.totalGoals++;
    }
    
    const zoneDiv = document.querySelector(`#zone-defense-${zone}`);
    if (zoneDiv) {
        zoneDiv.classList.remove('active-goal', 'active-save', 'active-miss');
        zoneDiv.classList.add(`active-${actionType}`);
    }
    
    let actionText = '', icon = '', color = '';
    if (actionType === 'save') {
        actionText = `Parada del portero en zona ${zone}`;
        icon = 'hand-paper';
        color = '#059669';
    } else if (actionType === 'goal') {
        actionText = `Gol recibido en zona ${zone}`;
        icon = 'bullseye';
        color = '#dc2626';
    }
    
    state.events.push({
        time,
        playerName: "Portero",
        type: actionText,
        zone: zone,
        actionType: actionType,
        mode: 'defense'
    });
    
    updateZoneStats('defense');
    updateGoalkeeperStats();
    addEventMessage(`<span style="color: ${color}"><i class="fas fa-${icon}"></i> [${time}] ${actionText}</span>`);
}

function registerAttackAction(actionType) {
    if (actionType === 'miss') {
        if (!state.selectedPlayer) {
            addEventMessage(`<span style="color: #dc2626"><i class="fas fa-exclamation-circle"></i> Error: Selecciona un jugador para registrar tiro fuera</span>`);
            return;
        }
        
        const time = getCurrentTime();
        const playerId = state.selectedPlayer;
        const playerStats = state.attackersStats.players[playerId];
        
        if (!playerStats) {
            addEventMessage(`<span style="color: #dc2626"><i class="fas fa-exclamation-circle"></i> Error: Jugador no encontrado</span>`);
            return;
        }
        
        playerStats.shots++;
        playerStats.misses++;
        
        const actionText = `Tiro fuera de Jugador ${playerId}`;
        state.events.push({
            time,
            playerName: `Jugador ${playerId}`,
            type: actionText,
            zone: 'FUERA',
            actionType: actionType,
            mode: 'attack'
        });
        
        updatePlayerStats();
        
        const playerBtn = document.querySelector(`.player-btn[data-player="${playerId}"]`);
        if (playerBtn) {
            playerBtn.classList.remove('goal', 'save', 'miss');
            playerBtn.classList.add(actionType);
        }
        
        addEventMessage(`<span style="color: #f59e0b"><i class="fas fa-external-link-alt"></i> [${time}] ${actionText}</span>`);
        return;
    }
    
    if (!state.attackSelectedZone) {
        addEventMessage(`<span style="color: #dc2626"><i class="fas fa-exclamation-circle"></i> Error: Selecciona una zona en la portería de ataque</span>`);
        return;
    }
    
    if (!state.selectedPlayer) {
        addEventMessage(`<span style="color: #dc2626"><i class="fas fa-exclamation-circle"></i> Error: Selecciona un jugador para registrar ataque</span>`);
        return;
    }
    
    const time = getCurrentTime();
    const zone = state.attackSelectedZone;
    const playerId = state.selectedPlayer;
    const playerStats = state.attackersStats.players[playerId];
    
    if (!playerStats) {
        addEventMessage(`<span style="color: #dc2626"><i class="fas fa-exclamation-circle"></i> Error: Jugador no encontrado</span>`);
        return;
    }
    
    playerStats.shots++;
    
    if (actionType === 'goal') {
        playerStats.goals++;
        state.attackersStats.zones[zone].goals++;
        state.attackersStats.zones[zone].shots++;
    } else if (actionType === 'save') {
        playerStats.saves++;
        state.attackersStats.zones[zone].shots++;
    }
    
    const zoneDiv = document.querySelector(`#zone-attack-${zone}`);
    if (zoneDiv) {
        zoneDiv.classList.remove('active-goal', 'active-save', 'active-miss');
        zoneDiv.classList.add(`active-${actionType}`);
    }
    
    let actionText = '', icon = '', color = '';
    if (actionType === 'goal') {
        actionText = `Gol de Jugador ${playerId} en zona ${zone}`;
        icon = 'bullseye';
        color = '#dc2626';
    } else if (actionType === 'save') {
        actionText = `Tiro de Jugador ${playerId} parado en zona ${zone}`;
        icon = 'hand-paper';
        color = '#059669';
    }
    
    state.events.push({
        time,
        playerName: `Jugador ${playerId}`,
        type: actionText,
        zone: zone,
        actionType: actionType,
        mode: 'attack'
    });
    
    updateZoneStats('attack');
    updatePlayerStats();
    
    const playerBtn = document.querySelector(`.player-btn[data-player="${playerId}"]`);
    if (playerBtn) {
        playerBtn.classList.remove('goal', 'save', 'miss');
        playerBtn.classList.add(actionType);
    }
    
    addEventMessage(`<span style="color: ${color}"><i class="fas fa-${icon}"></i> [${time}] ${actionText}</span>`);
}

function updateGoalkeeperStats() {
    const stats = state.goalkeeperStats;
    
    $("total-saves").textContent = stats.totalSaves;
    $("total-goals-defense").textContent = stats.totalGoals;
    $("total-misses").textContent = stats.totalMisses;
    
    const totalShots = stats.totalSaves + stats.totalGoals;
    const effectiveness = totalShots > 0 ? Math.round((stats.totalSaves / totalShots) * 100) : 0;
    $("effectiveness").textContent = `${effectiveness}%`;
}

function resetLastAction() {
    if (state.events.length === 0) {
        addEventMessage(`<span style="color: #dc2626"><i class="fas fa-exclamation-circle"></i> No hay acciones para eliminar</span>`);
        return;
    }
    
    const lastEvent = state.events[state.events.length - 1];
    
    // Revertir estadísticas según el tipo de evento
    if (lastEvent.mode === 'defense') {
        if (lastEvent.zone === 'FUERA') {
            state.goalkeeperStats.totalMisses--;
        } else {
            const zone = lastEvent.zone;
            if (lastEvent.actionType === 'save') {
                state.goalkeeperStats.zones[zone].saves--;
                state.goalkeeperStats.totalSaves--;
            } else if (lastEvent.actionType === 'goal') {
                state.goalkeeperStats.zones[zone].goals--;
                state.goalkeeperStats.totalGoals--;
            }
            
            // Limpiar resaltado de zona
            const zoneDiv = document.querySelector(`#zone-defense-${zone}`);
            if (zoneDiv) zoneDiv.classList.remove('active-goal', 'active-save', 'active-miss');
        }
        updateZoneStats('defense');
        updateGoalkeeperStats();
        
    } else if (lastEvent.mode === 'attack') {
        if (lastEvent.zone === 'FUERA') {
            const playerId = lastEvent.playerName.replace('Jugador ', '');
            const playerStats = state.attackersStats.players[playerId];
            if (playerStats) {
                playerStats.shots--;
                playerStats.misses--;
            }
        } else {
            const zone = lastEvent.zone;
            const playerId = lastEvent.playerName.replace('Jugador ', '');
            const playerStats = state.attackersStats.players[playerId];
            
            if (playerStats) {
                playerStats.shots--;
                
                if (lastEvent.actionType === 'goal') {
                    playerStats.goals--;
                    state.attackersStats.zones[zone].goals--;
                    state.attackersStats.zones[zone].shots--;
                } else if (lastEvent.actionType === 'save') {
                    playerStats.saves--;
                    state.attackersStats.zones[zone].shots--;
                }
                
                // Limpiar resaltado de zona
                const zoneDiv = document.querySelector(`#zone-attack-${zone}`);
                if (zoneDiv) zoneDiv.classList.remove('active-goal', 'active-save', 'active-miss');
                
                // Actualizar botón del jugador
                const playerBtn = document.querySelector(`.player-btn[data-player="${playerId}"]`);
                if (playerBtn) {
                    playerBtn.classList.remove('goal', 'save', 'miss');
                }
            }
        }
        updateZoneStats('attack');
        updatePlayerStats();
    }
    
    // Eliminar evento
    state.events.pop();
    
    // Eliminar mensaje de la lista de eventos
    const eventsList = $("events-list");
    if (eventsList.children.length > 0) {
        eventsList.removeChild(eventsList.lastChild);
    }
    
    addEventMessage(`<span style="color: #6b7280"><i class="fas fa-undo"></i> Última acción eliminada</span>`);
}

// ---------- GENERACIÓN DE PDF ----------
function generatePDF() {
    if (state.goalkeeperStats.totalSaves === 0 && 
        state.goalkeeperStats.totalGoals === 0 && 
        state.goalkeeperStats.totalMisses === 0 &&
        state.playerNumbers.length === 0) {
        addEventMessage(`<span style="color: #dc2626"><i class="fas fa-exclamation-circle"></i> No hay datos para generar el PDF</span>`);
        return;
    }
    
    addEventMessage(`<span style="color: #7c3aed"><i class="fas fa-spinner fa-spin"></i> Generando PDF...</span>`);
    
    try {
        // Crear un nuevo documento PDF
        const doc = new jsPDF();
        
        // Título
        doc.setFontSize(20);
        doc.setTextColor(40, 53, 147);
        doc.text("REPORTE DE ESTADÍSTICAS DE PORTERÍA", 105, 20, null, null, "center");
        
        // Fecha
        const now = new Date();
        const fecha = now.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const hora = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generado el ${fecha} a las ${hora}`, 105, 30, null, null, "center");
        
        // Estadísticas del portero
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("ESTADÍSTICAS DEL PORTERO", 20, 45);
        
        doc.setFontSize(12);
        doc.text(`Paradas: ${state.goalkeeperStats.totalSaves}`, 20, 55);
        doc.text(`Goles Recibidos: ${state.goalkeeperStats.totalGoals}`, 20, 62);
        doc.text(`Tiros Fuera: ${state.goalkeeperStats.totalMisses}`, 20, 69);
        
        const totalShots = state.goalkeeperStats.totalSaves + state.goalkeeperStats.totalGoals;
        const effectiveness = totalShots > 0 ? Math.round((state.goalkeeperStats.totalSaves / totalShots) * 100) : 0;
        doc.text(`Efectividad: ${effectiveness}%`, 20, 76);
        
        // Tabla de zonas
        doc.setFontSize(14);
        doc.text("ESTADÍSTICAS POR ZONA (Portero)", 20, 90);
        
        let yPos = 100;
        const zones = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'];
        
        zones.forEach((zone, index) => {
            const stats = state.goalkeeperStats.zones[zone];
            const saves = stats.saves || 0;
            const goals = stats.goals || 0;
            const total = saves + goals;
            const eff = total > 0 ? Math.round((saves / total) * 100) : 0;
            
            if (index % 3 === 0 && index !== 0) {
                yPos += 20;
            }
            
            const xPos = 20 + (index % 3) * 60;
            
            doc.setFontSize(10);
            doc.text(`${zone}: ${saves}/${total} (${eff}%)`, xPos, yPos);
        });
        
        yPos += 25;
        
        // Estadísticas de jugadores si existen
        if (state.playerNumbers.length > 0) {
            doc.setFontSize(16);
            doc.text("ESTADÍSTICAS DE JUGADORES (Ataque)", 20, yPos);
            yPos += 10;
            
            // Encabezados de tabla
            doc.setFontSize(10);
            doc.setDrawColor(0, 0, 0);
            doc.line(20, yPos, 190, yPos);
            yPos += 5;
            
            doc.setFont("helvetica", "bold");
            doc.text("Jugador", 25, yPos);
            doc.text("Tiros", 60, yPos);
            doc.text("Goles", 85, yPos);
            doc.text("Parados", 110, yPos);
            doc.text("Fuera", 140, yPos);
            doc.text("% Acierto", 165, yPos);
            
            yPos += 8;
            doc.setFont("helvetica", "normal");
            
            // Variables para totales
            let totalPlayerShots = 0;
            let totalPlayerGoals = 0;
            let totalPlayerSaves = 0;
            let totalPlayerMisses = 0;
            
            // Filas de jugadores
            const playerIds = state.playerNumbers.sort((a, b) => {
                const numA = parseInt(a) || 0;
                const numB = parseInt(b) || 0;
                return numA - numB;
            });
            
            playerIds.forEach(playerId => {
                const playerStats = state.attackersStats.players[playerId];
                if (!playerStats) return;
                
                const shots = playerStats.shots || 0;
                const goals = playerStats.goals || 0;
                const saves = playerStats.saves || 0;
                const misses = playerStats.misses || 0;
                const accuracy = shots > 0 ? Math.round((goals / shots) * 100) : 0;
                
                // Sumar a totales
                totalPlayerShots += shots;
                totalPlayerGoals += goals;
                totalPlayerSaves += saves;
                totalPlayerMisses += misses;
                
                doc.text(playerId.toString(), 25, yPos);
                doc.text(shots.toString(), 60, yPos);
                doc.text(goals.toString(), 85, yPos);
                doc.text(saves.toString(), 110, yPos);
                doc.text(misses.toString(), 140, yPos);
                doc.text(`${accuracy}%`, 165, yPos);
                
                yPos += 7;
            });
            
            // Fila de totales
            doc.line(20, yPos, 190, yPos);
            yPos += 5;
            
            doc.setFont("helvetica", "bold");
            const totalAccuracy = totalPlayerShots > 0 ? Math.round((totalPlayerGoals / totalPlayerShots) * 100) : 0;
            
            doc.text("TOTAL", 25, yPos);
            doc.text(totalPlayerShots.toString(), 60, yPos);
            doc.text(totalPlayerGoals.toString(), 85, yPos);
            doc.text(totalPlayerSaves.toString(), 110, yPos);
            doc.text(totalPlayerMisses.toString(), 140, yPos);
            doc.text(`${totalAccuracy}%`, 165, yPos);
            
            yPos += 15;
        }
        
        // Resumen
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        doc.text("Hoquei Palau Solita i Plegamants | Sistema de Análisis Táctico", 105, yPos + 10, null, null, "center");
        
        // Guardar el PDF
        const fileName = `estadisticas_porteria_${now.toISOString().slice(0, 10)}_${now.getHours()}${now.getMinutes()}.pdf`;
        doc.save(fileName);
        
        addEventMessage(`<span style="color: #7c3aed"><i class="fas fa-check-circle"></i> PDF generado y descargado: ${fileName}</span>`);
        
    } catch (error) {
        console.error('Error generando PDF:', error);
        addEventMessage(`<span style="color: #dc2626"><i class="fas fa-exclamation-circle"></i> Error al generar PDF. Verifica que hayas registrado datos primero.</span>`);
    }
}

// ---------- INICIALIZACIÓN ----------
document.addEventListener("DOMContentLoaded", function() {
    // Crear las porterías visuales
    createGoalVisuals();
    
    // Configurar botones de defensa
    $("save-btn-defense").addEventListener("click", () => registerDefenseAction('save'));
    $("goal-btn-defense").addEventListener("click", () => registerDefenseAction('goal'));
    $("outside-btn-defense").addEventListener("click", () => registerDefenseAction('miss'));
    
    // Configurar botones de ataque
    $("goal-btn-attack").addEventListener("click", () => registerAttackAction('goal'));
    $("save-btn-attack").addEventListener("click", () => registerAttackAction('save'));
    $("outside-btn-attack").addEventListener("click", () => registerAttackAction('miss'));
    
    // Configurar botón de reset
    $("reset-btn").addEventListener("click", resetLastAction);
    
    // Configurar agregar jugador
    $("add-player-btn").addEventListener("click", addPlayer);
    $("player-number-input").addEventListener("keypress", function(e) {
        if (e.key === 'Enter') addPlayer();
    });
    
    // Configurar botón de PDF
    $("pdf-btn").addEventListener("click", generatePDF);
    
    // Mensaje inicial
    setTimeout(() => {
        addEventMessage(`<span style="color: #3498db"><i class="fas fa-info-circle"></i> Sistema de Portería Dual iniciado</span>`);
        addEventMessage(`<span style="color: #3498db"><i class="fas fa-info-circle"></i> IZQUIERDA: Defensa (Portero) | DERECHA: Ataque (Jugadores)</span>`);
        addEventMessage(`<span style="color: #7c3aed"><i class="fas fa-info-circle"></i> Haz clic en "Generar PDF" para descargar el reporte</span>`);
    }, 500);
});
