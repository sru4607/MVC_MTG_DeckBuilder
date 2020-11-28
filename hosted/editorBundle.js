"use strict";

//Working deck array
var workingDeck = []; //Varaible to be refered to when checking if the account has premium - set on page open

var premium = false; //Variable to be set when opening the filter. Used to short circuit filter checking

var filterOpened = false; //Loads all the cards in the deck into a list and renders it

var getCardsFromServer = function getCardsFromServer() {
  var populateWorkindDeck = function populateWorkindDeck(data) {
    workingDeck = JSON.parse(data.deck.cards);
    renderDeck();
  };

  sendAjax('GET', '/loadDeck?deckName=' + $('#saveString').val(), null, populateWorkindDeck);
}; //Removes a card from the working list


var removeCardFromList = function removeCardFromList(index) {
  $("#cardHover").hide();
  workingDeck.splice(index, 1);
  renderDeck();
}; //Adds a card to the working list


var addCardToList = function addCardToList(card) {
  workingDeck.push(card);
  renderDeck();
}; //When hovering over the card show the display and bind it to the mouse move event.


var onCardHover = function onCardHover(e, index) {
  $("#cardHover").show();
  moveBox(e.target);
  ReactDOM.render( /*#__PURE__*/React.createElement(CardInfoHover, {
    card: workingDeck[index]
  }), document.querySelector("#cardHover"));
}; //When leaving the card stop showing the display


var onCardLeave = function onCardLeave(index) {
  $("#cardHover").hide();
}; //Bind the box to the mouse move event and position it correctly


var moveBox = function moveBox(target) {
  $(target).bind('mousemove', function (event) {
    var X = $("#cardHover").outerWidth(true);
    var Y = $("#cardHover").outerHeight(true);
    var mouseX = event.pageX - X - 3;
    var mouseY = event.pageY - Y - 3;

    if (mouseY < 0) {
      mouseY = event.pageY + 3;
    }

    $("#cardHover").css({
      'left': mouseX,
      'top': mouseY
    });
  });
}; //Renders the clicked card into the search field result display


var addCardToSearch = function addCardToSearch(index) {
  var card = {
    result: workingDeck[index]
  };
  RenderNextFace(card, 0);
  ReactDOM.render( /*#__PURE__*/React.createElement(ControlResult, {
    card: card
  }), document.querySelector('#searchResultControl'));
}; //Render the Deck based on the card nodes


var WorkingDeck = function WorkingDeck(props) {
  var cardNodes = props.deck.map(function (card, index) {
    return /*#__PURE__*/React.createElement("div", {
      className: "cardItem"
    }, /*#__PURE__*/React.createElement("button", {
      className: "cardButton",
      onClick: function onClick() {
        return addCardToSearch(index);
      },
      onMouseEnter: function onMouseEnter(e) {
        return onCardHover(e, index);
      },
      onMouseLeave: function onMouseLeave() {
        return onCardLeave();
      }
    }, card.faceInfo[0].face_name), /*#__PURE__*/React.createElement("button", {
      className: "cardRemovalButton",
      onClick: function onClick() {
        return removeCardFromList(index);
      }
    }, "X"));
  });
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, "Current Deck"), /*#__PURE__*/React.createElement("div", null, cardNodes));
}; //Create the JSX for the hovered card and return it


var CardInfoHover = function CardInfoHover(props) {
  var toUse = props.card.faceInfo[0];
  return /*#__PURE__*/React.createElement("div", {
    className: "cardHoverDiv"
  }, /*#__PURE__*/React.createElement("img", {
    src: toUse.face_image,
    className: "cardInfoImage"
  }), /*#__PURE__*/React.createElement("div", {
    className: "cardInfoMainText"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cardInfoTop"
  }, /*#__PURE__*/React.createElement("p", {
    className: "cardInfoName"
  }, toUse.face_name), /*#__PURE__*/React.createElement("p", {
    className: "cardInfoCost"
  }, toUse.face_manaCost)), /*#__PURE__*/React.createElement("div", {
    className: "cardInfoBottom"
  }, /*#__PURE__*/React.createElement("p", {
    className: "cardInfoText"
  }, toUse.face_text))));
}; //Renders the working deck by passing the current deck in


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
  sendAjax('POST', '/saveDeck', data, function (e) {
    handleSuccess(e.message);
  });
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

  var data = {
    searchForm: "q=" + $("#searchString").val(),
    colorString: '',
    typeString: '',
    costString: ''
  };

  if (filterOpened) {
    //Process Colors
    var colors = {
      white: $("#white"),
      blue: $("#blue"),
      black: $("#black"),
      red: $("#red"),
      green: $("#green"),
      colorless: $("#colorless")
    }; //If any colors are checked process it

    if (colors.white.is(":checked") || colors.blue.is(":checked") || colors.black.is(":checked") || colors.red.is(":checked") || colors.green.is(":checked") || colors.colorless.is(":checked")) {
      var string = ''; //If all selected colors must be present

      if ($("#colorSelect").val() == "all") {
        string = "c=";

        if (colors.white.is(":checked")) {
          string += "w";
        }

        if (colors.blue.is(":checked")) {
          string += "u";
        }

        if (colors.black.is(":checked")) {
          string += "b";
        }

        if (colors.red.is(":checked")) {
          string += "r";
        }

        if (colors.green.is(":checked")) {
          string += "g";
        }
      } //If at least one selected colors must be present


      if ($("#colorSelect").val() == "any") {
        string = "c";

        if (colors.white.is(":checked")) {
          string += ">=w";
        }

        if (colors.blue.is(":checked")) {
          if (string != "c") {
            string += "+or+";
          }

          string += ">=u";
        }

        if (colors.black.is(":checked")) {
          if (string != "c") {
            string += "+or+";
          }

          string += ">=b";
        }

        if (colors.red.is(":checked")) {
          if (string != "c") {
            string += "+or+";
          }

          string += ">=r";
        }

        if (colors.green.is(":checked")) {
          if (string != "c") {
            string += "+or+";
          }

          string += ">=g";
        }
      } //If only selected colors must be present


      if ($("#colorSelect").val() == "only") {
        string = "c!=";

        if (!colors.white.is(":checked")) {
          string += "w";
        }

        if (!colors.blue.is(":checked")) {
          string += "u";
        }

        if (!colors.black.is(":checked")) {
          string += "b";
        }

        if (!colors.red.is(":checked")) {
          string += "r";
        }

        if (!colors.green.is(":checked")) {
          string += "g";
        }
      }

      data.colorString = string;
    } //Process Types


    if ($("#typeSelect").val() != "any") {
      data.typeString = "t%3A" + $("#typeSelect").val();
    } //Process Cost


    if ($('#costValue').val() != "") {
      var toSet = "cmc" + $("#costControl").val() + $("#costValue").val();
      data.costString = toSet;
    }
  } //Create the string based on the parameters


  var totalString = data.searchForm;

  if (data.colorString != '') {
    totalString += "+" + data.colorString;
  }

  if (data.typeString != '') {
    totalString += "+" + data.typeString;
  }

  if (data.costString != '') {
    totalString += "+" + data.costString;
  } //Send request


  sendAjax('GET', $("#searchForm").attr('action'), totalString, displayResult);
  return false;
}; //The renderer for the search result face


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
}; //JSX for the controls for the search result


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
  if (premium) {
    ReactDOM.render( /*#__PURE__*/React.createElement(FilterScreen, null), document.querySelector("#filterEditor"));
    return /*#__PURE__*/React.createElement("div", {
      className: "searchDiv"
    }, /*#__PURE__*/React.createElement("form", {
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
    })), /*#__PURE__*/React.createElement("button", {
      id: "filterButton",
      onClick: function onClick() {
        $("#filterEditor").show();
        filterOpened = true;
      }
    }, "Filters"));
  } else {
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
  }
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
}; //JSX for the filter screen


var FilterScreen = function FilterScreen() {
  return /*#__PURE__*/React.createElement("div", {
    id: "filterScreen"
  }, /*#__PURE__*/React.createElement("button", {
    id: "closeFilterScreen",
    onClick: function onClick() {
      return $("#filterEditor").toggle();
    }
  }, "X"), /*#__PURE__*/React.createElement("div", {
    id: "colorFilter"
  }, /*#__PURE__*/React.createElement("p", null, "Colors"), /*#__PURE__*/React.createElement("select", {
    id: "colorSelect"
  }, /*#__PURE__*/React.createElement("option", {
    value: "any"
  }, "Contains One or More"), /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "Contains All"), /*#__PURE__*/React.createElement("option", {
    value: "only"
  }, "Contains Only")), /*#__PURE__*/React.createElement("div", {
    id: "colorCheckBoxes"
  }, /*#__PURE__*/React.createElement("div", {
    className: "color"
  }, /*#__PURE__*/React.createElement("label", {
    "for": "white"
  }, "White"), /*#__PURE__*/React.createElement("input", {
    type: "checkBox",
    id: "white",
    name: "white",
    value: "white"
  })), /*#__PURE__*/React.createElement("div", {
    className: "color"
  }, /*#__PURE__*/React.createElement("label", {
    "for": "blue"
  }, "Blue"), /*#__PURE__*/React.createElement("input", {
    type: "checkBox",
    id: "blue",
    name: "blue",
    value: "blue"
  })), /*#__PURE__*/React.createElement("div", {
    className: "color"
  }, /*#__PURE__*/React.createElement("label", {
    "for": "black"
  }, "Black"), /*#__PURE__*/React.createElement("input", {
    type: "checkBox",
    id: "black",
    name: "black",
    value: "black"
  })), /*#__PURE__*/React.createElement("div", {
    className: "color"
  }, /*#__PURE__*/React.createElement("label", {
    "for": "red"
  }, "Red"), /*#__PURE__*/React.createElement("input", {
    type: "checkBox",
    id: "red",
    name: "red",
    value: "red"
  })), /*#__PURE__*/React.createElement("div", {
    className: "color"
  }, /*#__PURE__*/React.createElement("label", {
    "for": "green"
  }, "Green"), /*#__PURE__*/React.createElement("input", {
    type: "checkBox",
    id: "green",
    name: "green",
    value: "green"
  })), /*#__PURE__*/React.createElement("div", {
    className: "color"
  }, /*#__PURE__*/React.createElement("label", {
    "for": "colorless"
  }, "Colorless"), /*#__PURE__*/React.createElement("input", {
    type: "checkBox",
    id: "colorless",
    name: "colorless",
    value: "colorless"
  })))), /*#__PURE__*/React.createElement("div", {
    id: "typeFilter"
  }, /*#__PURE__*/React.createElement("p", null, "Card Type"), /*#__PURE__*/React.createElement("select", {
    id: "typeSelect"
  }, /*#__PURE__*/React.createElement("option", {
    value: "any"
  }, "Any"), /*#__PURE__*/React.createElement("option", {
    value: "land"
  }, "Land"), /*#__PURE__*/React.createElement("option", {
    value: "creature"
  }, "Creature"), /*#__PURE__*/React.createElement("option", {
    value: "enchantment"
  }, "Enchantment"), /*#__PURE__*/React.createElement("option", {
    value: "artifact"
  }, "Artifact"), /*#__PURE__*/React.createElement("option", {
    value: "instant"
  }, "Instant"), /*#__PURE__*/React.createElement("option", {
    value: "sorcerie"
  }, "Sorcerie"), /*#__PURE__*/React.createElement("option", {
    value: "placeswalker"
  }, "Planeswalker"))), /*#__PURE__*/React.createElement("div", {
    id: "costFilter"
  }, /*#__PURE__*/React.createElement("p", null, "Cost"), /*#__PURE__*/React.createElement("select", {
    id: "costControl"
  }, /*#__PURE__*/React.createElement("option", {
    value: "<="
  }, "Less or Equal"), /*#__PURE__*/React.createElement("option", {
    value: "="
  }, "Equal"), /*#__PURE__*/React.createElement("option", {
    value: ">="
  }, "Greater or Equal")), /*#__PURE__*/React.createElement("input", {
    id: "costValue",
    type: "number",
    min: "0",
    max: "16",
    placeholder: "cost"
  })));
}; //#endregion
//Initial Setup


var setupEditor = function setupEditor(csrf) {
  //Render the search form
  ReactDOM.render( /*#__PURE__*/React.createElement(SearchForm, null), document.querySelector("#search")); //Render the save form

  ReactDOM.render( /*#__PURE__*/React.createElement(SaveForm, {
    csrf: csrf
  }), document.querySelector("#save"));
  var urlParams = new URLSearchParams(window.location.href.split('?', 2)[1]);

  if (urlParams.has('deckName')) {
    $('#saveString').val(urlParams.get('deckName')); //Get and Render the working deck

    getCardsFromServer();
  }

  renderDeck();
}; //When the token has been recieved call setup


var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    //On Token Success Load Account from server and populate the site
    loadAccountInfoFromServer(function (data, props) {
      premium = data.premium;
      setupEditor(props.csrfToken);
      $("#cardHover").hide();
    }, result);
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
