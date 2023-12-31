import React, { createContext, useEffect, useState } from "react";
import { useHistory } from 'react-router-dom';
import api from './auth-request-api';
import Alert from '@mui/material/Alert'

const AuthContext = createContext();
console.log("create AuthContext: " + AuthContext);

// THESE ARE ALL THE TYPES OF UPDATES TO OUR AUTH STATE THAT CAN BE PROCESSED
export const AuthActionType = {
    GET_LOGGED_IN: "GET_LOGGED_IN",
    LOGIN_USER: "LOGIN_USER",
    LOGOUT_USER: "LOGOUT_USER",
    REGISTER_USER: "REGISTER_USER",
    LOGIN_USER_ERROR: "LOGIN_USER_ERROR",
    REGISTER_USER_ERROR: "REGISTER_USER_ERROR"
}

const CurrentModal = {
    NONE : "NONE",
    LOGIN_USER_ERROR: "LOGIN_USER_ERROR",
    REGISTER_USER_ERROR: "REGISTER_USER_ERROR"
}

function AuthContextProvider(props) {
    const [auth, setAuth] = useState({
        currentModal : CurrentModal.NONE,
        user: null,
        loggedIn: false,
        message: null
    });
    const history = useHistory();

    useEffect(() => {
        auth.getLoggedIn();
    }, []);

    const authReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            case AuthActionType.GET_LOGGED_IN: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn
                });
            }
            case AuthActionType.LOGIN_USER: {
                return setAuth({
                    user: payload.user,
                    loggedIn: true
                })
            }
            case AuthActionType.LOGOUT_USER: {
                return setAuth({
                    user: null,
                    loggedIn: false
                })
            }
            case AuthActionType.REGISTER_USER: {
                return setAuth({
                    user: payload.user,
                    loggedIn: true
                })
            }
            case AuthActionType.LOGIN_USER_ERROR: {
                return setAuth({
                    currentModal : CurrentModal.LOGIN_USER_ERROR,
                    user: null,
                    loggedIn: false,
                    message: payload.errorMessage
                })
            }

            case AuthActionType.REGISTER_USER_ERROR: {
                return setAuth({
                    currentModal : CurrentModal.REGISTER_USER_ERROR,
                    user: null,
                    loggedIn: false,
                    message: payload.errorMessage
                })
            }

            case AuthActionType.HIDE_MODALS: {
                return setAuth({
                    currentModal : CurrentModal.NONE,
                    user: null,
                    loggedIn: false
                });
            }

            default:
                return auth;
        }
    }

    auth.getLoggedIn = async function () {
        const response = await api.getLoggedIn();
        if (response.status === 200) {
            authReducer({
                type: AuthActionType.SET_LOGGED_IN,
                payload: {
                    loggedIn: response.data.loggedIn,
                    user: response.data.user
                }
            });
        }
    }

    auth.registerUser = async function(firstName, lastName, email, password, passwordVerify) {
        try {
            const response = await api.registerUser(firstName, lastName, email, password, passwordVerify);      
        if (response.status === 200) {
            authReducer({
                type: AuthActionType.REGISTER_USER,
                payload: {
                    user: response.data.user
                }
            })
            history.push("/");
        } 
        } catch (error) {
            const message = error.response.data.errorMessage;
            console.log (message);
            authReducer({
                type: AuthActionType.REGISTER_USER_ERROR,
                payload: {
                    errorMessage: message
                }
            })
        }
    }

    auth.loginUser = async function(email, password) {
        try {
           const response = await api.loginUser(email, password);
           if (response.status === 200) {
               authReducer({
                   type: AuthActionType.LOGIN_USER,
                   payload: {
                       user: response.data.user
                   }
               })
               history.push("/");
           } 
        } catch (error) {
            const message = error.response.data.errorMessage;
            console.log (message);
            authReducer({
                type: AuthActionType.LOGIN_USER_ERROR,
                payload: {
                    errorMessage: message
                }
            })
        }
    }

    auth.logoutUser = async function() {
        const response = await api.logoutUser();
        if (response.status === 200) {
            authReducer( {
                type: AuthActionType.LOGOUT_USER,
                payload: null
            })
            history.push("/");
        }
    }

    auth.getUserInitials = function() {
        let initials = "";
        if (auth.user) {
            initials += auth.user.firstName.charAt(0);
            initials += auth.user.lastName.charAt(0);
        }
        console.log("user initials: " + initials);
        return initials;
    }

    auth.isLoginModalOpen = () => {
        return auth.currentModal === CurrentModal.LOGIN_USER_ERROR;
    }

    auth.isRegisterModalOpen = () => {
        return auth.currentModal === CurrentModal.REGISTER_USER_ERROR;
    }

    auth.hideModals = () => {
        authReducer({
            type: AuthActionType.HIDE_MODALS,
            payload: {}
        });    
    }


    return (
        <AuthContext.Provider value={{
            auth
        }}>
            {props.children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
export { AuthContextProvider };