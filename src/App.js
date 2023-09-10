import React from 'react';
import './App.css';

class App extends React.Component {
    constructor(props) {
        super(props);
    }
    
    render() {
        return (
            <div id="root">
                <div id = "TitleBox">  
                <h1>
                    Map
                </h1> </div>
                <button id="Select-File-Button">
                    Select File
                </button>
                <div id = "Container">
                </div>
            </div>
        );
    }
}

export default App;
