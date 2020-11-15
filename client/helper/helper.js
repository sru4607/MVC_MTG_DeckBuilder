//Handles Errors in a general display
const handleError = (message) => {
    $(".messageText").text(message);
    $(".messageBox").animate({opacity: 100}, 100).delay(2500).animate({opacity: 0}, 1000);
};

//Handle Success (WIP)
const handleSuccess = (message) => {
    $(".messageText").text(message);
    $(".messageBox").animate({opacity: 100}, 100).delay(2500).animate({opacity: 0}, 1000);
};

//Redirect function with json response
const redirect = (response) => {
    $(".messageBox").animate({opacity:'0'},350);
    window.location = response.redirect;
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
