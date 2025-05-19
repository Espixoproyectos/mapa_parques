// Cargar los puntos de interés desde el archivo JSON
fetch('puntos-de-interes.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error al cargar el archivo JSON: ${response.status}`);
        }
        return response.json();
    })
    .then(puntosDeInteres => {
        // Verificar que los datos se hayan cargado correctamente
        if (!puntosDeInteres || puntosDeInteres.length === 0) {
            console.error("No hay puntos de interés disponibles.");
            return;
        }

        // Asignar los datos cargados a una variable global (opcional)
        window.puntosDeInteres = puntosDeInteres;

        // Inicializar el mapa y cargar los puntos de interés
        cargarPuntosDeInteres(puntosDeInteres);
    })
    .catch(error => {
        console.error("Error al cargar los puntos de interés:", error);
        alert("No se pudieron cargar los puntos de interés. Verifica la consola para más detalles.");
    });

    // Función para cargar los puntos de interés
function cargarPuntosDeInteres(puntosDeInteres) {
    if (!puntosDeInteres || puntosDeInteres.length === 0) {
        console.error("No hay puntos de interés disponibles.");
        return;
    }

    // Ordenar los puntos por código numéricamente
    puntosDeInteres.sort((a, b) => parseInt(a.codigo) - parseInt(b.codigo));

    // Almacenar los marcadores en un array
    const markers = [];

    // Genera las opciones del desplegable y agrega marcadores al mapa
    puntosDeInteres.forEach(punto => {
        if (!punto.coords || punto.coords.length !== 2) {
            console.error("Coordenadas inválidas para el punto:", punto.nombre);
            return;
        }

        // Crea un marcador para cada punto con el ícono predeterminado
        const marker = L.marker(punto.coords, { icon: defaultIcon })
            .addTo(map)
            .bindPopup(`<b>${punto.nombre}</b><br>Código: ${punto.codigo}`);
        markers.push(marker); // Guarda el marcador en el array

        // Genera las opciones del desplegable (código antes del nombre)
        const option = document.createElement('option');
        option.value = punto.coords.join(','); // Guarda las coordenadas como "lat,lng"
        option.textContent = `${punto.codigo} - ${punto.nombre}`; // Código antes del nombre
        puntosDesplegable.appendChild(option);

        // Evento para seleccionar el marcador al hacer clic en él
        marker.on('click', () => {
            // Restaurar el ícono predeterminado para el marcador previamente seleccionado
            if (selectedMarker) {
                selectedMarker.setIcon(defaultIcon);
            }

            // Cambiar el ícono del marcador seleccionado a rojo
            marker.setIcon(selectedIcon);
            selectedMarker = marker; // Actualizar el marcador seleccionado
            selectedPointCoords = punto.coords; // Guardar las coordenadas del punto seleccionado
        });
    });

    // Ajusta la vista del mapa para mostrar todos los marcadores
    const bounds = markers.map(marker => marker.getLatLng());
    if (bounds.length > 0) {
        map.fitBounds(bounds); // Ajusta el mapa para incluir todos los marcadores
    }
}

// Inicializa el mapa
const map = L.map('map').setView([41.3851, 2.1734], 13); // Coordenadas de Barcelona

// Agrega un mapa base de OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Ajustar el tamaño del mapa al cambiar el tamaño de la ventana
window.addEventListener('resize', () => {
    map.invalidateSize();
});

// Crear un control personalizado para el texto "Desarrollado por Raul Mas"
const creditControl = L.control({ position: 'bottomleft' }); // Posición en la esquina inferior izquierda

creditControl.onAdd = function () {
    const div = L.DomUtil.create('div', 'leaflet-control-credit'); // Clase CSS para el control
    div.style.backgroundColor = 'white'; // Fondo blanco
    div.style.padding = '5px 10px'; // Espaciado interno
    div.style.border = '1px solid #ccc'; // Borde ligero
    div.style.borderRadius = '5px'; // Bordes redondeados
    div.style.fontSize = '18px'; // Tamaño de fuente
    div.style.fontFamily = 'Arial, sans-serif'; // Fuente
    div.style.color = '#333'; // Color del texto
    div.innerHTML = '<b>Desarrollado por Raul Mas</b>'; // Texto a mostrar
    return div;
};

// Añadir el control al mapa
creditControl.addTo(map);

// Referencias a elementos del DOM
const puntosDesplegable = document.getElementById('puntos-desplegable');
const searchBox = document.getElementById('search-box');
const rutaBtn = document.getElementById('ruta-btn');

// Variables globales
let currentPosition = null; // Guarda la posición actual del usuario
let selectedMarker = null; // Guarda el marcador seleccionado actualmente
let selectedPointCoords = null; // Guarda las coordenadas del punto seleccionado (ya sea por desplegable o buscador)

// Ícono predeterminado (azul)
const defaultIcon = L.icon({
    iconUrl: './images/marker-icon.png', // Ruta local al ícono azul
    iconSize: [25, 41], // Tamaño del ícono
    iconAnchor: [12, 41] // Punto de anclaje del ícono
});

// Ícono seleccionado (rojo)
const selectedIcon = L.icon({
    iconUrl: './images/marker-icon-red.png', // Ruta local al ícono rojo
    iconSize: [25, 41], // Tamaño del ícono
    iconAnchor: [12, 41] // Punto de anclaje del ícono
});

// Evento para centrar el mapa cuando se selecciona un punto del desplegable
puntosDesplegable.addEventListener('change', event => {
    const selectedCoords = event.target.value.split(',').map(Number); // Convierte "lat,lng" a [lat, lng]
    if (selectedCoords.length === 2) {
        map.setView(selectedCoords, 15);
        selectedPointCoords = selectedCoords; // Guardar las coordenadas del punto seleccionado

        // Encontrar el marcador correspondiente al punto seleccionado
        map.eachLayer(layer => {
            if (layer instanceof L.Marker && layer.getLatLng().equals(L.latLng(selectedCoords))) {
                // Restaurar el ícono predeterminado para el marcador previamente seleccionado
                if (selectedMarker) {
                    selectedMarker.setIcon(defaultIcon);
                }

                // Cambiar el ícono del marcador seleccionado a rojo
                layer.setIcon(selectedIcon);
                selectedMarker = layer; // Actualizar el marcador seleccionado
            }
        });
    }
});

// Referencia al botón de "Buscar"
const searchBtn = document.getElementById('search-btn');

// Función para cerrar el diálogo de búsqueda (fuera de cualquier bloque)
function closeSearchResult() {
    document.getElementById('search-result').style.display = 'none';
}

// Función reutilizable para buscar un punto de interés
function buscarPuntoDeInteres() {
    const query = searchBox.value.trim().toLowerCase(); // Texto ingresado por el usuario

    // Validar que window.puntosDeInteres esté definido
    if (!window.puntosDeInteres) {
        console.error("La variable puntosDeInteres no está definida.");
        alert("Error: Los datos de los puntos de interés no están disponibles.");
        return;
    }

    // Buscar el punto por nombre o código usando window.puntosDeInteres
    const puntoEncontrado = window.puntosDeInteres.find(punto =>
        punto.nombre.toLowerCase().includes(query) || punto.codigo.toLowerCase() === query
    );

    if (puntoEncontrado) {
        // Centrar el mapa en las coordenadas del punto encontrado
        map.setView(puntoEncontrado.coords, 15);
        selectedPointCoords = puntoEncontrado.coords; // Guardar las coordenadas del punto seleccionado

        // Encontrar el marcador correspondiente al punto seleccionado
        map.eachLayer(layer => {
            if (layer instanceof L.Marker && layer.getLatLng().equals(L.latLng(puntoEncontrado.coords))) {
                // Restaurar el ícono predeterminado para el marcador previamente seleccionado
                if (selectedMarker) {
                    selectedMarker.setIcon(defaultIcon);
                }

                // Cambiar el ícono del marcador seleccionado a rojo
                layer.setIcon(selectedIcon);
                selectedMarker = layer; // Actualizar el marcador seleccionado
            }
        });
        
// Función para mostrar el resultado de la búsqueda
function showSearchResult(message) {
    document.getElementById('result-message').textContent = message;
    document.getElementById('search-result').style.display = 'block';
}

// Función para cerrar el diálogo de búsqueda
function closeSearchResult() {
    document.getElementById('search-result').style.display = 'none';
}

// Mostrar el resultado en el diálogo personalizado
    showSearchResult(`Punto encontrado: ${puntoEncontrado.nombre} (${puntoEncontrado.codigo})`);
    } else {
        alert("No se encontró ningún punto con ese nombre o código.");
    }

    // Limpiar el campo de búsqueda
    searchBox.value = '';
}

// Evento para buscar cuando se presiona "Enter"
searchBox.addEventListener('keypress', event => {
    if (event.key === 'Enter') {
        buscarPuntoDeInteres();
    }
});

// Evento para buscar cuando se hace clic en el botón de "Buscar"
searchBtn.addEventListener('click', () => {
    buscarPuntoDeInteres();
});

// Función para obtener la ubicación actual del usuario
function obtenerUbicacionActual() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject("La geolocalización no está disponible en este navegador.");
        } else {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    resolve([latitude, longitude]);
                },
                error => {
                    reject("Error al obtener la ubicación: " + error.message);
                }
            );
        }
    });
}

// Evento para crear una ruta en Google Maps
rutaBtn.addEventListener('click', async () => {
    try {
        // Obtener la ubicación actual del usuario
        if (!currentPosition) {
            currentPosition = await obtenerUbicacionActual();
        }

        // Verificar que haya un punto seleccionado (ya sea por desplegable o buscador)
        if (!selectedPointCoords) {
            alert("Selecciona un punto de interés (desde el desplegable o el buscador).");
            return;
        }

        // Generar la URL de Google Maps
        const origin = currentPosition.join(','); // Ubicación actual (lat,lng)
        const destination = selectedPointCoords.join(','); // Punto de destino (lat,lng)
        const travelMode = 'driving'; // Modo de transporte (puedes cambiarlo a 'walking', 'bicycling', etc.)

        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=${travelMode}`;

        // Abrir la URL en una nueva pestaña
        window.open(googleMapsUrl, '_blank');
    } catch (error) {
        console.error("Error al crear la ruta:", error);
        alert("No se pudo crear la ruta. Verifica tu conexión a Internet y las coordenadas seleccionadas.");
    }
});

// Espera a que el mapa esté listo antes de cargar los puntos
map.whenReady(() => {
    // Asegúrate de que window.puntosDeInteres esté definido antes de usarlo
    if (window.puntosDeInteres) {
        cargarPuntosDeInteres(window.puntosDeInteres);
    } else {
        console.error("La variable puntosDeInteres no está definida.");
    }
});