//Handles Errors in a general display
const handleError = (message) => {
    $("#errorText").text(message);
    $("#errorMessageBox").animate({opacity: 100}, 100).delay(2500).animate({opacity: 0}, 1000);
};

//Handle Success in a general display
const handleSuccess = (message) => {
    $("#successText").text(message);
    $("#successMessageBox").animate({opacity: 100}, 100).delay(2500).animate({opacity: 0}, 1000);
};

//Redirect function with json response
const redirect = (response) => {
    $(".messageBox").animate({opacity:'0'},350);
    window.location = response.redirect;
};

//Loads the account info from the server and calls the callback function with both the data from the server and props
const loadAccountInfoFromServer = (callback, props) => {
    sendAjax('GET', '/getAccountInfo', null, (data)=>{
        callback(data, props);
    });
};

//AJAX method
const sendAjax = (type, action, data, success) => {
    $.ajax({
        cache: false,
        type: type,
        url: action,
        data: data,
        dataType: "json",
        success: success,
        error: function(xhr, status, error){
            var messageObj = JSON.parse(xhr.responseText);
            handleError(messageObj.error);
        }
    });
};
