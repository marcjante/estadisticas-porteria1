# Sistema de Estadísticas de Portería

Sistema web para registrar y analizar estadísticas de portería en deportes como hockey.

## Características

- **Interfaz dual**: Portería de defensa (portero) y ataque (jugadores)
- **Registro visual**: Selección de zonas en la portería con colores diferentes
- **Gestión de jugadores**: Hasta 8 jugadores con estadísticas individuales
- **Estadísticas en tiempo real**: Actualización automática
- **PDF con gráficas**: Descarga automática con análisis visual
- **Eventos del partido**: Registro completo de acciones
- **Responsive**: Funciona en móviles y escritorio

## Tecnologías utilizadas

- HTML5
- CSS3 (Flexbox, Grid, Media Queries)
- JavaScript (ES6+)
- Chart.js para gráficas
- jsPDF para generación de PDF
- Font Awesome para iconos

## Instalación y Uso

### Opción 1: GitHub Pages
1. Sube estos archivos a tu repositorio de GitHub
2. Activa GitHub Pages en la configuración del repositorio
3. Accede a: `https://tuusuario.github.io/estadisticas-porteria/`

### Opción 2: Local
1. Descarga o clona este repositorio
2. Abre `index.html` en tu navegador
3. ¡Listo para usar!

## Cómo usar el sistema

### 1. Defensa (Portero)
- Selecciona una zona en la portería izquierda
- Haz clic en "Parada" o "Gol Recibido"
- Para tiros fuera, usa "Tiro Fuera de Portería"

### 2. Ataque (Jugadores)
- Primero agrega jugadores con el botón "Agregar"
- Selecciona un jugador y una zona en la portería derecha
- Haz clic en "Gol" o "Parado"
- Para tiros fuera, usa "Tiro Fuera de Portería"

### 3. Funcionalidades adicionales
- **Eliminar última acción**: Botón "Eliminar Última Acción"
- **Generar PDF**: Descarga automática con gráficas
- **Enviar por email**: Prepara el informe para compartir

## Estructura del PDF generado

El PDF incluye:
- Resumen de estadísticas
- Gráficas de análisis (distribución, efectividad, jugadores)
- Tablas detalladas por zona y jugador
- Firma del entrenador

## Características técnicas

- **Sin backend**: Todo funciona en el navegador
- **Sin dependencias descargadas**: Usa CDN para librerías
- **Persistencia**: Los datos se mantienen durante la sesión
- **Compatible**: Funciona en Chrome, Firefox, Safari y Edge

## Capturas de pantalla

1. **Interfaz principal**: Dos porterías con controles
2. **Estadísticas**: Resumen y tabla de jugadores
3. **Eventos**: Lista de acciones del partido
4. **PDF**: Reporte profesional con gráficas

## Licencia

Este proyecto está bajo la Licencia MIT.

## Contribuir

1. Haz fork del repositorio
2. Crea una rama para tu funcionalidad
3. Haz commit de tus cambios
4. Push a la rama
5. Abre un Pull Request

## Autor

Desarrollado por [Tu Nombre]

## Agradecimientos

- Hoquei Palau Solita i Plegamants
- Comunidad de desarrollo web
- Contribuidores de librerías open source
