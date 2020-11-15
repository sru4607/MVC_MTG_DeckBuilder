//JSX for the list of decks
const AccountInfo = (props) => {
    console.log(props.data.premium);
    return(
        <form id="premiumForm" onSubmit={togglePremium}>
            <label>{props.data.username} is Premium: </label>
            <input type="checkbox" name="premium" checked={props.data.premium} readonly></input>
            <input type="hidden" name="_csrf" value={props.csrf}/>
            <input type="submit" value="Toggle Premium" />
        </form>
    );
};

//Changes the accounts premium value
const togglePremium = () => {
    sendAjax('POST','/togglePremium',$('#premiumForm').serialize(),loadAccountInfoFromServer());
};

//Loads and renders the saved decks for the user
const loadAccountInfoFromServer = (csrf) => {
    sendAjax('GET', '/getAccountInfo', null, (data)=>{
        ReactDOM.render(
            <AccountInfo data={data} csrf={csrf}/>,document.querySelector("#accountInfo")
        );
    });
};

//All code to be run on initial page setup
const setup = (csrf) => {
    loadAccountInfoFromServer(csrf);
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