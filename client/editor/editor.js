let workingDeck = [];
var premium = false;
var filterOpened = false;
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
    var data = {
        searchForm: "q="+$("#searchString").val(),
        colorString: '',
        typeString: '',
        costString: '',
    };
    if(filterOpened){
        //Process Colors
        var colors = {
            white: $("#white"),
            blue: $("#blue"),
            black: $("#black"),
            red: $("#red"),
            green: $("#green"),
            colorless: $("#colorless")
        }

        if(colors.white.is(":checked") || colors.blue.is(":checked") || colors.black.is(":checked") || colors.red.is(":checked") || colors.green.is(":checked") || colors.colorless.is(":checked")){
            let string = '';
            if($("#colorSelect").val() == "all"){
                string = "c=";
                if(colors.white.is(":checked")){
                    string+="w";
                }
                if(colors.blue.is(":checked")){
                    string+="u";
                }
                if(colors.black.is(":checked")){
                    string+="b";
                }
                if(colors.red.is(":checked")){
                    string+="r";
                }
                if(colors.green.is(":checked")){
                    string+="g";
                }
            }

            if($("#colorSelect").val() == "any"){
                string = "c";
                if(colors.white.is(":checked")){
                    string+=">=w";
                }
                if(colors.blue.is(":checked")){
                    if(string!="c"){
                        string+="+or+"
                    }
                    string+=">=u";
                }
                if(colors.black.is(":checked")){
                    if(string!="c"){
                        string+="+or+"
                    }
                    string+=">=b";
                }
                if(colors.red.is(":checked")){
                    if(string!="c"){
                        string+="+or+"
                    }
                    string+=">=r";
                }
                if(colors.green.is(":checked")){
                    if(string!="c"){
                        string+="+or+"
                    }
                    string+=">=g";
                }
            }

            if($("#colorSelect").val() == "only"){
                string = "c!=";
                if(!colors.white.is(":checked")){
                    string+="w";
                }
                if(!colors.blue.is(":checked")){
                    string+="u";
                }
                if(!colors.black.is(":checked")){
                    string+="b";
                }
                if(!colors.red.is(":checked")){
                    string+="r";
                }
                if(!colors.green.is(":checked")){
                    string+="g";
                }
            }

            data.colorString = string;


        }

        //Process Types
        if($("#typeSelect").val() != "any"){
            data.typeString = "t%3A" + $("#typeSelect").val()
        }
        //Process Cost
        if($('#costValue').val() != ""){
            let toSet = "cmc"+$("#costControl").val()+$("#costValue").val();
            data.costString = toSet;
        }
    }

    var totalString = data.searchForm;
    if(data.colorString != ''){
        totalString += "+" + data.colorString;
    }
    if(data.typeString != ''){
        totalString += "+" + data.typeString;
    }
    if(data.costString != ''){
        totalString += "+" + data.costString;
    }


    sendAjax('GET', $("#searchForm").attr('action'), totalString, displayResult);

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
    if(premium){
        ReactDOM.render(
            <FilterScreen></FilterScreen>,document.querySelector("#filterEditor")
        );

        return(
            <div className="searchDiv">
                <form id="searchForm" 
                    onSubmit={searchCard}
                    action="/searchCard"
                    method="GET"
                >
                    <input id="searchString" type="text" name="searchString" placeholder="Search String"/>
                    <input type="submit" value="Search"/>
                </form>
                <button id="filterButton" onClick={()=>{
                    $("#filterEditor").show();
                    filterOpened = true;
                }}>Filters</button>
            </div>
        )
    }
    else{
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
    }
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

const FilterScreen = () => {
    return (
        <div id="filterScreen">
            <button id="closeFilterScreen" onClick={()=>$("#filterEditor").toggle()}>X</button>
            <div id="colorFilter">
                <p>Colors</p>
                <select id="colorSelect">
                    <option value="any">Contains One or More</option>
                    <option value="all">Contains All</option>
                    <option value="only">Contains Only</option>
                </select>
                <div id="colorCheckBoxes">
                    <div className="color">
                        <label for="white">White</label>
                        <input type="checkBox" id="white" name="white" value="white"></input>
                    </div>
                    <div className="color">
                        <label for="blue">Blue</label>
                        <input type="checkBox" id="blue" name="blue" value="blue"></input>
                    </div>
                    <div className="color">
                        <label for="black">Black</label>
                        <input type="checkBox" id="black" name="black" value="black"></input>
                    </div>
                    <div className="color">
                        <label for="red">Red</label>
                        <input type="checkBox" id="red" name="red" value="red"></input>
                    </div>
                    <div className="color">
                        <label for="green">Green</label>
                        <input type="checkBox" id="green" name="green" value="green"></input>
                    </div>
                    <div className="color">
                        <label for="colorless">Colorless</label>
                        <input type="checkBox" id="colorless" name="colorless" value="colorless"></input>
                    </div>
                </div>
            </div>
            <div id="typeFilter">
                <p>Card Type</p>
                <select id="typeSelect">
                    <option value="any">Any</option>
                    <option value="land">Land</option>
                    <option value="creature">Creature</option>
                    <option value="enchantment">Enchantment</option>
                    <option value="artifact">Artifact</option>
                    <option value="instant">Instant</option>
                    <option value="sorcerie">Sorcerie</option>
                    <option value="placeswalker">Planeswalker</option>
                </select>
            </div>
            <div id="costFilter">
                <p>Cost</p>
                <select id="costControl">
                    <option value="<=">Less or Equal</option>
                    <option value="=">Equal</option>
                    <option value=">=">Greater or Equal</option>
                </select>
                <input id="costValue" type="number" min="0" max="16" placeholder="cost"></input>
            </div>
        </div>
    )
}

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
        //On Token Success Load Account from server and populate the site
        loadAccountInfoFromServer((data, props)=>{
            premium = data.premium;
            setupEditor(props.csrfToken);
            $("#cardHover").hide();
        }, result);

    });
};



//Start the page by getting the token
$(document).ready(function(){
    getToken();
});