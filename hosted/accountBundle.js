"use strict";

//JSX for the Account Information Page
var AccountInfo = function AccountInfo(props) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, "Account Information"), /*#__PURE__*/React.createElement("p", null, "Premium allows you to have no ads, and allows you to use filters when searching for cards. (This would cost money to unlock, but for the project just click toggle below)"), /*#__PURE__*/React.createElement("form", {
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
  })), /*#__PURE__*/React.createElement("form", {
    id: "passwordChangeForm",
    onSubmit: changePassword
  }, /*#__PURE__*/React.createElement("input", {
    id: "c_pass",
    type: "password",
    name: "c_pass",
    placeholder: "password"
  }), /*#__PURE__*/React.createElement("input", {
    id: "pass",
    type: "password",
    name: "pass",
    placeholder: "new password"
  }), /*#__PURE__*/React.createElement("input", {
    id: "pass2",
    type: "password",
    name: "pass2",
    placeholder: "retype new password"
  }), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), /*#__PURE__*/React.createElement("input", {
    className: "formSubmit accountButton",
    type: "submit",
    value: "Change Password"
  })));
}; //Changes the accounts premium value and then reloads the page


var togglePremium = function togglePremium() {
  sendAjax('POST', '/togglePremium', $('#premiumForm').serialize(), function () {
    location.reload();
  });
}; //Submits a request to change the password


var changePassword = function changePassword(e) {
  e.preventDefault();
  sendAjax('POST', '/changePassword', $('#passwordChangeForm').serialize(), function (e) {
    handleSuccess(e.message);
  });
}; //Loads and renders the saved decks for the user


var renderAccountInfo = function renderAccountInfo(data, props) {
  ReactDOM.render( /*#__PURE__*/React.createElement(AccountInfo, {
    data: data,
    csrf: props.csrf
  }), document.querySelector("#accountInfo"));
}; //All code to be run on initial page setup


var setup = function setup(csrf) {
  var props = {
    csrf: csrf
  };
  loadAccountInfoFromServer(renderAccountInfo, props);
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
