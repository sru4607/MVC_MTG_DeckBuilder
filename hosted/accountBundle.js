"use strict";

//JSX for the list of decks
var AccountInfo = function AccountInfo(props) {
  console.log(props.data.premium);
  return /*#__PURE__*/React.createElement("form", {
    id: "premiumForm",
    onSubmit: togglePremium
  }, /*#__PURE__*/React.createElement("label", null, props.data.username, " is Premium: "), /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    name: "premium",
    checked: props.data.premium,
    readonly: true
  }), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), /*#__PURE__*/React.createElement("input", {
    type: "submit",
    value: "Toggle Premium"
  }));
}; //Changes the accounts premium value


var togglePremium = function togglePremium() {
  sendAjax('POST', '/togglePremium', $('#premiumForm').serialize(), loadAccountInfoFromServer());
}; //Loads and renders the saved decks for the user


var loadAccountInfoFromServer = function loadAccountInfoFromServer(csrf) {
  sendAjax('GET', '/getAccountInfo', null, function (data) {
    ReactDOM.render( /*#__PURE__*/React.createElement(AccountInfo, {
      data: data,
      csrf: csrf
    }), document.querySelector("#accountInfo"));
  });
}; //All code to be run on initial page setup


var setup = function setup(csrf) {
  loadAccountInfoFromServer(csrf);
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
  $(".messageText").text(message);
  $(".messageBox").animate({
    opacity: 100
  }, 100).delay(2500).animate({
    opacity: 0
  }, 1000);
}; //Handle Success (WIP)


var handleSuccess = function handleSuccess(message) {
  $(".messageText").text(message);
  $(".messageBox").animate({
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
