let workingDeck = [];

//#region Method Stubs

//Loads all the cards in the deck into a list and renders it
const getCardsFromServer = () => {
    const populateWorkindDeck = (data) => {
        workingDeck = JSON.parse(data.deck.cards);
        renderDeck();
    };
    sendAjax('GET','/loadDeck?deckName='+$('#saveString').val(), null, populateWorkindDeck);
};



//Removes a card from the working list
const removeCardFromList = (index) => {
    $("#cardHover").hide();
    workingDeck.splice(index,1);
    renderDeck();
};

//Adds a card to the working list
const addCardToList = (card) => {
    workingDeck.push(card);
    renderDeck();
};

var onCardHover = (e, index) => {
    console.log(workingDeck[index]);
    $("#cardHover").show();
    moveBox(e.target);

    ReactDOM.render(
        <CardInfoHover card={workingDeck[index]}></CardInfoHover>,document.querySelector("#cardHover")
    );
};

var onCardLeave = (index) => {
    $("#cardHover").hide();
};

var moveBox = (target) => {

    $(target).bind('mousemove', function(event){
        var X = $("#cardHover").outerWidth(true);
        var Y = $("#cardHover").outerHeight(true);
        var mouseX = event.pageX-X-3;
        var mouseY = event.pageY-Y-3;
        
        if(mouseY < 0){
            mouseY = event.pageY+3;
        }

        $("#cardHover").css({
            'left':mouseX,
            'top':mouseY
        });
    });
};

var addCardToSearch = (index) => {
    var card = {
        result: workingDeck[index]
    }
    RenderNextFace(card, 0);
    ReactDOM.render(
        <ControlResult card={card}/>,document.querySelector('#searchResultControl')
    );
}

//Render the Deck based on the card nodes
const WorkingDeck = (props) => {
    const cardNodes = props.deck.map((card, index)=>
        <div className="cardItem">
            <button className="cardButton" onClick={()=>addCardToSearch(index)} onMouseEnter={(e)=>onCardHover(e, index)} onMouseLeave={()=>onCardLeave()}>{card.faceInfo[0].face_name}</button>
            <button className="cardRemovalButton" onClick={()=>removeCardFromList(index)}>X</button>
        </div>
    );
    return(
        <div>
            <h1>Current Deck</h1>
            <div>
                {cardNodes}
            </div>
        </div>
    );
}

const CardInfoHover = (props) => {
    var toUse = props.card.faceInfo[0];
    return (
        <div className="cardHoverDiv">
            <img src={toUse.face_image} className="cardInfoImage"></img>
            <div className="cardInfoMainText">
                <div className="cardInfoTop">
                    <p className="cardInfoName">{toUse.face_name}</p>
                    <p className="cardInfoCost">{toUse.face_manaCost}</p>
                </div>
                <div className="cardInfoBottom">
                    <p className="cardInfoText">{toUse.face_text}</p>
                </div>
            </div>
        </div>
        
    );
}

//Renders the working deck by passing the current deck in
const renderDeck = () => {
    ReactDOM.render(
        <WorkingDeck deck={workingDeck}/>,document.querySelector('#workingDeck')
    )
}

//Saves the working List to the user
const saveListToServer = (e) => {
    e.preventDefault();
    if($('#saveString').val() == ''){
        handleError('Save Failed: Title Required');
        return;
    }
    if(workingDeck.length == 0){
        handleError('Save Failed: At Least 1 Card Required');
        return;
    }
    let data = $('#saveDeck').serializeArray();
    data.push({name: 'deck', value: JSON.stringify(workingDeck)});
    console.log(data);
    sendAjax('POST', '/saveDeck', data, handleSuccess);
};

//Searches for a card
const searchCard = (e) => {
    e.preventDefault();

    $(".messageBox").animate({opacity:0},350);

    if($("#searchString").val() == ''){
        handleError("Search String Required");
        return false;
    }

    const displayResult = (data) => {
        if(data.result.message == 'No card found'){
            handleError("No Card Found");
            return;
        }
        RenderNextFace(data, 0);
        ReactDOM.render(
            <ControlResult card={data}/>,document.querySelector('#searchResultControl')
        );
    }

    sendAjax('GET', $("#searchForm").attr('action'), $("#searchForm").serialize(), displayResult);

    return false;
};


//The renderer for the search result face
const RenderNextFace = (card, index) => {
    if(index > card.result.faceInfo.length){
        return;
    }
    let face = card.result.faceInfo[index];
    const FaceJSX = (face) =>{
        return(
            <div className="face" id="searchFace">
                <img id="cardImage" src={face.card.face_image} alt="faceImage"></img>
                <h3>{face.card.face_name}</h3>
                <h4>{face.card.face_manaCost}</h4>
                <h4>{face.card.face_text}</h4>
            </div>
        );
    };
    ReactDOM.render(
        <FaceJSX card={face}/>,document.querySelector('#searchResultCard')
    );
    $("#searchFace").attr('index', index);
};

//JSX for the controls for the search result
const ControlResult = (data) => {
    let cardToUse = data.card.result;
    const addCard = () => addCardToList(cardToUse);
    const nextFace = () => {
        let index = ((parseInt($('#searchFace').attr('index'))+1) % cardToUse.faceInfo.length);
        RenderNextFace(data.card, index);
    };
    if(cardToUse.faceInfo.length > 1){
        return(
            <div id="cardInfo">
                <button onClick={nextFace}>Next Face</button>
                <button onClick={addCard}>Add To Deck</button>
            </div>
        );
    }
    return(
        <div id="cardInfo">
            <button onClick={addCard}>Add To Deck</button>
        </div>
    );
}

//JSX for the search Form
const SearchForm = () => {
    return(
        <form id="searchForm" 
                onSubmit={searchCard}
                action="/searchCard"
                method="GET"
            >
            <input id="searchString" type="text" name="searchString" placeholder="Search String"/>
            <input type="submit" value="Search"/>
        </form>
    );
};

//JSX for the Save Form
const SaveForm = (props) => {
    return(
        <form id="saveDeck" onSubmit={saveListToServer}>
            <input type="text" id="saveString" name="saveString" placeholder="Title"/>
            <input type="hidden" name="_csrf" value={props.csrf}/>
            <input type="submit" value="Save" />
        </form>
    );
};

//#endregion
//Initial Setup
const setupEditor = function(csrf){
    //Render the search form
    ReactDOM.render(
        <SearchForm/>, document.querySelector("#search")
    );
    //Render the save form
    ReactDOM.render(
        <SaveForm csrf={csrf}/>, document.querySelector("#save")
    );
    const urlParams = new URLSearchParams(window.location.href.split('?',2)[1]);
    console.log(urlParams);
    if(urlParams.has('deckName')){
        $('#saveString').val(urlParams.get('deckName'));
        //Get and Render the working deck
        getCardsFromServer();
    }
    renderDeck();
};
//When the token has been recieved call setup
const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        setupEditor(result.csrfToken);
        //$("#cardHover").hide();

    });
};
//Start the page by getting the token
$(document).ready(function(){
    getToken();
});