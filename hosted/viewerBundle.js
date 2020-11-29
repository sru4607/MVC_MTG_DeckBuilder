"use strict";

//JSX for the list of decks
var DeckList = function DeckList(props) {
  if (props.decks.length === 0) {
    return /*#__PURE__*/React.createElement("div", {
      className: "deckList"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "emptyDeckList"
    }, "No Decks Saved"));
  } //Map the decks to seperate nodes


  var deckNode = props.decks.map(function (deck) {
    var remove = function remove() {
      return deleteDeck(deck);
    };

    var edit = function edit() {
      return editDeck(deck.name);
    };

    return /*#__PURE__*/React.createElement("div", {
      key: deck._id,
      className: "deck"
    }, /*#__PURE__*/React.createElement("img", {
      src: "/assets/img/logo.png",
      alt: "MTG Logo",
      className: "logo"
    }), /*#__PURE__*/React.createElement("h3", {
      className: "deckTitle"
    }, " ", deck.name), /*#__PURE__*/React.createElement("button", {
      className: "removeDeck",
      onClick: edit
    }, "Edit"), /*#__PURE__*/React.createElement("button", {
      className: "removeDeck",
      onClick: remove
    }, "Remove"));
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "deckList"
  }, /*#__PURE__*/React.createElement("h1", null, "Decks"), /*#__PURE__*/React.createElement("input", {
    id: "removeCSRF",
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), deckNode);
}; //New Deck Form JSX


var NewDeckForm = function NewDeckForm() {
  return /*#__PURE__*/React.createElement("button", {
    onClick: createDeck
  }, "New Deck");
}; //Open the clicked deck in /editor


var editDeck = function editDeck(deckToEdit) {
  var data = {
    _csrf: $('#removeCSRF').val(),
    deckName: deckToEdit
  };
  sendAjax('POST', '/editDeck', data, redirect);
}; //Deletes a saved deck


var deleteDeck = function deleteDeck(deckToDelete) {
  var url = "/removeDeck";
  url += "/?id=" + deckToDelete._id;
  var toSendProps = {
    _csrf: $("#removeCSRF").val()
  };
  sendAjax('DELETE', url, toSendProps, function () {
    handleSuccess("Deck Deleted");
    loadDecksFromServer();
  });
}; //Opens a new deck in /editor


var createDeck = function createDeck() {
  sendAjax('GET', '/newDeck', null, redirect);
}; //Loads and renders the saved decks for the user


var loadDecksFromServer = function loadDecksFromServer(csrfToken) {
  sendAjax('GET', '/getDecks', null, function (data) {
    ReactDOM.render( /*#__PURE__*/React.createElement(DeckList, {
      decks: data.decks,
      csrf: csrfToken
    }), document.querySelector("#decks"));
  });
}; //All code to be run on initial page setup


var setup = function setup(csrfToken) {
  loadDecksFromServer(csrfToken);
  ReactDOM.render( /*#__PURE__*/React.createElement(NewDeckForm, null), document.querySelector("#newDeckForm"));
}; //When the token has been recieved call setup


var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    setup(result.csrfToken);
  });
}; //Start the page by getting the token


$(document).ready(function () {
  getToken();
});
"use strict";

//Handles Errors in a general display
var handleError = function handleError(message) {
  $("#errorText").text(message);
  $("#errorMessageBox").animate({
    opacity: 100
  }, 100).delay(2500).animate({
    opacity: 0
  }, 1000);
}; //Handle Success in a general display


var handleSuccess = function handleSuccess(message) {
  $("#successText").text(message);
  $("#successMessageBox").animate({
    opacity: 100
  }, 100).delay(2500).animate({
    opacity: 0
  }, 1000);
}; //Redirect function with json response


var redirect = function redirect(response) {
  $(".messageBox").animate({
    opacity: '0'
  }, 350);
  window.location = response.redirect;
}; //Loads the account info from the server and calls the callback function with both the data from the server and props


var loadAccountInfoFromServer = function loadAccountInfoFromServer(callback, props) {
  sendAjax('GET', '/getAccountInfo', null, function (data) {
    callback(data, props);
  });
}; //AJAX method


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
