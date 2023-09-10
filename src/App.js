import React from 'react';
import './App.css';
class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedFile: null,
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

            if (fileExtension === 'shp' || fileExtension === 'json' || fileExtension === 'kml') {
                this.setState({ selectedFile });
                const uploadButton = document.getElementById('Select-File-Button');
                uploadButton.disabled = true;
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
        this.handleFileInputChange();
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
                <button
                    id="Select-File-Button"
                    onClick={this.handleSelectFileButton}
                    disabled={!!this.state.selectedFile}
                >
                    Select File
                </button>
                {this.state.selectedFile && (
                    <div>
                        <p>Selected File: {this.state.selectedFile.name}</p>
                        <button onClick={this.handleCancelClick}>Cancel</button>
                    </div>
                )}
                <div id="Container"></div>
            </div>
        );
    }
    
}

export default App;
