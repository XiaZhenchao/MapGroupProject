import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';
import jsTPS from './common/jsTPS.js';

// OUR TRANSACTIONS
import MoveSong_Transaction from './transactions/MoveSong_Transaction.js';

// THESE REACT COMPONENTS ARE MODALS
import DeleteListModal from './components/DeleteListModal.js';

import EditSongModal from './components/EditSongModal.js';

// THESE REACT COMPONENTS ARE IN OUR UI
import Banner from './components/Banner.js';
import EditToolbar from './components/EditToolbar.js';
import PlaylistCards from './components/PlaylistCards.js';
import SidebarHeading from './components/SidebarHeading.js';
import SidebarList from './components/SidebarList.js';
import Statusbar from './components/Statusbar.js';
import DeleteSongModal from './components/DeleteSongModal';
import AddSong_Transaction from './transactions/AddSong_Transaction';
import DeleteSong_Transaction from './transactions/DeleteSong_Transaction';
import EditSong_Transaction from './transactions/EditSong_Transaction';

class App extends React.Component {
    constructor(props) {
        super(props);

        // THIS IS OUR TRANSACTION PROCESSING SYSTEM
        this.tps = new jsTPS();

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        // SETUP THE INITIAL STATE
        this.state = {
            listKeyPairMarkedForDeletion : null,
            songMarkedForDeletion : null,
            songIndexMarkedForDeletion: null,
            currentList : null,
            sessionData : loadedSessionData,
            songMarkedForEdition: null,
            songIndexMarkedForEdition: null,
            songOldTitle : null,
            songOldArtist : null,
            songOldYouTubeId: null,
            isRunned: false,
            thisModalState: false,
            thisState: false
        }
    }
    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            songs: []
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            }
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }

    createNewSong = () => {
        let list = this.state.currentList;
        let newTitle = "Untitled";
        let newArtist = "Unknown";
        let newYouTubeId = "dQw4w9WgXcQ";

        let newSong = {
            title: newTitle,
            artist: newArtist,
            youTubeId : newYouTubeId
        };

        list.songs = [...this.state.currentList.songs, newSong];
       

        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList : list,
            sessionData : this.state.sessionData
        }), () => {
            // UPDATING THE LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationUpdateList(this.state.currentList);
        });

    }
    // THIS FUNCTION BEGINS THE PROCESS OF DELETING A LIST.
    deleteList = (key) => {
        // IF IT IS THE CURRENT LIST, CHANGE THAT
        let newCurrentList = null;
        if (this.state.currentList) {
            if (this.state.currentList.key !== key) {
                // THIS JUST MEANS IT'S NOT THE CURRENT LIST BEING
                // DELETED SO WE'LL KEEP THE CURRENT LIST AS IT IS
                newCurrentList = this.state.currentList;
            }
        }

        let keyIndex = this.state.sessionData.keyNamePairs.findIndex((keyNamePair) => {
            return (keyNamePair.key === key);
        });
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        if (keyIndex >= 0)
            newKeyNamePairs.splice(keyIndex, 1);

        // AND FROM OUR APP STATE
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : null,
            currentList: newCurrentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter - 1,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // DELETING THE LIST FROM PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationDeleteList(key);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }

    deleteSong = (index) => {
        // IF IT IS THE CURRENT LIST, CHANGE THAT
        let newList = this.state.currentList;
        if (index >= 0) 
            newList.songs.splice(index, 1);

        // AND FROM OUR APP STATE
        this.setState(prevState => ({
            songMarkedForDeletion : null,
            songIndexMarkedForDeletion: null,
            currentList: newList,
            sessionData : this.state.sessionData
        }), () => {

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateList(this.state.currentList);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
        this.hideDeleteSongModal();
    }

    insertSong = (stack1,stack2) =>{
        let newList = this.state.currentList;
        let arr = [];
        let index = stack2.pop();
        let data = stack1.pop();
        let j = 0;
        for (let i = 0 ; i <= newList.songs.length;i++){
            if (i === index){
                arr[i] = data;
            } else {
            arr[i] = newList.songs[j];
            j++;
            }
        }

        newList.songs = arr;

        this.setState(prevState => ({
            songMarkedForDeletion : null,
            songIndexMarkedForDeletion: null,
            currentList: newList,
            sessionData : this.state.sessionData
        }), () => {

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateList(this.state.currentList);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
       
    }

    editSong = (title,artist,youTubeId,index) => {
        let newList = this.state.currentList;
        /*let newTitle = document.getElementById("tname").value; //new value
        let newArtist = document.getElementById("aname").value; //new value
        let newYouTubeId= document.getElementById("yname").value; //new value*/

         for(let i = 0 ; i < newList.songs.length; i++) {
            if (i === index) {
                newList.songs[i].title = title;
                newList.songs[i].artist = artist;
                newList.songs[i].youTubeId = youTubeId;
            }
         }

         this.setState(prevState => ({
            songMarkedForDeletion : null,
            songIndexMarkedForDeletion: null,
            currentList: newList,
            sessionData : this.state.sessionData
        }), () => {

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateList(this.state.currentList);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
        this.hideEditSongModal();
        
    }


    deleteMarkedList = () => {
        this.deleteList(this.state.listKeyPairMarkedForDeletion.key);
        this.hideDeleteListModal();
    }

    deleteMarkedSong = () => {
        this.addDeleteSongTransaction(this.state.songIndexMarkedForDeletion);
        //this.hideDeleteSongModal();
    }

    editMarkedSong = () => {
        let newTitle = document.getElementById("tname").value; //new value
        let newArtist = document.getElementById("aname").value; //new value
        let newYouTubeId= document.getElementById("yname").value; //new value
        this.addEditSongTransaction(this.state.songOldTitle,this.state.songOldArtist,this.state.songOldYouTubeId,
            newTitle,newArtist,newYouTubeId,this.state.songIndexMarkedForEdition);
        //this.hideEditSongModal();
    }
    // THIS FUNCTION SPECIFICALLY DELETES THE CURRENT LIST
    deleteCurrentList = () => {
        if (this.state.currentList) {
            this.deleteList(this.state.currentList.key);
        }
    }
    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : null,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        let newCurrentList = this.db.queryGetList(key);
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newCurrentList,
            sessionData: this.state.sessionData,
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
            //this.modalState(false);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: null,
            sessionData: this.state.sessionData,
            thisState: true
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
        });
    }
    setStateWithUpdatedList = (list) => {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList : list,
            sessionData : this.state.sessionData
        }), () => {
            // UPDATING THE LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationUpdateList(this.state.currentList);
        });
    }
    getPlaylistSize = () => {
        return this.state.currentList.songs.length;
    }
    // THIS FUNCTION MOVES A SONG IN THE CURRENT LIST FROM
    // start TO end AND ADJUSTS ALL OTHER ITEMS ACCORDINGLY
    moveSong(start, end) {
        let list = this.state.currentList;

        // WE NEED TO UPDATE THE STATE FOR THE APP
        start -= 1;
        end -= 1;
        if (start < end) {
            let temp = list.songs[start];
            for (let i = start; i < end; i++) {
                list.songs[i] = list.songs[i + 1];
            }
            list.songs[end] = temp;
        }
        else if (start > end) {
            let temp = list.songs[start];
            for (let i = start; i > end; i--) {
                list.songs[i] = list.songs[i - 1];
            }
            list.songs[end] = temp;
        }
        this.setStateWithUpdatedList(list);
    }
    // THIS FUNCTION ADDS A MoveSong_Transaction TO THE TRANSACTION STACK
    addMoveSongTransaction = (start, end) => {
        let transaction = new MoveSong_Transaction(this, start, end);
        this.tps.addTransaction(transaction);
    }

    addAddSongTransaction = () => {
        let transaction = new AddSong_Transaction(this, this.state.currentList.songs.length);
        this.tps.addTransaction(transaction);
    }

    addDeleteSongTransaction = (index) => {
        let stack1 = [];
        let stack2 = [];
        let copySong = this.state.currentList.songs[index];
        let transaction = new DeleteSong_Transaction(this, stack1,stack2, index, copySong);
        this.tps.addTransaction(transaction);
    }

    addEditSongTransaction = (preTitle,preArtist,preSongId,newTitle,newArtist,newSongId,index) => {
        let transaction = new EditSong_Transaction(this, preTitle,preArtist,preSongId,newTitle,newArtist,newSongId,index);
        this.tps.addTransaction(transaction);
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING AN UNDO
    undo = () => {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING A REDO
    redo = () => {
        if (this.tps.hasTransactionToRedo()) {
            this.tps.doTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
    }
    markListForDeletion = (keyPair) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : keyPair,
            sessionData: prevState.sessionData
        }), () => {
            // PROMPT THE USER

            this.showDeleteListModal();
        });
    }

    markSongForDeletion = (index,song) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            songMarkedForDeletion: song,
            songIndexMarkedForDeletion: index,
            sessionData: prevState.sessionData
        }), () => {
            // PROMPT THE USER
            this.showDeleteSongModal();
        });
    }

    markSongForEdition = (index,song) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            songMarkedForEdition: song,
            songIndexMarkedForEdition: index,
            songOldTitle : song.title,
            songOldArtist : song.artist,
            songOldYouTubeId: song.youTubeId,
            sessionData: prevState.sessionData
        }), () => {
            // PROMPT THE USER
            this.showEditSongModal();
        });
    }

    modalState = (value) =>{
        this.setState(prevState => ({
            thisModalState : value
        }));
    }

    modalCloseListState = () =>{
        this.setState(prevState => ({
            thisState : false
        }));
    }

    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal =() =>{
        this.modalState(true);
        let modal = document.getElementById("delete-list-modal");
        modal.classList.add("is-visible");
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal =() =>{
        this.modalState(false);
        let modal = document.getElementById("delete-list-modal");
        modal.classList.remove("is-visible");
    }


    showDeleteSongModal =() =>{
        this.modalState(true);
        let modal = document.getElementById("delete-song-modal");
        modal.classList.add("is-visible");
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteSongModal =() =>{
        this.modalState(false);
        let modal = document.getElementById("delete-song-modal");
        modal.classList.remove("is-visible");
    }

    showEditSongModal =() =>{
        this.modalState(true);
        let modal = document.getElementById("edit-song-modal");
        document.getElementById("tname").value = this.state.songOldTitle;
        document.getElementById("aname").value = this.state.songOldArtist;
        document.getElementById("yname").value = this.state.songOldYouTubeId;
        modal.classList.add("is-visible");
    }

    hideEditSongModal =() =>{
        this.modalState(false);
        let modal = document.getElementById("edit-song-modal");
        modal.classList.remove("is-visible");
    }

    handleKeyDown = () => {
        document.addEventListener("keydown",(event) => {
            let canUndo = this.tps.hasTransactionToUndo();
            let canRedo = this.tps.hasTransactionToRedo();
                  if ((event.ctrlKey || event.metaKey) && event.key === "z" && canUndo){
                      this.undo();
                  } else if ((event.ctrlKey || event.metaKey) && event.key === "y" && canRedo){
                      this.redo();
                  }
        }) 
    }  

    render() {
        let canAddList = this.state.currentList === null;
        let canAddSong = this.state.currentList !== null;
        let canUndo = this.tps.hasTransactionToUndo();
        let canRedo = this.tps.hasTransactionToRedo();
        let canClose = this.state.currentList !== null; 
        if (!this.state.isRunned){
            this.handleKeyDown();
            this.state.isRunned = true;
        }

        if (this.state.thisModalState){
            canAddList = false;
            canAddSong = false;
            canUndo = false;
            canRedo = false;
            canClose = false;
        } 

        if (this.state.thisState){
            canAddSong = false;
            canUndo = false;
            canRedo = false;
            canClose = false; 
            this.modalCloseListState();
        }

        if(!canRedo) canRedo = false;


        return (
            <div id="root">
                <Banner />
                <SidebarHeading
                    canAddList = {canAddList} 
                    createNewListCallback={this.createNewList}
                />
                <SidebarList
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    deleteListCallback={this.markListForDeletion}
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                    modalStateCallback={this.modalState}
                />
                <EditToolbar
                    canAddSong={canAddSong}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    canClose={canClose} 
                    createNewSongCallback = {this.addAddSongTransaction}
                    undoCallback={this.undo}
                    redoCallback={this.redo}
                    closeCallback={this.closeCurrentList}
                    //keydown = {this.handleKeyDown}
                />
                <PlaylistCards
                    currentList={this.state.currentList}
                    moveSongCallback={this.addMoveSongTransaction} 
                    deleteSongCallback ={this.markSongForDeletion}
                    editSongCallback = {this.markSongForEdition}/>
                <Statusbar 
                    currentList={this.state.currentList} />
                <DeleteListModal
                    listKeyPair={this.state.listKeyPairMarkedForDeletion}
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                    deleteListCallback={this.deleteMarkedList}
                />
                <DeleteSongModal
                    song={this.state.songMarkedForDeletion}
                    deleteCallback ={this.deleteMarkedSong}
                    hideDeleteSongModalCallback={this.hideDeleteSongModal}
                />
                <EditSongModal
                    editSongCallback = {this.editMarkedSong}
                    hideEditSongModalCallback = {this.hideEditSongModal}
                />
            </div>
        );
    }
}

export default App;
