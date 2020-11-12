const handleError = (message) => {
    $("#messageText").text(message);
    $("#messageBox").animate({opacity: 100}, 100).delay(2500).animate({opacity: 0}, 1000);
};

const redirect = (response) => {
    $("#messageBox").animate({opacity:'0'},350);
    window.location = response.redirect;
};

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
