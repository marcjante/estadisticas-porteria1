function updatePlayerStats() {
    const statsBody = $("players-stats-body");
    if (!statsBody) return;
    
    statsBody.innerHTML = "";
    
    const playerIds = state.playerNumbers.sort((a, b) => {
        const numA = parseInt(a) || 0;
        const numB = parseInt(b) || 0;
        return numA - numB;
    });
    
    // Variables para sumar totales
    let totalShotsSum = 0;
    let totalGoalsSum = 0;
    let totalSavesSum = 0;
    let totalMissesSum = 0;
    let totalAccuracySum = 0;
    let playerCount = 0;
    
    playerIds.forEach(playerId => {
        const playerStats = state.attackersStats.players[playerId];
        if (!playerStats) return;
        
        const totalShots = playerStats.shots;
        const goals = playerStats.goals;
        const saves = playerStats.saves;
        const misses = playerStats.misses;
        const accuracy = totalShots > 0 ? Math.round((goals / totalShots) * 100) : 0;
        
        // Acumular para totales
        totalShotsSum += totalShots;
        totalGoalsSum += goals;
        totalSavesSum += saves;
        totalMissesSum += misses;
        if (totalShots > 0) {
            totalAccuracySum += accuracy;
            playerCount++;
        }
        
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
    
    // Agregar fila de totales si hay jugadores
    if (playerIds.length > 0) {
        const totalRow = document.createElement("tr");
        totalRow.className = "players-total-row";
        
        const avgAccuracy = playerCount > 0 ? Math.round(totalAccuracySum / playerCount) : 0;
        
        totalRow.innerHTML = `
            <td><strong>TOTALES</strong></td>
            <td><strong>${totalShotsSum}</strong></td>
            <td><strong>${totalGoalsSum}</strong></td>
            <td><strong>${totalSavesSum}</strong></td>
            <td><strong>${totalMissesSum}</strong></td>
            <td><strong>${avgAccuracy}%</strong></td>
        `;
        
        statsBody.appendChild(totalRow);
    }
}
