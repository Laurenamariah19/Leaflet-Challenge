// URL for the USGS GeoJSON feed 
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Function to determine marker size based on magnitude
function markerSize(magnitude) {
    return magnitude * 5; 
}

// Function to determine marker color based on depth
function getColor(depth) {
    return depth > 90 ? '#FF0000' : // Red for deep earthquakes
           depth > 70 ? '#FF7F00' : // Orange
           depth > 50 ? '#FFFF00' : // Yellow
           depth > 30 ? '#7FFF00' : // Light Green
           depth > 10 ? '#00FF00' : // Green
                        '#00FFFF';  // Cyan for shallow earthquakes
}

// Fetch the earthquake data
fetch(url)
    .then(response => response.json())
    .then(data => {
        // Create a GeoJSON layer containing the features array
        const earthquakes = L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, {
                    radius: markerSize(feature.properties.mag),
                    fillColor: getColor(feature.geometry.coordinates[2]),
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                });
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup(`Location: ${feature.properties.place}<br>
                                Magnitude: ${feature.properties.mag}<br>
                                Depth: ${feature.geometry.coordinates[2]} km`);
            }
        });

        // Create the map
        createMap(earthquakes);
    })
    .catch(error => console.error('Error fetching data:', error));

function createMap(earthquakes) {
    // Create the base layers
    const street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    });

    const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)'
    });

    // Create a baseMaps object
    const baseMaps = {
        "Street Map": street,
        "Topographic Map": topo
    };

    // Create an overlay object
    const overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create the map
    const myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [street, earthquakes]
    });

    // Create a layer control
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Create a legend
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend');
        const depths = [0, 10, 30, 50, 70, 90];
        const colors = ['#00FFFF', '#00FF00', '#7FFF00', '#FFFF00', '#FF7F00', '#FF0000'];

        // Add a title
        div.innerHTML = '<strong>Earthquake Depth (km)</strong><br>';

        // Loop through depth intervals and generate a label with a colored square
        for (let i = 0; i < depths.length; i++) {
            div.innerHTML +=
                `<i style="background:${colors[i]}; width: 20px; height: 20px; display: inline-block; margin-right: 5px;"></i>` +
                `${depths[i]}${depths[i + 1] ? '&ndash;' + depths[i + 1] : '+'} km<br>`;
        }

        return div;
    };

    legend.addTo(myMap);
}
