import React from 'react';
import ReactDOM from 'react-dom';
import "@fontsource/tangerine";
import App from './App';


function Start()
{
    launch();
}

function launch() {
  // IF NO DATA IS IN LOCAL STORAGE THEN LOAD ALL THE TEST
  // DATA FROM THE JSON FILE AND PUT IT THERE
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  );
}


  launch();
