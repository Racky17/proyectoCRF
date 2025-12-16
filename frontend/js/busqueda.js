/* Script para la página de búsqueda de participantes */

const API = "http://localhost:8080/api/participantecrf";
let todosLosParticipantes = [];
let participantesFiltrados = [];
let userIdLogueado = null;

// Cargar todos los participantes al iniciar
async function cargarParticipantes() {
    const tabla = document.getElementById("tablaResultados");
    tabla.innerHTML = `<tr><td colspan="5">Cargando...</td></tr>`;

    // Obtener el userId del sessionStorage
    userIdLogueado = sessionStorage.getItem('userId');

    if (!userIdLogueado) {
        tabla.innerHTML = `<tr><td colspan="5">Por favor, inicia sesión para ver los participantes</td></tr>`;
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }

    try {
        const resp = await fetch(API);

        if (!resp.ok) {
            const txt = await resp.text();
            tabla.innerHTML = `<tr><td colspan="5">Error: ${txt}</td></tr>`;
            return;
        }

        const listaCompleta = await resp.json();

        // Filtrar solo los participantes del usuario logueado
        todosLosParticipantes = listaCompleta.filter(p =>
            p.idUser === parseInt(userIdLogueado, 10)
        );

        participantesFiltrados = [...todosLosParticipantes];
        mostrarResultados(participantesFiltrados);

    } catch (e) {
        console.error(e);
        tabla.innerHTML = `<tr><td colspan="5">No se pudo conectar al backend</td></tr>`;
    }
}

// Mostrar resultados en la tabla
function mostrarResultados(lista) {
    const tabla = document.getElementById("tablaResultados");
    const infoDiv = document.getElementById("resultsInfo");
    const countSpan = document.getElementById("resultCount");

    if (!Array.isArray(lista) || lista.length === 0) {
        tabla.innerHTML = `<tr><td colspan="5">No se encontraron participantes</td></tr>`;
        infoDiv.style.display = "none";
        return;
    }

    // Actualizar información de resultados
    countSpan.textContent = lista.length;
    infoDiv.style.display = "block";

    // Generar filas de la tabla
    tabla.innerHTML = "";
    lista.forEach(p => {
        const fechaStr = (p.fechaInclusion || "").toString().slice(0, 10);
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${p.codPart ?? ""}</td>
            <td>${p.nombre ?? ""}</td>
            <td>${p.grupo ?? ""}</td>
            <td>${fechaStr}</td>
            <td><a href="detalle_participante.html?id=${p.codPart}" style="color: #2d89ff; text-decoration: none; font-weight: bold;">Ver más →</a></td>
        `;
        tabla.appendChild(tr);
    });
}

// Aplicar filtros
function aplicarFiltros() {
    const grupoFiltro = document.getElementById("filtroGrupo").value.toLowerCase();
    const nombreFiltro = document.getElementById("filtroNombre").value.toLowerCase().trim();
    const fechaDesde = document.getElementById("filtroFechaDesde").value;
    const fechaHasta = document.getElementById("filtroFechaHasta").value;

    participantesFiltrados = todosLosParticipantes.filter(p => {
        // Filtro por grupo
        if (grupoFiltro && p.grupo.toLowerCase() !== grupoFiltro) {
            return false;
        }

        // Filtro por nombre (case-insensitive)
        if (nombreFiltro && !(p.nombre || "").toLowerCase().includes(nombreFiltro)) {
            return false;
        }

        // Filtro por fecha
        const fechaParticipante = (p.fechaInclusion || "").toString().slice(0, 10);

        if (fechaDesde && fechaParticipante < fechaDesde) {
            return false;
        }

        if (fechaHasta && fechaParticipante > fechaHasta) {
            return false;
        }

        return true;
    });

    mostrarResultados(participantesFiltrados);
}

// Limpiar filtros
function limpiarFiltros() {
    document.getElementById("filtroGrupo").value = "";
    document.getElementById("filtroNombre").value = "";
    document.getElementById("filtroFechaDesde").value = "";
    document.getElementById("filtroFechaHasta").value = "";

    participantesFiltrados = [...todosLosParticipantes];
    mostrarResultados(participantesFiltrados);
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
    // Mostrar información del usuario
    const userName = sessionStorage.getItem('userName') || 'Usuario';
    const userInfo = document.getElementById('userInfo');
    if (userInfo) {
        userInfo.textContent = `👤 ${userName}`;
    }

    // Cargar participantes al inicio
    cargarParticipantes();

    // Botón de búsqueda
    document.getElementById("btnBuscar").addEventListener("click", aplicarFiltros);

    // Botón de limpiar
    document.getElementById("btnLimpiar").addEventListener("click", limpiarFiltros);

    // Volver al inicio
    document.getElementById("btnBackToHome").addEventListener("click", () => {
        window.location.href = "home.html";
    });

    // Cerrar sesión
    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            sessionStorage.clear();
            window.location.href = "index.html";
        });
    }

    // Aplicar filtros al presionar Enter en los campos de texto
    document.getElementById("filtroNombre").addEventListener("keypress", (e) => {
        if (e.key === "Enter") aplicarFiltros();
    });

    // Aplicar filtros automáticamente al cambiar fechas o grupo
    document.getElementById("filtroGrupo").addEventListener("change", aplicarFiltros);
    document.getElementById("filtroFechaDesde").addEventListener("change", aplicarFiltros);
    document.getElementById("filtroFechaHasta").addEventListener("change", aplicarFiltros);
});

