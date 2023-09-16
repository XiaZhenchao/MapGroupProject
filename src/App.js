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
        //setup the initial state
        this.state = {
            selectedFile: null,
            map: null,
            rendering: false,
            fileExtension: null,
        };
    }

    handleSelectFileButton = () => {
        const fileInput = document.getElementById('fileInput');
        fileInput.accept = '.zip,.shp,.json,.kml,.dbf';
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
            }).addTo(map);//load and display tile layers on the map
            this.setState({ map: map });
        } catch (error) {
            console.error('Error to load the map:', error);
        }
    };


    renderShpFile = () => {
        const reader = new FileReader();// FileReader class for reading file
        if (this.state.map) {// if map variable from state exists(load map function excute successfully)
          const map = this.state.map;//assgin map variable from state
          reader.onload = async (e) => {// event handler for FileReader
            try {
              const shpData = await open(e.target.result);//Parse the data from shp file 
      
              const features = [];//create an empty array to store features
      
              while (true) { //while loop
                const { done, value } = await shpData.read();//try to read the next value of the data
                if (done) break;//if the data is finished to read, jump out to the loop
                features.push(value);//put the data into the feature array
              }
      
              const geojsonData = {
                type: 'FeatureCollection',
                features: features,
              };
      
              const geojsonLayer = L.geoJSON(geojsonData).addTo(map);//adds the geojason layer to the leaft map.
      
              map.fitBounds(geojsonLayer.getBounds());//make the layer and map fit to each other
            } catch (error) {
              console.error('Error rendering Shapefile:', error);
            }
          };
      
          reader.readAsArrayBuffer(this.state.selectedFile);//used to read the contents of the specified file
        }
      };


      renderGeoJSON = () => {
        const reader = new FileReader();// FileReader class for reading file
        if (this.state.map) {// if map variable from state exists(load map function excute successfully)
            const map = this.state.map;//assgin map variable from state
            reader.onload = (e) => {// event handler for FileReader
                try {
                    const geojsonData = JSON.parse(e.target.result); //Parse the data of GeoJSON file
                    const geojsonLayer = L.geoJSON(geojsonData, { //create geojason layer
                        onEachFeature : onEachFeature //calls oneachFeature function
                    }).addTo(map); //adds the geojason layer to the leaft map.

                function onEachFeature(feature, layer) { //onEachFeature function
                    let featureArray = []; //create an empty array to store all the features
                     if (feature.properties) {
                        for (let i in feature.properties) { //for loop to loop the feature
                            featureArray.push(i + ": " + feature.properties[i]);//put the feature into the arrayls
                        }

                        layer.bindTooltip(featureArray.join("<br />"));
                    }
                }
    
                    map.fitBounds(geojsonLayer.getBounds());//make the layer and map fit to each other
                }
                catch (error) {
                    console.error('Error rendering GeoJSON:', error);
                }
            }

        reader.readAsText(this.state.selectedFile);//used to read the contents of the specified file
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
                let featureArray = [];
                 if (feature.properties) {
                    for (let i in feature.properties) {
                        featureArray.push(i + ": " + feature.properties[i]);
                    }

                    layer.bindTooltip(featureArray.join("<br />"));
                 }
             }
                 map.fitBounds(geojsonLayer.getBounds());//make the layer and map fit to each other
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
                    onChange={this.handleFileInputChange}
                />
                
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