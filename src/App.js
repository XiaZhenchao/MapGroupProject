import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import 'leaflet-omnivore'; // Import Leaflet Omnivore
import L from 'leaflet'; // Import Leaflet
import React from 'react';
import './App.css';
class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedFile: null,
            map: null,
            rendering: false,
        };
    }

    handleSelectFileButton = () => {
        const fileInput = document.getElementById('fileInput');
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
            } else {
                alert('Please select a valid SHP, GeoJSON, or KML file.');
            }
        } else {
            this.setState({ selectedFile: null });
            const uploadButton = document.getElementById('Select-File-Button');
            uploadButton.disabled = false;
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
        this.setState({ selectedFile: null, map: null });
        this.handleFileInputChange();
    };

    loadMap = (shpFile) => {
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
                    disabled={!!this.state.selectedFile}
                >
                    Select File
                </button>
                <button
                    id="Render-File-Button"
                    onClick={this.handleRenderButtonClick}
                    disabled={!this.state.selectedFile}
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