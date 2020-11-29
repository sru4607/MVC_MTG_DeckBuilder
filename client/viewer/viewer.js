//JSX for the list of decks
const DeckList = (props) => {
    if(props.decks.length === 0){
        return(
            <div className="deckList">
                <h3 className="emptyDeckList">No Decks Saved</h3>
            </div>
        );
    }
    //Map the decks to seperate nodes
    const deckNode = props.decks.map(function(deck){
        const remove = () => deleteDeck(deck);
        const edit = () => editDeck(deck.name);
        return(
            <div key={deck._id} className="deck">
                <img src="/assets/img/logo.png" alt="MTG Logo" className="logo"/>
                <h3 className="deckTitle"> {deck.name}</h3>
                <button className="removeDeck" onClick={edit}>Edit</button>
                <button className="removeDeck" onClick={remove}>Remove</button>
            </div>
        );
    });

    return(
        <div className="deckList">
            <h1>Decks</h1>
            <input id="removeCSRF" type="hidden" name="_csrf" value={props.csrf}/>
            {deckNode}
        </div>
    );
};

//New Deck Form JSX
const NewDeckForm = () => {
    return(
        <button onClick={createDeck}>New Deck</button>
    );
};

//Open the clicked deck in /editor
const editDeck = (deckToEdit) => {
    let data = {
        _csrf: $('#removeCSRF').val(),
        deckName: deckToEdit,
    };
    sendAjax('POST', '/editDeck', data, redirect)
};

//Deletes a saved deck
const deleteDeck = (deckToDelete) => {
    let url = "/removeDeck";
    url += "/?id=" + deckToDelete._id;
    let toSendProps = {
        _csrf: $("#removeCSRF").val(),
    }
    sendAjax('DELETE', url, toSendProps,()=>{
        handleSuccess("Deck Deleted");
        loadDecksFromServer();
    });
};

//Opens a new deck in /editor
const createDeck = () => {
    sendAjax('GET', '/newDeck', null, redirect)
};

//Loads and renders the saved decks for the user
const loadDecksFromServer = (csrfToken) => {
    sendAjax('GET', '/getDecks', null, (data)=>{
        ReactDOM.render(
            <DeckList decks={data.decks} csrf={csrfToken}/>,document.querySelector("#decks")
        );
    });
};

//All code to be run on initial page setup
const setup = (csrfToken) => {
    loadDecksFromServer(csrfToken);

    ReactDOM.render(
        <NewDeckForm/>,document.querySelector("#newDeckForm")
    );
}

//When the token has been recieved call setup
const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result.csrfToken);
    });
};
//Start the page by getting the token
$(document).ready(function(){
    getToken();
});