function generatePDF() {
    addEventMessage(`<span style="color: #7c3aed"><i class="fas fa-spinner fa-spin"></i> Generando PDF claro y visible...</span>`);
    
    setTimeout(() => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        // Configuración inicial
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Título principal - MÁS VISIBLE
        doc.setFontSize(24);
        doc.setTextColor(40, 53, 147);
        doc.setFont("helvetica", "bold");
        doc.text("REPORTE DE ESTADÍSTICAS COMPLETAS", pageWidth / 2, 20, { align: "center" });
        
        doc.setFontSize(14);
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "normal");
        doc.text("Sistema de Análisis Táctico - Portero vs Jugadores", pageWidth / 2, 28, { align: "center" });
        
        // Fecha y hora - MÁS VISIBLE
        const now = new Date();
        const dateStr = now.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        
        doc.setFontSize(11);
        doc.setTextColor(70, 70, 70);
        doc.text(`Generado el ${dateStr} a las ${timeStr}`, pageWidth / 2, 35, { align: "center" });
        
        // Línea separadora gruesa
        doc.setLineWidth(1);
        doc.setDrawColor(52, 152, 219);
        doc.line(15, 40, pageWidth - 15, 40);
        
        // ============ PRIMERA PÁGINA: RESUMEN PRINCIPAL ============
        let yPos = 50;
        
        // Resumen de estadísticas - MÁS VISIBLE
        doc.setFontSize(18);
        doc.setTextColor(44, 62, 80);
        doc.setFont("helvetica", "bold");
        doc.text("RESUMEN PRINCIPAL", 15, yPos);
        yPos += 12;
        
        // Estadísticas del portero en cuadros grandes
        const totalSaves = state.goalkeeperStats.totalSaves;
        const totalGoals = state.goalkeeperStats.totalGoals;
        const totalMisses = state.goalkeeperStats.totalMisses;
        const totalShots = totalSaves + totalGoals;
        const effectiveness = totalShots > 0 ? Math.round((totalSaves / totalShots) * 100) : 0;
        
        // Cuadro grande para cada estadística
        const statsBoxWidth = 45;
        const statsBoxHeight = 25;
        const statsSpacing = 12;
        
        // Cuadro 1: Paradas - AZUL
        doc.setFillColor(52, 152, 219);
        doc.roundedRect(15, yPos, statsBoxWidth, statsBoxHeight, 5, 5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text(totalSaves.toString(), 15 + statsBoxWidth/2, yPos + 12, { align: "center" });
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("PARADAS", 15 + statsBoxWidth/2, yPos + 18, { align: "center" });
        
        // Cuadro 2: Goles recibidos - ROJO
        doc.setFillColor(220, 38, 38);
        doc.roundedRect(15 + statsBoxWidth + statsSpacing, yPos, statsBoxWidth, statsBoxHeight, 5, 5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text(totalGoals.toString(), 15 + statsBoxWidth + statsSpacing + statsBoxWidth/2, yPos + 12, { align: "center" });
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("GOLES RECIBIDOS", 15 + statsBoxWidth + statsSpacing + statsBoxWidth/2, yPos + 18, { align: "center" });
        
        // Cuadro 3: Tiros fuera - NARANJA
        doc.setFillColor(245, 158, 11);
        doc.roundedRect(15 + (statsBoxWidth + statsSpacing) * 2, yPos, statsBoxWidth, statsBoxHeight, 5, 5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text(totalMisses.toString(), 15 + (statsBoxWidth + statsSpacing) * 2 + statsBoxWidth/2, yPos + 12, { align: "center" });
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("TIROS FUERA", 15 + (statsBoxWidth + statsSpacing) * 2 + statsBoxWidth/2, yPos + 18, { align: "center" });
        
        // Cuadro 4: Efectividad - VERDE
        doc.setFillColor(5, 150, 105);
        doc.roundedRect(15 + (statsBoxWidth + statsSpacing) * 3, yPos, statsBoxWidth, statsBoxHeight, 5, 5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text(`${effectiveness}%`, 15 + (statsBoxWidth + statsSpacing) * 3 + statsBoxWidth/2, yPos + 12, { align: "center" });
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("EFECTIVIDAD", 15 + (statsBoxWidth + statsSpacing) * 3 + statsBoxWidth/2, yPos + 18, { align: "center" });
        
        yPos += statsBoxHeight + 20;
        
        // ============ ESTADÍSTICAS DETALLADAS POR ZONA ============
        doc.setFontSize(16);
        doc.setTextColor(44, 62, 80);
        doc.setFont("helvetica", "bold");
        doc.text("ESTADÍSTICAS DETALLADAS POR ZONA (PORTERO)", 15, yPos);
        yPos += 10;
        
        // Tabla de zonas del portero - MEJOR FORMATO
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        
        // Encabezado de tabla - AZUL
        doc.setFillColor(52, 152, 219);
        doc.rect(15, yPos, pageWidth - 30, 10, 'F');
        doc.text("ZONA", 20, yPos + 7);
        doc.text("PARADAS", 50, yPos + 7);
        doc.text("GOLES", 80, yPos + 7);
        doc.text("TOTAL", 110, yPos + 7);
        doc.text("EFECTIVIDAD", 140, yPos + 7);
        doc.text("PORCENTAJE", 170, yPos + 7);
        
        yPos += 10;
        doc.setTextColor(0, 0, 0);
        
        // Filas de datos
        const zones = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'];
        let zoneIndex = 0;
        
        zones.forEach((zone) => {
            const stats = state.goalkeeperStats.zones[zone];
            const saves = stats.saves || 0;
            const goals = stats.goals || 0;
            const total = saves + goals;
            const eff = total > 0 ? Math.round((saves / total) * 100) : 0;
            
            // Fondo alternado para mejor lectura
            if (zoneIndex % 2 === 0) {
                doc.setFillColor(240, 240, 240);
                doc.rect(15, yPos, pageWidth - 30, 8, 'F');
            }
            
            doc.setFont("helvetica", "bold");
            doc.text(zone, 20, yPos + 6);
            doc.setFont("helvetica", "normal");
            doc.text(saves.toString(), 50, yPos + 6);
            doc.text(goals.toString(), 80, yPos + 6);
            doc.text(total.toString(), 110, yPos + 6);
            
            // Barra de efectividad visual
            if (total > 0) {
                const barWidth = 40;
                const filledWidth = (eff / 100) * barWidth;
                
                // Fondo de barra
                doc.setDrawColor(220, 220, 220);
                doc.setFillColor(240, 240, 240);
                doc.rect(140, yPos + 2, barWidth, 4, 'F');
                doc.rect(140, yPos + 2, barWidth, 4, 'S');
                
                // Barra de progreso
                if (eff >= 70) doc.setFillColor(5, 150, 105); // Verde
                else if (eff >= 40) doc.setFillColor(245, 158, 11); // Naranja
                else doc.setFillColor(220, 38, 38); // Rojo
                
                doc.rect(140, yPos + 2, filledWidth, 4, 'F');
            }
            
            doc.text(`${eff}%`, 170, yPos + 6);
            
            yPos += 8;
            zoneIndex++;
        });
        
        yPos += 10;
        
        // ============ ESTADÍSTICAS POR JUGADOR ============
        if (state.playerNumbers.length > 0) {
            // Nueva página si es necesario
            if (yPos > pageHeight - 80) {
                doc.addPage();
                yPos = 20;
            }
            
            doc.setFontSize(16);
            doc.setTextColor(44, 62, 80);
            doc.setFont("helvetica", "bold");
            doc.text("ESTADÍSTICAS POR JUGADOR (ATAQUE)", 15, yPos);
            yPos += 10;
            
            // Encabezado de tabla de jugadores - VERDE
            doc.setFontSize(11);
            doc.setTextColor(255, 255, 255);
            doc.setFillColor(5, 150, 105);
            doc.rect(15, yPos, pageWidth - 30, 10, 'F');
            doc.text("JUGADOR", 20, yPos + 7);
            doc.text("TIROS", 45, yPos + 7);
            doc.text("GOLES", 70, yPos + 7);
            doc.text("PARADOS", 95, yPos + 7);
            doc.text("FUERA", 120, yPos + 7);
            doc.text("% ACIERTO", 145, yPos + 7);
            doc.text("RENDIMIENTO", 170, yPos + 7);
            
            yPos += 10;
            doc.setTextColor(0, 0, 0);
            
            // Ordenar jugadores
            const playerIds = state.playerNumbers.sort((a, b) => {
                const numA = parseInt(a) || 0;
                const numB = parseInt(b) || 0;
                return numA - numB;
            });
            
            // Variables para totales
            let totalShotsSum = 0;
            let totalGoalsSum = 0;
            let totalSavesSum = 0;
            let totalMissesSum = 0;
            let playerWithShotsCount = 0;
            
            playerIds.forEach((playerId, index) => {
                const playerStats = state.attackersStats.players[playerId];
                if (!playerStats) return;
                
                const totalShots = playerStats.shots || 0;
                const goals = playerStats.goals || 0;
                const saves = playerStats.saves || 0;
                const misses = playerStats.misses || 0;
                const accuracy = totalShots > 0 ? Math.round((goals / totalShots) * 100) : 0;
                
                // Acumular totales
                totalShotsSum += totalShots;
                totalGoalsSum += goals;
                totalSavesSum += saves;
                totalMissesSum += misses;
                if (totalShots > 0) playerWithShotsCount++;
                
                // Fondo alternado
                if (index % 2 === 0) {
                    doc.setFillColor(240, 240, 240);
                    doc.rect(15, yPos, pageWidth - 30, 8, 'F');
                }
                
                // Número de jugador con fondo de color según rendimiento
                if (totalShots > 0) {
                    doc.setFillColor(accuracy >= 50 ? 'rgba(5, 150, 105, 0.8)' : 
                                   accuracy >= 30 ? 'rgba(245, 158, 11, 0.8)' : 
                                   'rgba(220, 38, 38, 0.8)');
                    doc.circle(20, yPos + 4, 3, 'F');
                }
                
                doc.setFont("helvetica", "bold");
                doc.text(playerId, 20, yPos + 6);
                doc.setFont("helvetica", "normal");
                doc.text(totalShots.toString(), 45, yPos + 6);
                doc.text(goals.toString(), 70, yPos + 6);
                doc.text(saves.toString(), 95, yPos + 6);
                doc.text(misses.toString(), 120, yPos + 6);
                doc.text(`${accuracy}%`, 145, yPos + 6);
                
                // Indicador de rendimiento visual
                if (totalShots > 0) {
                    const performanceWidth = 40;
                    const filledWidth = (accuracy / 100) * performanceWidth;
                    
                    // Fondo
                    doc.setDrawColor(220, 220, 220);
                    doc.setFillColor(240, 240, 240);
                    doc.rect(170, yPos + 2, performanceWidth, 4, 'F');
                    doc.rect(170, yPos + 2, performanceWidth, 4, 'S');
                    
                    // Barra según porcentaje
                    if (accuracy >= 50) doc.setFillColor(5, 150, 105);
                    else if (accuracy >= 30) doc.setFillColor(245, 158, 11);
                    else doc.setFillColor(220, 38, 38);
                    
                    doc.rect(170, yPos + 2, filledWidth, 4, 'F');
                }
                
                yPos += 8;
            });
            
            // FILA DE TOTALES - DESTACADA
            yPos += 5;
            doc.setFillColor(44, 62, 80);
            doc.rect(15, yPos, pageWidth - 30, 10, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            
            const avgAccuracy = playerWithShotsCount > 0 ? Math.round(totalGoalsSum / totalShotsSum * 100) : 0;
            
            doc.text("TOTALES", 20, yPos + 7);
            doc.text(totalShotsSum.toString(), 45, yPos + 7);
            doc.text(totalGoalsSum.toString(), 70, yPos + 7);
            doc.text(totalSavesSum.toString(), 95, yPos + 7);
            doc.text(totalMissesSum.toString(), 120, yPos + 7);
            doc.text(`${avgAccuracy}%`, 145, yPos + 7);
            
            // Barra de totales
            if (totalShotsSum > 0) {
                const totalWidth = 40;
                const totalFilled = (avgAccuracy / 100) * totalWidth;
                
                doc.setDrawColor(255, 255, 255);
                doc.setFillColor(100, 100, 100);
                doc.rect(170, yPos + 2, totalWidth, 4, 'F');
                doc.rect(170, yPos + 2, totalWidth, 4, 'S');
                
                if (avgAccuracy >= 50) doc.setFillColor(5, 150, 105);
                else if (avgAccuracy >= 30) doc.setFillColor(245, 158, 11);
                else doc.setFillColor(220, 38, 38);
                
                doc.rect(170, yPos + 2, totalFilled, 4, 'F');
            }
            
            yPos += 15;
        }
        
        // ============ RESUMEN FINAL ============
        if (yPos > pageHeight - 50) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFontSize(16);
        doc.setTextColor(44, 62, 80);
        doc.setFont("helvetica", "bold");
        doc.text("RESUMEN FINAL Y CONCLUSIONES", 15, yPos);
        yPos += 15;
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        
        // Análisis de rendimiento
        const gkEffectiveness = totalShots > 0 ? Math.round((totalSaves / totalShots) * 100) : 0;
        let analysis = "";
        
        if (gkEffectiveness >= 80) {
            analysis = "Excelente rendimiento del portero. Efectividad muy alta.";
        } else if (gkEffectiveness >= 60) {
            analysis = "Buen rendimiento del portero. Efectividad aceptable.";
        } else if (gkEffectiveness >= 40) {
            analysis = "Rendimiento regular del portero. Áreas de mejora identificadas.";
        } else {
            analysis = "Rendimiento bajo del portero. Necesita trabajo en áreas específicas.";
        }
        
        doc.text(`Efectividad del portero: ${gkEffectiveness}%`, 20, yPos);
        yPos += 7;
        doc.text(`Análisis: ${analysis}`, 20, yPos);
        yPos += 10;
        
        // Zonas más vulnerables
        let vulnerableZones = [];
        zones.forEach(zone => {
            const stats = state.goalkeeperStats.zones[zone];
            const total = stats.saves + stats.goals;
            if (total > 0) {
                const eff = Math.round((stats.saves / total) * 100);
                if (eff < 50) vulnerableZones.push(`${zone} (${eff}%)`);
            }
        });
        
        if (vulnerableZones.length > 0) {
            doc.text(`Zonas más vulnerables: ${vulnerableZones.join(", ")}`, 20, yPos);
            yPos += 10;
        }
        
        // Mejor jugador atacante
        if (state.playerNumbers.length > 0) {
            let bestPlayer = null;
            let bestAccuracy = 0;
            
            state.playerNumbers.forEach(playerId => {
                const playerStats = state.attackersStats.players[playerId];
                if (playerStats && playerStats.shots > 0) {
                    const accuracy = Math.round((playerStats.goals / playerStats.shots) * 100);
                    if (accuracy > bestAccuracy) {
                        bestAccuracy = accuracy;
                        bestPlayer = playerId;
                    }
                }
            });
            
            if (bestPlayer) {
                doc.text(`Jugador más efectivo: ${bestPlayer} (${bestAccuracy}% de acierto)`, 20, yPos);
                yPos += 7;
            }
        }
        
        // ============ PIE DE PÁGINA FINAL ============
        doc.addPage();
        yPos = pageHeight / 2 - 20;
        
        doc.setFontSize(24);
        doc.setTextColor(40, 53, 147);
        doc.setFont("helvetica", "bold");
        doc.text("REPORTE COMPLETO FINALIZADO", pageWidth / 2, yPos, { align: "center" });
        
        doc.setFontSize(14);
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "normal");
        doc.text("Hoquei Palau Solita i Plegamants", pageWidth / 2, yPos + 15, { align: "center" });
        
        doc.setFontSize(11);
        doc.text("Sistema de Análisis Táctico - Versión 2.0", pageWidth / 2, yPos + 25, { align: "center" });
        doc.text(`Fecha de generación: ${new Date().toLocaleString('es-ES')}`, pageWidth / 2, yPos + 35, { align: "center" });
        
        // Guardar PDF
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        state.lastGeneratedPDF = doc;
        state.pdfBlob = pdfBlob;
        
        // Mostrar vista previa
        $("pdf-preview").style.display = "block";
        const pdfViewer = $("pdf-viewer");
        pdfViewer.src = pdfUrl;
        pdfViewer.style.display = "block";
        
        $("pdf-preview").scrollIntoView({ behavior: 'smooth' });
        
        addEventMessage(`<span style="color: #7c3aed"><i class="fas fa-check-circle"></i> PDF generado sin gráficas - Diseño optimizado para claridad</span>`);
        
    }, 500);
}

// ELIMINAR las funciones relacionadas con gráficas que ya no se usan:
// function generateChartsData() { ... }
// function createChartCanvas() { ... }
