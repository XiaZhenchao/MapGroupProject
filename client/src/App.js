import './App.css';
import { React, useContext } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { AuthContextProvider } from './auth';
//import { GlobalStoreContextProvider } from './store'
import {
    AppBanner,
    HomeWrapper,
    LoginScreen,
    RegisterScreen
} from './components'
/*
    This is our application's top-level component.
    
    @author McKilla Gorilla
*/
/*
  This is the entry-point for our application. Notice that we
  inject our store into all the components in our application.
  
  @author McKilla Gorilla
*/
const App = () => {   

    return (
        <BrowserRouter>
            <AuthContextProvider>
                           
                    <AppBanner />
                    <Switch>
                        <Route path="/" exact component={HomeWrapper} />
                        <Route path="/login/" exact component={LoginScreen} />
                        <Route path="/register/" exact component={RegisterScreen} />
                        
                    </Switch>
                    
               
            </AuthContextProvider>
        </BrowserRouter>
    )
}

export default App