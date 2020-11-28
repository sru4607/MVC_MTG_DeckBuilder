//JSX for the Account Information Page
const AccountInfo = (props) => {
    return(
        <div>
            <h1>Account Information</h1>
            <p>Premium allows you to have no ads, and allows you to use filters when searching for cards. (This would cost money to unlock, but for the project just click toggle below)</p>
            <form id="premiumForm" onSubmit={togglePremium}>
                <label>{props.data.username} is Premium: </label>
                <input type="checkbox" name="premium" checked={props.data.premium} readonly></input>
                <input type="hidden" name="_csrf" value={props.csrf}/>
                <input type="submit" value="Toggle Premium" />
            </form>
            <form id="passwordChangeForm" onSubmit={changePassword}>
                <input id="c_pass" type="password" name="c_pass" placeholder="password"/>
                <input id="pass" type="password" name="pass" placeholder="new password"/>
                <input id="pass2" type="password" name="pass2" placeholder="retype new password"/>
                <input type="hidden" name="_csrf" value={props.csrf}/>
                <input className="formSubmit accountButton" type="submit" value="Change Password" />
            </form>
        </div>
    );
};

//Changes the accounts premium value and then reloads the page
const togglePremium = () => {
    sendAjax('POST','/togglePremium',$('#premiumForm').serialize(),()=>{location.reload()});
};

//Submits a request to change the password
const changePassword = (e) => {
    e.preventDefault();
    sendAjax('POST','/changePassword',$('#passwordChangeForm').serialize(),(e)=>{
        handleSuccess(e.message);
    });
};

//Loads and renders the saved decks for the user
const renderAccountInfo = (data, props) => {
    ReactDOM.render(
        <AccountInfo data={data} csrf={props.csrf}/>,document.querySelector("#accountInfo")
    );
};



//All code to be run on initial page setup
const setup = (csrf) => {
    var props = {
        csrf: csrf,
    }
    loadAccountInfoFromServer(renderAccountInfo, props);
}

//When the token has been recieved call setup
const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result.csrfToken);
    });
};
//Start the page by getting the token
$(document).ready(function(){
    getToken();
});