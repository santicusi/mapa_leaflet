document.addEventListener('DOMContentLoaded', function() {

     // Define tus límites de zoom personalizados
     var maxZoom = 18; // Define el zoom máximo permitido
     var minZoom = 12; // Define el zoom mínimo permitido
 
     var map = L.map('map').setView([3.431781, -76.542421], 15); // Coordenadas de inicio

     // Capa base CartoDB
     var cartoDBLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
         maxZoom: 19,
         attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a>, tiles by <a href="https://carto.com/attributions">CARTO</a>'
     }).addTo(map);
     
     // Capa base OSM
     var osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
         maxZoom: 19,
         attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
     });
     
     // Definición de la cuadrícula
     L.GridLayer.Grid = L.GridLayer.extend({
        createTile: function (coords) {
            // Crea el elemento tile
            var tile = document.createElement('div');
            tile.style.outline = '1px solid black';
            tile.style.fontSize = '10px';
            tile.style.display = 'flex';
            tile.style.alignItems = 'topright';
            tile.style.justifyContent = 'center';
            tile.style.height = '100%';
    
            // Calcula la latitud y longitud de la esquina noroeste del tile
            var nwPoint = coords.scaleBy({x: 256, y: 256});
            var nwLatLng = map.unproject(nwPoint, coords.z);
    
            // Asigna la latitud y longitud al innerHTML del tile para su visualización
            tile.innerHTML = [nwLatLng.lat.toFixed(5), nwLatLng.lng.toFixed(5)].join(', ');
    
            return tile;
        }
    });
    
    L.gridLayer.grid = function (opts) {
        return new L.GridLayer.Grid(opts);
    };
     
     // Adición de la cuadrícula al mapa
     var gridLayer = L.gridLayer.grid({ tileSize: 256 }).addTo(map);


     // Configura los límites máximos y mínimos de zoom
     map.options.maxZoom = maxZoom;
     map.options.minZoom = minZoom;
 
     // Funciones para la localización y geocodificación aquí...
 
     var baseMaps = {
         "OpenStreetMap": osmLayer,
         "CartoDB Light": cartoDBLayer
     };

    
    // Función para manejar la localización exitosa
    function onLocationFound(e) {
        var radius = e.accuracy / 10;

        L.marker(e.latlng).addTo(map)
            .bindPopup("Te encuentras en un radio de " + radius + " metros de este punto").openPopup();

        L.circle(e.latlng, radius).addTo(map);
    }

    // Función para manejar errores en la localización
    function onLocationError(e) {
        alert(e.message);
    }

    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);

    // Solicitar la localización del usuario
    map.locate({setView: true, maxZoom: 16});
  

    // Definir un ícono personalizado
    var customIcon2 = L.icon({
        iconUrl: 'capa/icono2.svg', // Cambiar por la ruta a tu icono
        iconSize: [38, 95], // Tamaño del icono
        iconAnchor: [22, 94], // Punto del icono que corresponde a la ubicación del marcador
        popupAnchor: [-3, -76] // Punto desde donde se abrirá el popup
    });

    var geocoderInput = L.DomUtil.create('input', 'geocoder-input');
    geocoderInput.type = 'text';
    geocoderInput.placeholder = 'Buscar dirección...';

    var geocoderControl = L.control({position: 'topleft'});
    geocoderControl.onAdd = function(map) {
        var container = L.DomUtil.create('div', 'geocoder-container');
        container.appendChild(geocoderInput);
        return container;
    };
    geocoderControl.addTo(map);

    // Función para buscar la dirección y colocar un marcador
    function geocodeAddress() {
        var address = geocoderInput.value;
        var url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    var result = data[0];
                    var latlng = L.latLng(result.lat, result.lon);

                    L.marker(latlng, {icon: customIcon2}).addTo(map) // Asegúrate de que customIcon está definido
                        .bindPopup(address)
                        .openPopup();

                    map.setView(latlng, 15); // Ajusta el zoom a tu preferencia
                } else {
                    alert("Dirección no encontrada");
                }
            })
            .catch(error => {
                console.error('Error durante la geocodificación:', error);
            });
    }

    // Evento de teclado para iniciar la búsqueda con Enter
    geocoderInput.addEventListener('keypress', function(e) {
        if (e.keyCode == 13) { // Enter key
            geocodeAddress();
        }
    });


    /*

    var initialCenter = [3.434818, -76.546934];
    var panLimit = 5000;  // por ejemplo, 5km

    map.on('moveend', function(e) {
        var currentCenter = map.getCenter();
        var distance = map.distance(currentCenter, initialCenter);

        if (distance > panLimit) {
            map.panTo(initialCenter);  // Re-centra el mapa al punto inicial
        }
    });

    */

    var wmsLayer = L.tileLayer.wms('http://ws-idesc.cali.gov.co:8081/geoserver/ows?', {
        layers: 'obs_rso_puntos_criticos',
        format: 'image/png',
        transparent: true
    }).addTo(map);


    var wmsLayer2 = L.tileLayer.wms('http://ws-idesc.cali.gov.co:8081/geoserver/ows?', {
        layers: 'mc_comunas',
        format: 'image/png',
        transparent: true
    }).addTo(map);

    var wmsLayer3 = L.tileLayer.wms('http://ws-idesc.cali.gov.co:8081/geoserver/ows?', {
        layers: 'pgirs_mtrs_apr_bodegas_reciclaje',
        format: 'image/png',
        transparent: true
    }).addTo(map);

    var wmsLayer4 = L.tileLayer.wms('http://ws-idesc.cali.gov.co:8081/geoserver/ows?', {
        layers: 'obs_rui_muestreo_semana_diurno',
        format: 'image/png',
        transparent: true
    }).addTo(map);

    var customIcon = L.icon({
        iconUrl: 'capa/icono1.svg', 
        iconSize: [32, 32],
        iconAnchor: [16, 32], 
        popupAnchor: [0, -32]
    });
    
    var clickedIcon = L.icon({
        iconUrl: 'capa/icono2.svg',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });

    let markersGroup = L.layerGroup();   // Grupo para los puntos
    let labelsGroup = L.layerGroup();    // Grupo para los nombres de los puntos

    fetch('capa/parques19.geojson')
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al cargar el archivo GeoJSON');
        }
        return response.json();
    })
    .then(data => {
        L.geoJson(data, {

            pointToLayer: function (feature, latlng) {
                var marker = L.marker(latlng, { icon: customIcon });
                marker.on('click', function() {
                    // Cambia el ícono al ícono activo al hacer clic
                    marker.setIcon(clickedIcon);
                });
                marker.addTo(markersGroup);
                return marker;
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup(feature.properties.Nombre);
                
                let label = L.tooltip({
                    permanent: false,
                    direction: 'right',
                    className: 'name-label'
                })
                .setContent(feature.properties.Nombre)
                .setLatLng(layer.getLatLng())
                .addTo(labelsGroup);
            }
        });

        markersGroup.addTo(map);
        labelsGroup.addTo(map);

        let overlayMaps = {
            "Residuos solidos": wmsLayer,
            "Comunas": wmsLayer2,
            "Reciclaje": wmsLayer3,
            "Ruido": wmsLayer4,
            "Sitios": markersGroup,
            "Nombres": labelsGroup,
            "Cuadricula": gridLayer
        };

        L.control.layers(baseMaps, overlayMaps).addTo(map);
    })
    .catch(error => {
        console.error('Error al procesar el archivo GeoJSON: ', error);
    });
    
    // Datos de ejemplo para el mapa de calor
    // Formato: [latitud, longitud, intensidad]
    var heatPoints = [
        [3.431781,-76.542421, 10.8],
        [3.435868,-76.545528, 10.8],
        [3.436670,-76.547070, 10.8],
        [3.430302,-76.538835, 10.8],
        [3.425315,-76.542768, 10.8],
        [3.405736,-76.551979, 10.8],
        [3.402837,-76.552386, 10.8],
        [3.396506,-76.549267, 10.8],
        [3.437568,-76.545843, 10.8],
        [3.440915,-76.551571, 10.8],
        [3.416293,-76.549154, 10.8],
        [3.440078,-76.546355, 10.8]  // Ejemplo de punto con intensidad 0.8
        // ... puedes agregar más puntos aquí
    ];

    // Crear el mapa de calor y agregarlo al mapa
    var heat = L.heatLayer(heatPoints, {
        radius: 50,
        gradient: {
            0.5: 'yellow',  // verde para valores bajos
            0.6: 'orange', // amarillo para valores intermedios
            0.8: 'red'     // rojo para valores altos
        }
    });

    var heatmapShown = false; // Una variable para llevar el registro si el mapa de calor está mostrado o no

    // Función para manejar el evento del botón
    document.getElementById('toggleHeatmap').addEventListener('click', function() {
        if (heatmapShown) {
            heat.removeFrom(map); // Si el mapa de calor está mostrado, lo removemos del mapa
        } else {
            heat.addTo(map); // Si el mapa de calor no está mostrado, lo añadimos al mapa
        }
        heatmapShown = !heatmapShown; // Cambiamos el estado de la variable
    });

    // Funcionalidad para mostrar la ubicación del usuario en tiempo real
    lc.start(); // Iniciar la búsqueda de la ubicación al cargar la página

    
});

