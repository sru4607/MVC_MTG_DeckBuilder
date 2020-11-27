"use strict";

//Processes Login
var handleLogin = function handleLogin(e) {
  e.preventDefault();
  $(".messageBox").animate({
    opacity: 0
  }, 350);

  if ($("#user").val() == '' || $("#pass").val() == '') {
    handleError("Username and Password Required");
    return false;
  }

  console.log($("input[name=_csrf]").val());
  sendAjax('POST', $("#loginForm").attr("action"), $("#loginForm").serialize(), redirect);
  return false;
}; //Processes Signup


var handleSignup = function handleSignup(e) {
  e.preventDefault();
  $(".messageBox").animate({
    opacity: 0
  }, 350);

  if ($("#user").val() == '' || $("#pass").val() == '' || $("#pass2").val() == '') {
    handleError("All fields are required");
    return false;
  }

  if ($("#pass").val() !== $("#pass2").val()) {
    handleError("Passwords do not match");
    return false;
  }

  console.log($("input[name=_csrf]").val());
  sendAjax('POST', $("#signupForm").attr("action"), $("#signupForm").serialize(), redirect);
  return false;
}; //JSX for Login


var LoginWindow = function LoginWindow(props) {
  return /*#__PURE__*/React.createElement("form", {
    id: "loginForm",
    name: "loginForm",
    onSubmit: handleLogin,
    action: "/login",
    method: "POST",
    className: "mainForm"
  }, /*#__PURE__*/React.createElement("input", {
    id: "user",
    type: "text",
    name: "username",
    placeholder: "username"
  }), /*#__PURE__*/React.createElement("input", {
    id: "pass",
    type: "password",
    name: "pass",
    placeholder: "password"
  }), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), /*#__PURE__*/React.createElement("input", {
    className: "formSubmit accountButton",
    type: "submit",
    value: "Sign in"
  }));
}; //JSX for Signup


var SignupWindow = function SignupWindow(props) {
  return /*#__PURE__*/React.createElement("form", {
    id: "signupForm",
    name: "signupForm",
    onSubmit: handleSignup,
    action: "/signup",
    method: "POST",
    className: "mainForm"
  }, /*#__PURE__*/React.createElement("input", {
    id: "user",
    type: "text",
    name: "username",
    placeholder: "username"
  }), /*#__PURE__*/React.createElement("input", {
    id: "pass",
    type: "password",
    name: "pass",
    placeholder: "password"
  }), /*#__PURE__*/React.createElement("input", {
    id: "pass2",
    type: "password",
    name: "pass2",
    placeholder: "retype password"
  }), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), /*#__PURE__*/React.createElement("input", {
    className: "formSubmit accountButton",
    type: "submit",
    value: "Sign Up"
  }));
}; //Renders Login


var createLoginWindow = function createLoginWindow(csrf) {
  ReactDOM.render( /*#__PURE__*/React.createElement(LoginWindow, {
    csrf: csrf
  }), document.querySelector("#content"));
}; //Renders Signup


var createSignupWindow = function createSignupWindow(csrf) {
  ReactDOM.render( /*#__PURE__*/React.createElement(SignupWindow, {
    csrf: csrf
  }), document.querySelector("#content"));
}; //Passes CSRF 


var setup = function setup(csrf) {
  var loginButton = document.querySelector("#loginButton");
  var signupButton = document.querySelector("#signupButton");
  signupButton.addEventListener("click", function (e) {
    e.preventDefault();
    createSignupWindow(csrf);
    return false;
  });
  loginButton.addEventListener("click", function (e) {
    e.preventDefault();
    createLoginWindow(csrf);
    return false;
  });
  createLoginWindow(csrf); //Default view
}; //Gets CSRF


var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    setup(result.csrfToken);
  });
};

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
};

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
