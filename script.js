// ---------- VARIABLES GLOBALES ----------
const state = {
    defenseSelectedZone: null,
    attackSelectedZone: null,
    selectedPlayer: null,
    
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
    
    attackersStats: {
        players: {},
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
    playerNumbers: [],
    lastGeneratedPDF: null,
    pdfBlob: null
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
    if (!statsBody) return;
    
    statsBody.innerHTML = "";
    
    const playerIds = state.playerNumbers.sort((a, b) => {
        const numA = parseInt(a) || 0;
        const numB = parseInt(b) || 0;
        return numA - numB;
    });
    
    playerIds.forEach(playerId => {
        const playerStats = state.attackersStats.players[playerId];
        if (!playerStats) return;
        
        const totalShots = playerStats.shots;
        const goals = playerStats.goals;
        const saves = playerStats.saves;
        const misses = playerStats.misses;
        const accuracy = totalShots > 0 ? Math.round((goals / totalShots) * 100) : 0;
        
        const row = document.createElement("tr");
        
        let playerClass = "";
        if (playerStats.shots > 0) {
            if (accuracy >= 50) playerClass = "goal";
            else if (accuracy >= 30) playerClass = "save";
            else playerClass = "miss";
        }
        
        row.innerHTML = `
            <td><span class="player-btn ${playerClass}" style="width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;">${playerId}</span></td>
            <td>${totalShots}</td>
            <td>${goals}</td>
            <td>${saves}</td>
            <td>${misses}</td>
            <td>${accuracy}%</td>
        `;
        
        statsBody.appendChild(row);
    });
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
                
                const zoneDiv = document.querySelector(`#zone-attack-${zone}`);
                if (zoneDiv) zoneDiv.classList.remove('active-goal', 'active-save', 'active-miss');
                
                const playerBtn = document.querySelector(`.player-btn[data-player="${playerId}"]`);
                if (playerBtn) {
                    playerBtn.classList.remove('goal', 'save', 'miss');
                }
            }
        }
        updateZoneStats('attack');
        updatePlayerStats();
    }
    
    state.events.pop();
    
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
    
    addEventMessage(`<span style="color: #7c3aed"><i class="fas fa-spinner fa-spin"></i> Generando PDF con gráficas...</span>`);
    
    setTimeout(() => {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'mm', 'a4');
            
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            
            doc.setFontSize(22);
            doc.setTextColor(40, 53, 147);
            doc.text("REPORTE DE ESTADÍSTICAS DE PORTERÍA", pageWidth / 2, 20, { align: "center" });
            
            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text("Sistema de Análisis Táctico - Portero vs Ataque", pageWidth / 2, 27, { align: "center" });
            
            const now = new Date();
            const dateStr = now.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            
            doc.setFontSize(10);
            doc.setTextColor(70, 70, 70);
            doc.text(`Generado el ${dateStr} a las ${timeStr}`, pageWidth / 2, 34, { align: "center" });
            
            doc.setDrawColor(200, 200, 200);
            doc.line(10, 38, pageWidth - 10, 38);
            
            let yPos = 45;
            
            doc.setFontSize(16);
            doc.setTextColor(0, 0, 0);
            doc.text("RESUMEN DE ESTADÍSTICAS", 10, yPos);
            yPos += 10;
            
            doc.setFontSize(11);
            const totalSaves = state.goalkeeperStats.totalSaves;
            const totalGoals = state.goalkeeperStats.totalGoals;
            const totalMisses = state.goalkeeperStats.totalMisses;
            const totalShots = totalSaves + totalGoals;
            const effectiveness = totalShots > 0 ? Math.round((totalSaves / totalShots) * 100) : 0;
            
            const statsBoxWidth = 45;
            const statsBoxHeight = 20;
            const statsSpacing = 10;
            
            doc.setFillColor(5, 150, 105);
            doc.roundedRect(10, yPos, statsBoxWidth, statsBoxHeight, 3, 3, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(18);
            doc.text(totalSaves.toString(), 10 + statsBoxWidth/2, yPos + 9, { align: "center" });
            doc.setFontSize(8);
            doc.text("PARADAS", 10 + statsBoxWidth/2, yPos + 15, { align: "center" });
            
            doc.setFillColor(220, 38, 38);
            doc.roundedRect(10 + statsBoxWidth + statsSpacing, yPos, statsBoxWidth, statsBoxHeight, 3, 3, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(18);
            doc.text(totalGoals.toString(), 10 + statsBoxWidth + statsSpacing + statsBoxWidth/2, yPos + 9, { align: "center" });
            doc.setFontSize(8);
            doc.text("GOLES RECIBIDOS", 10 + statsBoxWidth + statsSpacing + statsBoxWidth/2, yPos + 15, { align: "center" });
            
            doc.setFillColor(245, 158, 11);
            doc.roundedRect(10 + (statsBoxWidth + statsSpacing) * 2, yPos, statsBoxWidth, statsBoxHeight, 3, 3, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(18);
            doc.text(totalMisses.toString(), 10 + (statsBoxWidth + statsSpacing) * 2 + statsBoxWidth/2, yPos + 9, { align: "center" });
            doc.setFontSize(8);
            doc.text("TIROS FUERA", 10 + (statsBoxWidth + statsSpacing) * 2 + statsBoxWidth/2, yPos + 15, { align: "center" });
            
            doc.setFillColor(52, 152, 219);
            doc.roundedRect(10 + (statsBoxWidth + statsSpacing) * 3, yPos, statsBoxWidth, statsBoxHeight, 3, 3, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(18);
            doc.text(`${effectiveness}%`, 10 + (statsBoxWidth + statsSpacing) * 3 + statsBoxWidth/2, yPos + 9, { align: "center" });
            doc.setFontSize(8);
            doc.text("EFECTIVIDAD", 10 + (statsBoxWidth + statsSpacing) * 3 + statsBoxWidth/2, yPos + 15, { align: "center" });
            
            yPos += statsBoxHeight + 15;
            
            doc.setFontSize(16);
            doc.setTextColor(0, 0, 0);
            doc.text("GRÁFICAS DE ANÁLISIS", 10, yPos);
            yPos += 8;
            
            const chartsData = generateChartsData();
            
            const chart1Canvas = createChartCanvas('pie', chartsData.shotsDistribution, 
                ['Paradas', 'Goles Recibidos', 'Tiros Fuera'], 
                ['#059669', '#dc2626', '#f59e0b'],
                'Distribución de Tiros (Portero)');
            
            const chart1Img = chart1Canvas.toDataURL('image/png');
            doc.addImage(chart1Img, 'PNG', 10, yPos, 90, 60);
            
            const chart2Canvas = createChartCanvas('bar', chartsData.zoneEffectiveness, 
                chartsData.zoneLabels, ['#3498db'], 'Efectividad por Zona (%)');
            
            const chart2Img = chart2Canvas.toDataURL('image/png');
            doc.addImage(chart2Img, 'PNG', pageWidth - 100, yPos, 90, 60);
            
            yPos += 65;
            
            if (chartsData.playersData.length > 0) {
                const chart3Canvas = createChartCanvas('horizontalBar', chartsData.playersData, 
                    chartsData.playersLabels, ['#059669'], 'Goles por Jugador');
                
                const chart3Img = chart3Canvas.toDataURL('image/png');
                doc.addImage(chart3Img, 'PNG', 10, yPos, 180, 70);
                
                yPos += 75;
            }
            
            if (yPos > pageHeight - 30) {
                doc.addPage();
                yPos = 20;
            }
            
            doc.setFontSize(16);
            doc.text("ESTADÍSTICAS DETALLADAS POR ZONA", 10, yPos);
            yPos += 10;
            
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            
            doc.setFillColor(52, 152, 219);
            doc.rect(10, yPos, pageWidth - 20, 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.text("Zona", 15, yPos + 6);
            doc.text("Paradas", 50, yPos + 6);
            doc.text("Goles", 85, yPos + 6);
            doc.text("Total", 120, yPos + 6);
            doc.text("Efectividad", 155, yPos + 6);
            
            yPos += 8;
            doc.setTextColor(0, 0, 0);
            
            const zones = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'];
            zones.forEach((zone, index) => {
                const stats = state.goalkeeperStats.zones[zone];
                const saves = stats.saves || 0;
                const goals = stats.goals || 0;
                const total = saves + goals;
                const eff = total > 0 ? Math.round((saves / total) * 100) : 0;
                
                if (index % 2 === 0) {
                    doc.setFillColor(240, 240, 240);
                    doc.rect(10, yPos, pageWidth - 20, 6, 'F');
                }
                
                doc.text(zone, 15, yPos + 4.5);
                doc.text(saves.toString(), 50, yPos + 4.5);
                doc.text(goals.toString(), 85, yPos + 4.5);
                doc.text(total.toString(), 120, yPos + 4.5);
                doc.text(`${eff}%`, 155, yPos + 4.5);
                
                yPos += 6;
            });
            
            yPos += 10;
            
            if (state.playerNumbers.length > 0) {
                if (yPos > pageHeight - 50) {
                    doc.addPage();
                    yPos = 20;
                }
                
                doc.setFontSize(16);
                doc.text("ESTADÍSTICAS POR JUGADOR (ATAQUE)", 10, yPos);
                yPos += 10;
                
                doc.setFontSize(10);
                doc.setFillColor(5, 150, 105);
                doc.rect(10, yPos, pageWidth - 20, 8, 'F');
                doc.setTextColor(255, 255, 255);
                doc.text("Jugador", 15, yPos + 6);
                doc.text("Tiros", 45, yPos + 6);
                doc.text("Goles", 75, yPos + 6);
                doc.text("Parados", 105, yPos + 6);
                doc.text("Fuera", 135, yPos + 6);
                doc.text("% Acierto", 165, yPos + 6);
                
                yPos += 8;
                doc.setTextColor(0, 0, 0);
                
                const playerIds = state.playerNumbers.sort((a, b) => {
                    const numA = parseInt(a) || 0;
                    const numB = parseInt(b) || 0;
                    return numA - numB;
                });
                
                playerIds.forEach((playerId, index) => {
                    const playerStats = state.attackersStats.players[playerId];
                    if (!playerStats) return;
                    
                    const totalShots = playerStats.shots || 0;
                    const goals = playerStats.goals || 0;
                    const saves = playerStats.saves || 0;
                    const misses = playerStats.misses || 0;
                    const accuracy = totalShots > 0 ? Math.round((goals / totalShots) * 100) : 0;
                    
                    if (index % 2 === 0) {
                        doc.setFillColor(240, 240, 240);
                        doc.rect(10, yPos, pageWidth - 20, 6, 'F');
                    }
                    
                    doc.text(playerId, 15, yPos + 4.5);
                    doc.text(totalShots.toString(), 45, yPos + 4.5);
                    doc.text(goals.toString(), 75, yPos + 4.5);
                    doc.text(saves.toString(), 105, yPos + 4.5);
                    doc.text(misses.toString(), 135, yPos + 4.5);
                    doc.text(`${accuracy}%`, 165, yPos + 4.5);
                    
                    yPos += 6;
                });
            }
            
            doc.addPage();
            yPos = 40;
            
            doc.setFontSize(14);
            doc.setTextColor(40, 53, 147);
            doc.text("ANÁLISIS COMPLETO FINALIZADO", pageWidth / 2, yPos, { align: "center" });
            
            doc.setFontSize(11);
            doc.setTextColor(100, 100, 100);
            doc.text("Reporte generado automáticamente por el Sistema de Portería Visual", pageWidth / 2, yPos + 15, { align: "center" });
            
            yPos += 40;
            
            doc.setDrawColor(0, 0, 0);
            doc.line(pageWidth / 2 - 40, yPos, pageWidth / 2 + 40, yPos);
            
            doc.setFontSize(10);
            doc.text("Entrenador / Responsable", pageWidth / 2, yPos + 8, { align: "center" });
            
            const dateStrForFile = new Date().toISOString().split('T')[0];
            const timeStrForFile = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }).replace(/:/g, '');
            const fileName = `porteria_estadisticas_${dateStrForFile}_${timeStrForFile}.pdf`;
            
            doc.save(fileName);
            
            state.lastGeneratedPDF = doc;
            
            addEventMessage(`<span style="color: #7c3aed"><i class="fas fa-check-circle"></i> PDF generado y descargado: ${fileName}</span>`);
            
        } catch (error) {
            console.error('Error generando PDF:', error);
            addEventMessage(`<span style="color: #dc2626"><i class="fas fa-exclamation-circle"></i> Error al generar PDF: ${error.message}</span>`);
        }
    }, 500);
}

function generateChartsData() {
    const data = {
        shotsDistribution: [
            state.goalkeeperStats.totalSaves,
            state.goalkeeperStats.totalGoals,
            state.goalkeeperStats.totalMisses
        ],
        zoneLabels: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'],
        zoneEffectiveness: [],
        playersLabels: [],
        playersData: []
    };
    
    data.zoneLabels.forEach(zone => {
        const stats = state.goalkeeperStats.zones[zone];
        const total = stats.saves + stats.goals;
        const effectiveness = total > 0 ? Math.round((stats.saves / total) * 100) : 0;
        data.zoneEffectiveness.push(effectiveness);
    });
    
    const playerIds = state.playerNumbers.sort((a, b) => {
        const numA = parseInt(a) || 0;
        const numB = parseInt(b) || 0;
        return numA - numB;
    });
    
    playerIds.forEach(playerId => {
        const playerStats = state.attackersStats.players[playerId];
        if (playerStats && playerStats.shots > 0) {
            data.playersLabels.push(`J${playerId}`);
            data.playersData.push(playerStats.goals || 0);
        }
    });
    
    return data;
}

function createChartCanvas(type, data, labels, colors, title) {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    
    const ctx = canvas.getContext('2d');
    
    let chartConfig = {
        type: type === 'horizontalBar' ? 'bar' : type,
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: colors.map(c => {
                    if (c.startsWith('#')) {
                        const hex = c.replace('#', '');
                        const r = parseInt(hex.substring(0, 2), 16);
                        const g = parseInt(hex.substring(2, 4), 16);
                        const b = parseInt(hex.substring(4, 6), 16);
                        return `rgba(${r}, ${g}, ${b}, 0.8)`;
                    }
                    return c.replace(')', ', 0.8)').replace('rgb', 'rgba');
                }),
                borderWidth: 1
            }]
        },
        options: {
            responsive: false,
            indexAxis: type === 'horizontalBar' ? 'y' : 'x',
            plugins: {
                title: {
                    display: true,
                    text: title,
                    font: { size: 14, weight: 'bold' }
                },
                legend: {
                    display: type === 'pie',
                    position: 'right'
                }
            },
            scales: type === 'pie' ? {} : {
                y: {
                    beginAtZero: true,
                    max: type === 'bar' ? 100 : Math.max(...data) + 2
                },
                x: type === 'horizontalBar' ? {
                    beginAtZero: true,
                    max: Math.max(...data) + 2
                } : {}
            }
        }
    };
    
    new Chart(ctx, chartConfig);
    
    return canvas;
}

// ---------- FUNCIONALIDAD DE EMAIL ----------
function showEmailModal() {
    if (!state.lastGeneratedPDF) {
        addEventMessage(`<span style="color: #ea580c"><i class="fas fa-info-circle"></i> Primero genera un PDF para enviar por email</span>`);
        generatePDF();
        setTimeout(showEmailModal, 1500);
        return;
    }
    
    $("email-modal").style.display = "flex";
}

function sendEmail() {
    const emailTo = $("email-to").value;
    const emailSubject = $("email-subject").value;
    const emailMessage = $("email-message").value;
    
    if (!emailTo || !emailTo.includes('@')) {
        alert('Por favor, introduce un email válido');
        return;
    }
    
    addEventMessage(`<span style="color: #ea580c"><i class="fas fa-spinner fa-spin"></i> Preparando envío de email...</span>`);
    
    setTimeout(() => {
        const subject = encodeURIComponent(emailSubject);
        const body = encodeURIComponent(`${emailMessage}\n\n---\nAdjunto: Reporte de Estadísticas de Portería\nFecha: ${new Date().toLocaleDateString()}`);
        
        const mailtoLink = `mailto:${emailTo}?subject=${subject}&body=${body}`;
        
        if (confirm(`¿Deseas abrir tu cliente de email para enviar el reporte a ${emailTo}?\n\nNota: Debes adjuntar manualmente el PDF generado.`)) {
            window.open(mailtoLink, '_blank');
        }
        
        addEventMessage(`<span style="color: #059669"><i class="fas fa-check-circle"></i> Email preparado para ${emailTo}</span>`);
        hideEmailModal();
        
    }, 1500);
}

function hideEmailModal() {
    $("email-modal").style.display = "none";
    $("email-to").value = "";
    $("email-message").value = "";
}

// ---------- INICIALIZACIÓN ----------
document.addEventListener("DOMContentLoaded", function() {
    createGoalVisuals();
    
    $("save-btn-defense").addEventListener("click", () => registerDefenseAction('save'));
    $("goal-btn-defense").addEventListener("click", () => registerDefenseAction('goal'));
    $("outside-btn-defense").addEventListener("click", () => registerDefenseAction('miss'));
    
    $("goal-btn-attack").addEventListener("click", () => registerAttackAction('goal'));
    $("save-btn-attack").addEventListener("click", () => registerAttackAction('save'));
    $("outside-btn-attack").addEventListener("click", () => registerAttackAction('miss'));
    
    $("reset-btn").addEventListener("click", resetLastAction);
    
    $("add-player-btn").addEventListener("click", addPlayer);
    $("player-number-input").addEventListener("keypress", function(e) {
        if (e.key === 'Enter') addPlayer();
    });
    
    $("pdf-btn").addEventListener("click", generatePDF);
    
    $("email-btn").addEventListener("click", showEmailModal);
    
    $("cancel-email-btn").addEventListener("click", hideEmailModal);
    $("send-email-btn").addEventListener("click", sendEmail);
    
    $("email-modal").addEventListener("click", function(e) {
        if (e.target === this) hideEmailModal();
    });
    
    setTimeout(() => {
        addEventMessage(`<span style="color: #3498db"><i class="fas fa-info-circle"></i> Sistema de Portería Dual iniciado</span>`);
        addEventMessage(`<span style="color: #3498db"><i class="fas fa-info-circle"></i> IZQUIERDA: Defensa (Portero) | DERECHA: Ataque (Jugadores)</span>`);
        addEventMessage(`<span style="color: #3498db"><i class="fas fa-info-circle"></i> Los eventos NO se incluyen en el PDF, solo en la web</span>`);
    }, 500);
});
