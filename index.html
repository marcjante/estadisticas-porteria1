// ===== VARIABLES GLOBALES MEJORADAS =====
let playersStats = {}; // Para estadísticas por jugador
let teamTotals = { // Para totales del equipo
    shots: 0,
    goals: 0,
    saves: 0,
    misses: 0
};

// ===== FUNCIONES PARA ACTUALIZAR ESTADÍSTICAS =====

function updatePlayerStats(playerNumber, shotType) {
    if (!playersStats[playerNumber]) {
        playersStats[playerNumber] = {
            shots: 0,
            goals: 0,
            saves: 0,
            misses: 0
        };
    }
    
    // Actualizar estadísticas del jugador
    switch(shotType) {
        case 'goal':
            playersStats[playerNumber].shots++;
            playersStats[playerNumber].goals++;
            teamTotals.shots++;
            teamTotals.goals++;
            break;
        case 'save':
            playersStats[playerNumber].shots++;
            playersStats[playerNumber].saves++;
            teamTotals.shots++;
            teamTotals.saves++;
            break;
        case 'miss':
            playersStats[playerNumber].shots++;
            playersStats[playerNumber].misses++;
            teamTotals.shots++;
            teamTotals.misses++;
            break;
    }
    
    // Actualizar tabla de jugadores
    updatePlayersStatsTable();
    
    // Actualizar resumen
    updateSummaryStats();
}

function updatePlayersStatsTable() {
    const tbody = document.getElementById('players-stats-body');
    tbody.innerHTML = '';
    
    // Calcular totales para la fila de equipo
    let totalShots = 0;
    let totalGoals = 0;
    let totalSaves = 0;
    let totalMisses = 0;
    
    // Crear filas para cada jugador
    Object.keys(playersStats).sort().forEach(playerNumber => {
        const stats = playersStats[playerNumber];
        
        totalShots += stats.shots;
        totalGoals += stats.goals;
        totalSaves += stats.saves;
        totalMisses += stats.misses;
        
        const accuracy = stats.shots > 0 ? 
            Math.round((stats.goals / stats.shots) * 100) : 0;
        
        const row = document.createElement('tr');
        
        // Determinar clase de porcentaje
        let accuracyClass = '';
        if (accuracy >= 50) accuracyClass = 'high-accuracy';
        else if (accuracy >= 25) accuracyClass = 'medium-accuracy';
        else accuracyClass = 'low-accuracy';
        
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
    
    // Actualizar totales en el tfoot
    const teamAccuracy = totalShots > 0 ? 
        Math.round((totalGoals / totalShots) * 100) : 0;
    
    document.getElementById('total-team-shots').textContent = totalShots;
    document.getElementById('total-team-goals').textContent = totalGoals;
    document.getElementById('total-team-saves').textContent = totalSaves;
    document.getElementById('total-team-misses').textContent = totalMisses;
    document.getElementById('total-team-accuracy').textContent = `${teamAccuracy}%`;
    
    // Actualizar variables globales
    teamTotals.shots = totalShots;
    teamTotals.goals = totalGoals;
    teamTotals.saves = totalSaves;
    teamTotals.misses = totalMisses;
}

function updateSummaryStats() {
    // Actualizar valores del resumen
    document.getElementById('total-shots').textContent = teamTotals.shots;
    document.getElementById('total-goals').textContent = teamTotals.goals;
    document.getElementById('total-saves-summary').textContent = teamTotals.saves;
    
    // Calcular efectividad del equipo
    const teamEffectiveness = teamTotals.shots > 0 ? 
        Math.round((teamTotals.goals / teamTotals.shots) * 100) : 0;
    document.getElementById('team-effectiveness').textContent = `${teamEffectiveness}%`;
    
    // Calcular efectividad del portero
    const goalkeeperShots = teamTotals.goals + teamTotals.saves;
    const goalkeeperEffectiveness = goalkeeperShots > 0 ? 
        Math.round((teamTotals.saves / goalkeeperShots) * 100) : 0;
    document.getElementById('goalkeeper-effectiveness').textContent = `${goalkeeperEffectiveness}%`;
}

// ===== FUNCIÓN PARA ELIMINAR ÚLTIMA ACCIÓN =====
function removeLastAction() {
    // Implementar lógica para eliminar la última acción registrada
    // Esto debe actualizar tanto las estadísticas como la lista de eventos
    
    // Ejemplo básico:
    if (events.length > 0) {
        const lastEvent = events.pop();
        
        // Revertir estadísticas según el tipo de evento
        if (lastEvent.player && playersStats[lastEvent.player]) {
            const playerStats = playersStats[lastEvent.player];
            
            switch(lastEvent.type) {
                case 'goal':
                    playerStats.shots--;
                    playerStats.goals--;
                    teamTotals.shots--;
                    teamTotals.goals--;
                    break;
                case 'save':
                    playerStats.shots--;
                    playerStats.saves--;
                    teamTotals.shots--;
                    teamTotals.saves--;
                    break;
                case 'miss':
                    playerStats.shots--;
                    playerStats.misses--;
                    teamTotals.shots--;
                    teamTotals.misses--;
                    break;
            }
            
            // Si el jugador no tiene más estadísticas, eliminarlo
            if (playerStats.shots === 0) {
                delete playersStats[lastEvent.player];
            }
        }
        
        // Actualizar interfaces
        updatePlayersStatsTable();
        updateSummaryStats();
        updateEventsList();
        
        // Mostrar confirmación
        showNotification('Última acción eliminada correctamente', 'success');
    } else {
        showNotification('No hay acciones para eliminar', 'warning');
    }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar tabla con datos vacíos
    updatePlayersStatsTable();
    updateSummaryStats();
    
    // Configurar botón de eliminar última acción
    document.getElementById('reset-btn').addEventListener('click', removeLastAction);
    
    // El resto de la inicialización del sistema...
});
