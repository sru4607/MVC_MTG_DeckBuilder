"use strict";

var workingDeck = []; //#region Method Stubs
//Loads all the cards in the deck into a list and renders it

var getCardsFromServer = function getCardsFromServer() {
  var populateWorkindDeck = function populateWorkindDeck(data) {
    workingDeck = JSON.parse(data.deck.cards);
    renderDeck();
  };

  sendAjax('GET', '/loadDeck?deckName=' + $('#saveString').val(), null, populateWorkindDeck);
}; //Removes a card from the working list


var removeCardFromList = function removeCardFromList(index) {
  workingDeck.splice(index, 1);
  renderDeck();
}; //Adds a card to the working list


var addCardToList = function addCardToList(card) {
  workingDeck.push(card);
  renderDeck();
};

var WorkingDeck = function WorkingDeck(props) {
  var cardNodes = props.deck.map(function (card, index) {
    return /*#__PURE__*/React.createElement("button", {
      myCustomAttribute: "testing",
      className: "cardButton",
      onClick: function onClick() {
        return removeCardFromList(index);
      }
    }, card.faceInfo[0].face_name);
  });
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, "Current Deck"), /*#__PURE__*/React.createElement("div", null, cardNodes));
};

var renderDeck = function renderDeck() {
  ReactDOM.render( /*#__PURE__*/React.createElement(WorkingDeck, {
    deck: workingDeck
  }), document.querySelector('#workingDeck'));
}; //Saves the working List to the user


var saveListToServer = function saveListToServer(e) {
  e.preventDefault();

  if ($('#saveString').val() == '') {
    handleError('Save Failed: Title Required');
    return;
  }

  if (workingDeck.length == 0) {
    handleError('Save Failed: At Least 1 Card Required');
    return;
  }

  var data = $('#saveDeck').serializeArray();
  data.push({
    name: 'deck',
    value: JSON.stringify(workingDeck)
  });
  console.log(data);
  sendAjax('POST', '/saveDeck', data, handleSuccess);
}; //Searches for a card


var searchCard = function searchCard(e) {
  e.preventDefault();
  $(".messageBox").animate({
    opacity: 0
  }, 350);

  if ($("#searchString").val() == '') {
    handleError("Search String Required");
    return false;
  }

  var displayResult = function displayResult(data) {
    if (data.result.message == 'No card found') {
      handleError("No Card Found");
      return;
    }

    RenderNextFace(data, 0);
    ReactDOM.render( /*#__PURE__*/React.createElement(ControlResult, {
      card: data
    }), document.querySelector('#searchResultControl'));
  };

  sendAjax('GET', $("#searchForm").attr('action'), $("#searchForm").serialize(), displayResult);
  return false;
}; //The renderer for the search result


var RenderNextFace = function RenderNextFace(card, index) {
  if (index > card.result.faceInfo.length) {
    return;
  }

  var face = card.result.faceInfo[index];

  var FaceJSX = function FaceJSX(face) {
    return /*#__PURE__*/React.createElement("div", {
      className: "face",
      id: "searchFace"
    }, /*#__PURE__*/React.createElement("img", {
      id: "cardImage",
      src: face.card.face_image,
      alt: "faceImage"
    }), /*#__PURE__*/React.createElement("h3", null, face.card.face_name), /*#__PURE__*/React.createElement("h4", null, face.card.face_manaCost), /*#__PURE__*/React.createElement("h4", null, face.card.face_text));
  };

  ReactDOM.render( /*#__PURE__*/React.createElement(FaceJSX, {
    card: face
  }), document.querySelector('#searchResultCard'));
  $("#searchFace").attr('index', index);
};

var ControlResult = function ControlResult(data) {
  var cardToUse = data.card.result;

  var addCard = function addCard() {
    return addCardToList(cardToUse);
  };

  var nextFace = function nextFace() {
    var index = (parseInt($('#searchFace').attr('index')) + 1) % cardToUse.faceInfo.length;
    RenderNextFace(data.card, index);
  };

  if (cardToUse.faceInfo.length > 1) {
    return /*#__PURE__*/React.createElement("div", {
      id: "cardInfo"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: nextFace
    }, "Next Face"), /*#__PURE__*/React.createElement("button", {
      onClick: addCard
    }, "Add To Deck"));
  }

  return /*#__PURE__*/React.createElement("div", {
    id: "cardInfo"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: addCard
  }, "Add To Deck"));
}; //JSX for the search Form


var SearchForm = function SearchForm() {
  return /*#__PURE__*/React.createElement("form", {
    id: "searchForm",
    onSubmit: searchCard,
    action: "/searchCard",
    method: "GET"
  }, /*#__PURE__*/React.createElement("input", {
    id: "searchString",
    type: "text",
    name: "searchString",
    placeholder: "Search String"
  }), /*#__PURE__*/React.createElement("input", {
    type: "submit",
    value: "Search"
  }));
}; //JSX for the Save Form


var SaveForm = function SaveForm(props) {
  return /*#__PURE__*/React.createElement("form", {
    id: "saveDeck",
    onSubmit: saveListToServer
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    id: "saveString",
    name: "saveString",
    placeholder: "Title"
  }), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), /*#__PURE__*/React.createElement("input", {
    type: "submit",
    value: "Save"
  }));
}; //#endregion
//Initial Setup


var setupEditor = function setupEditor(csrf) {
  //Render the search form
  ReactDOM.render( /*#__PURE__*/React.createElement(SearchForm, null), document.querySelector("#search")); //Render the save form

  ReactDOM.render( /*#__PURE__*/React.createElement(SaveForm, {
    csrf: csrf
  }), document.querySelector("#save"));
  var urlParams = new URLSearchParams(window.location.href.split('?', 2)[1]);
  console.log(urlParams);

  if (urlParams.has('deckName')) {
    $('#saveString').val(urlParams.get('deckName'));
  } //Get and Render the working deck


  getCardsFromServer();
}; //When the token has been recieved call setup


var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    setupEditor(result.csrfToken);
  });
}; //Start the page by getting the token


$(document).ready(function () {
  getToken();
});
"use strict";

var handleError = function handleError(message) {
  $(".messageText").text(message);
  $(".messageBox").animate({
    opacity: 100
  }, 100).delay(2500).animate({
    opacity: 0
  }, 1000);
};

var handleSuccess = function handleSuccess(message) {
  $(".messageText").text(message);
  $(".messageBox").animate({
    opacity: 100
  }, 100).delay(2500).animate({
    opacity: 0
  }, 1000);
};

var redirect = function redirect(response) {
  $(".messageBox").animate({
    opacity: '0'
  }, 350);
  window.location = response.redirect;
};

var sendAjax = function sendAjax(type, action, data, success) {
  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: "json",
    success: success,
    error: function error(xhr, status, _error) {
      var messageObj = JSON.parse(xhr.responseText);
      handleError(messageObj.error);
    }
  });
};
