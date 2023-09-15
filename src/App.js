import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import 'leaflet-omnivore'; // Import Leaflet Omnivore
import L from 'leaflet'; // Import Leaflet
import React from 'react';
import './App.css';
import toGeoJSON from 'togeojson';
import { DOMParser } from 'xmldom'; 
import { open } from 'shapefile'; 

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedFile: null,
            map: null,
            rendering: false,
            fileExtension: null,
        };
    }

    handleSelectFileButton = () => {
        const fileInput = document.getElementById('fileInput');
        fileInput.accept = '.zip,.shp,.json,.kml';
        fileInput.click();
    };

    handleFileInputChange = () => {
        const fileInput = document.getElementById('fileInput');
        const selectedFile = fileInput.files[0];
        if (selectedFile) {
            const fileName = selectedFile.name;
            const fileExtension = fileName.split('.').pop().toLowerCase();

            if (fileExtension === 'shp' || fileExtension === 'json' || fileExtension === 'kml'){
                this.setState({ selectedFile });
                const uploadButton = document.getElementById('Select-File-Button');
                uploadButton.disabled = true;
                this.loadMap(selectedFile);
                this.setState({ fileExtension: fileExtension })
            } else if (fileExtension === 'zip') {
                this.setState({ selectedFile });
                const uploadButton = document.getElementById('Select-File-Button');
                uploadButton.disabled = true;
                this.loadMap(selectedFile);
                this.setState({ fileExtension: fileExtension })
            }
            else {
                alert('Please select a valid SHP, GeoJSON, or KML file.');
            }
        } else {
            this.setState({ selectedFile: null });
            const uploadButton = document.getElementById('Select-File-Button');
            uploadButton.disabled = false;
        }
    };
    handleRenderButtonClick = () => {
        this.setState({ rendering: true });
        if(this.state.fileExtension==="json"){
            this.renderGeoJSON();
            this.setState({ rendering: true })
        }
        if(this.state.fileExtension==="kml"){
            this.renderKMLFile();
            this.setState({ rendering: true })
        }
        if(this.state.fileExtension==="shp"){
            this.renderShpFile();
            this.setState({ rendering: true })
        }
    };

    handleCancelClick = () => {
        const fileInput = document.getElementById('fileInput');
        fileInput.value = '';
        const container = document.getElementById('Container');
        container.innerHTML = '';
        
        if(this.state.map){
            this.state.map.remove(); // Remove the old map
        }       
        this.setState({ selectedFile: null, map: null, rendering:false });
        this.handleFileInputChange();
    };

    loadMap = () => {
        try {
            // Create a Leaflet map
            const map = L.map('Container').setView([0, 0], 5); // Set initial view
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; < a href=" ">OpenStreetMap</ a> contributors',
            }).addTo(map);
            // Store the new map instance in the component state
            this.setState({ map: map });
        } catch (error) {
            console.error('Error handle loading SHP file:', error);
        }
    };


    renderShpFile = () => {
        const reader = new FileReader();
        if (this.state.map) {
          const map = this.state.map;
          reader.onload = async (e) => {
            try {
              const shpData = await open(e.target.result); // Parse the Shapefile
      
              // Initialize an empty array to collect GeoJSON features
              const features = [];
      
              // Iterate through each feature and add it to the 'features' array
              while (true) {
                const { done, value } = await shpData.read();
                if (done) break;
                features.push(value);
              }
      
              // Create a GeoJSON feature collection
              const geojsonData = {
                type: 'FeatureCollection',
                features: features,
              };
      
              // Create a GeoJSON layer and add it to the map
              const geojsonLayer = L.geoJSON(geojsonData).addTo(map);
      
              // Fit the map bounds to the GeoJSON layer
              map.fitBounds(geojsonLayer.getBounds());
            } catch (error) {
              console.error('Error rendering Shapefile:', error);
            }
          };
      
          // Read the selected file as an ArrayBuffer
          reader.readAsArrayBuffer(this.state.selectedFile);
        }
      };


      renderGeoJSON = () => {
        const reader = new FileReader();
        if (this.state.map) {
            const map = this.state.map;
            reader.onload = (e) => {
                try {
                    const geojsonData = JSON.parse(e.target.result); 
                    const geojsonLayer = L.geoJSON(geojsonData, {
                   onEachFeature : onEachFeature
                }).addTo(map);

                function onEachFeature(feature, layer) {
                    if (feature.properties && feature.properties.name_en) {
                        layer.bindPopup(feature.properties.name_en);
                    }
                }
    
                    map.fitBounds(geojsonLayer.getBounds());
                }
                catch (error) {
                    console.error('Error rendering GeoJSON:', error);
                }
            }

        reader.readAsText(this.state.selectedFile);
        };
    }


    renderKMLFile = () => {
        const reader = new FileReader(); // FileReader class for reading file
        if (this.state.map) {// if map variable from state exists(load map function excute successfully)
            const map = this.state.map; //assgin map variable from state
            reader.onload = (e) => { // event handler for FileReader
            const kmlContent = e.target.result; 
            const geojson = toGeoJSON.kml(new DOMParser().parseFromString(kmlContent, 'text/xml')); //Parse the data from KML file into GeoJSON type
            const geojsonLayer = L.geoJSON(geojson, {
                onEachFeature : onEachFeature
             }).addTo(map);
             function onEachFeature(feature, layer) {
                 if (feature.properties && feature.properties.name_en) {
                     layer.bindPopup(feature.properties.name_en);
                 }
             }
                 map.fitBounds(geojsonLayer.getBounds());
             }
        reader.readAsText(this.state.selectedFile); //intiate the selected file
        }
    }

    render() {
        return (
            <div id="root">
                <div id="TitleBox">
                    <h1>Map</h1>
                </div>
                <input
                    type="file"
                    id="fileInput"
                    style={{ display: 'none' }}
                    accept=".shp, .json, .kml"
                    onChange={this.handleFileInputChange}
                />
                {(
                <div>
                <button
                    id="Select-File-Button"
                    onClick={this.handleSelectFileButton}
                    disabled={this.state.selectedFile}
                >
                    Select File
                </button>
                <button
                    id="Render-File-Button"
                    onClick={this.handleRenderButtonClick}
                    disabled={!this.state.selectedFile || this.state.rendering}
                >
                    Render
                </button>
                </div>
                )}
                
                {this.state.selectedFile && (
                    <div>
                        <p>Selected File: {this.state.selectedFile.name}</p >
                        <button onClick={this.handleCancelClick}>Cancel</button>
                    </div>
                )}
                <div id="Container" ></div>
            </div>
        );
    }
}

export default App;