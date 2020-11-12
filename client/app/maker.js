const handleDomo = (e) => {
    e.preventDefault();

    $("#domoMessage").animate({width:'hide'},350);

    if($("#domoName").val() == '' || $("#domoAge").val() == '' || $("#domoFavoriteColor").val() == ''){
        handleError("RAWR! All fields are required");
        return false;
    }

    sendAjax('POST',  $("#domoForm").attr('action'), $("#domoForm").serialize(), function(){
        loadDomosFromServer();
    });

    return false;
};

const DomoForm = (props) => {
    return (
        <form id="domoForm"
                onSubmit = {handleDomo}
                name="domoForm"
                action="/maker"
                method="POST"
                className="domoForm"
        >
            <label htmlFor="name">Name: </label>
            <input id="domoName" type="text" name="name" placeholder="Domo Name"/>
            <label htmlFor="age">Age: </label>
            <input id="domoAge" type="text" name="age" placeholder="Domo Age"/>
            <label htmlFor="favoriteColor">Color: </label>
            <input id="domoFavoriteColor" type="text" name="favoriteColor" placeholder="Domo Favorite Color"/>
            <input type="hidden" name="_csrf" value={props.csrf}/>
            <input className="makeDomoSubmit" type="submit" value="Make Domo"/>
        </form>
    );
};

const DomoList = (props) =>{
    if(props.domos.length === 0){
        return(
            <div className="domoList">
                <h3 className="emptyDomo">No Domos yet</h3>
            </div>
        );
    }
    const domoNodes = props.domos.map(function(domo){
        console.log(props);
        const remove = () => removeDomo(domo, props.csrf);
        return(
            <div key={domo._id} className="domo">
                <img src="/assets/img/domoface.jpeg" alt="domo face" className="domoFace"/>
                <h3 className="domoName"> Name: {domo.name}</h3>
                <h3 className="domoAge"> Age: {domo.age}</h3>
                <h3 className="domoFavoriteColor"> Favorite Color: {domo.favoriteColor}</h3>
                <button className="removeDomo" onClick={remove}>Remove</button>
            </div>
        );
    });

    return(
        <div className="domoList">
            {domoNodes}
        </div>
    );
};

const removeDomo = (domo, props) => {
    let url = "/removeDomo";
    url += "/?id=" + domo._id;
    let toSendProps = {
        _csrf: props,
    }
    sendAjax('DELETE', url, toSendProps,()=>{
        handleError("Domo Deleted");
        loadDomosFromServer();
    });
};

const loadDomosFromServer = () => {
    sendAjax('GET', '/getDomos', null, (data)=>{
        sendAjax('GET', '/getToken', null, (result) => {
            ReactDOM.render(
                <DomoList domos={data.domos} csrf={result.csrfToken} />,document.querySelector("#domos")
            );
        });
    });
};

const setup = function(csrf){
    ReactDOM.render(
        <DomoForm csrf={csrf}/>,document.querySelector("#makeDomo")
    );

    ReactDOM.render(
        <DomoList domos={[]} csrf={csrf} />,document.querySelector("#domos")
    );

    loadDomosFromServer();
};

const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result.csrfToken);
    });
};

$(document).ready(function(){
    getToken();
});