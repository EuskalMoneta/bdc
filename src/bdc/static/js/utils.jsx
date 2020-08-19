var checkStatus = (response) => {
    if (response.status >= 200 && response.status <= 401) {
        return response
    }
    else {
        try {
            // If we got a forbidden (403) response,
            // *AND* we're not already in the login page
            // *AND* the call we've made was for the Euskal Moneta API and *NOT* the Django front
            // we redirect to the login page, in this page a "session expired" message will be displayed
            if (response.statusText == "Forbidden"
                && window.location.pathname.indexOf("/login") === -1
                && response.url.indexOf(window.config.getAPIBaseURL) != -1) {
                window.location.assign("/logout?next=" + window.location.pathname)
            }
            else {
                var error = new Error(response.statusText)
                error.response = response
                throw error
            }
        }
        catch(e) {
            var error = new Error(response.statusText)
            error.response = response
            throw error
        }
    }
}

var parseJSON = (response) => {
    if (response.status == 204) {
        return {}
    }
    else if (response.status == 400 || response.status == 401) {
        var error = new Error(response.statusText)
        error.response = response
        throw error
    }
    else {
        return response.json()
    }
}

var checkSession = (data) => {
    try {
        if (data.detail.indexOf("LOGGED_OUT") != -1) {
            window.location.assign("/logout?next=" + window.location.pathname)
        }
        else if (data.detail.indexOf("Exception") != -1) {
            var error = new Error(data)
            error.response = data
            throw error
        }
        else {
            return data
        }
    }
    catch(e) {
        return data
    }
}

var storeToken = (data) => {
    // Save data to sessionStorage
    sessionStorage.setItem('bdc-api-token-auth', data.token)
    return data.token
}

var getToken = () => {
    // Get saved data from sessionStorage
    return sessionStorage.getItem('bdc-api-token-auth')
}

var fetchCustom = (url, method, promise, token, data, promiseError=null) => {
    var payload = {
        method: method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + token
        }
    }

    if (method.toLowerCase() != 'get' && data != null) {
        payload.body = JSON.stringify(data)
    }

    if (!promiseError) {
        var promiseError = (err) => {
            // Error during request, or parsing NOK :(
            if (err.message != "No content") {
                console.error(url, method, promise, token, data, promiseError, err)
            }
        }
    }

    fetch(url, payload)
    .then(checkStatus)
    .then(parseJSON)
    .then(checkSession)
    .then(promise)
    .catch(promiseError)
}

var fetchGetToken = (username, password, promiseSuccess, promiseError) => {
    sessionStorage.removeItem('bdc-api-token-auth')

    fetch(getAPIBaseURL + 'api-token-auth/',
    {
        method: 'post',
        body: JSON.stringify({'username': username, 'password': password}),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(checkStatus)
    .then(parseJSON)
    .then(storeToken)
    .then(promiseSuccess)
    .catch(promiseError)
}

var fetchAuth = (url, method, promise, data=null, promiseError=null) => {
    var token = getToken()
    if (token) {
        // We have a token
        fetchCustom(url, method, promise, token, data, promiseError)
    }
    else {
        // We need a token
        if (location.pathname != window.config.getLoginURL) {
            // Redirect to login page is needed
            console.error("We need a token, we redirect to login")
            console.error(window.config.getLoginURL)
            window.location.assign(window.config.getLoginURL)
        }
    }
}

var getUrlParameter = (name) => {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

var isMemberIdEusko = (values, value) => {
    return value && value.match(/^[EZ]\d\d\d\d\d$/)
}

var isPositiveInteger = (values, value) => {
    return value.match(/^\d+$/)
}

var titleCase = (str) => {
    if ((str===null) || (str===''))
        return false;
    else
        str = str.toString();

    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

var getCurrentLang = document.documentElement.lang
var getCSRFToken = window.config.getCSRFToken
var getAPIBaseURL = window.config.getAPIBaseURL

var Flag = React.createClass({
    render() {
        // We want to hide the flag showing the current lang
        if (this.props.lang != getCurrentLang) {
            return (
                    <li>
                        <a className={"lang-select " + this.props.lang}
                           href={"/i18n/setlang_custom/?lang=" + this.props.lang}>
                            <img className={"lang-select-flag-" + this.props.lang}
                                 alt={this.props.langname}
                                 src={"/static/img/" + this.props.lang + ".gif"}
                                 />
                        </a>
                    </li>
            )
        }
        else { return null }
    }
})

class Flags extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <ul className="nav navbar-nav pull-right">
                <Flag lang="eu" langname="Euskara"/>
                <Flag lang="fr" langname="Français"/>
            </ul>
        )
    }
}

class NavbarTitle extends React.Component {
    render() {
        if (this.props.title) {
            return <a className="navbar-brand">{this.props.title}</a>
        }
        else {
            return <a className="navbar-brand">Euskal Moneta</a>
        }
    }
}

class NavbarItems extends React.Component {
    render() {
        if (window.config.userAuth) {
            var navbarData = _.map(this.props.objects, (item) => {
                return (
                    <li key={item.id}>
                        <a href={item.href}>{item.label}</a>
                    </li>
                )
            })
        }
        else
            var navbarData = null
        return (
            <ul className="nav navbar-nav" id="navbar-items">
                {navbarData}
            </ul>
        )
    }
}

var NavbarRight = React.createClass({
    getInitialState() {
        return {
            bdcName: '',
            userAuth: window.config.userAuth,
            showDropdown: false,
        }
    },

    componentDidMount() {
        // Get bdc name
        if (window.config.userAuth) {
            var computeData = (data) => {
                this.setState({bdcName: data})
            }
            fetchAuth(getAPIBaseURL + "bdc-name/", 'get', computeData)
        }
    },

    toggleDropdown() {
        this.setState({showDropdown: !this.state.showDropdown})
    },

    hideDropdown() {
        this.setState({showDropdown: false})
    },

    render() {
        if (this.state.userAuth)
        {
            if (this.state.showDropdown) {
                var dropdownClassName = "dropdown-menu show-dropdown-menu"
            }
            else {
                var dropdownClassName = "dropdown-menu"
            }

            return (
                <ul className="nav navbar-nav pull-right" onBlur={() => this.toggleDropdown()}>
                    <li className="dropdown">
                        <a className="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false"
                           onClick={() => this.toggleDropdown()}>
                            {window.config.userName + " - " + this.state.bdcName + " "}<span className="caret"></span>
                        </a>
                        <ul className={dropdownClassName} role="menu">
                            <li><a href="/change-password">{__("Changer mon mot de passe")}</a></li>
                            <li className="divider"></li>
                            <li><a href={window.config.getLogoutURL}>{__("Me déconnecter")}</a></li>
                        </ul>
                    </li>
                </ul>
            )
        }
        else
            return null
    }
})

class SelectizeUtils {
    // generic callback for all selectize objects
    static selectizeCreateFromSearch(options, search) {
        // Pretty much self explanatory:
        // this function is called when we start typing inside the select
        if (search)
        {
            if (search.length == 0 || (options.map(function(option)
            {
                return option.label;
            })).indexOf(search) > -1)
                return null;
            else
                return {label: search, value: search};
        }
        else
            return null;
    }

    static selectizeRenderOption (item) {
        // This is how the list itself is displayed
        return    <div className="simple-option" style={{display: "flex", alignItems: "center"}}>
                    <div className="memberaddform" style={{marginLeft: 10}}>
                        {item.label}
                    </div>
                </div>
    }

    static selectizeNewRenderOption (item) {
        // This is how the list itself is displayed
        return    <div className="simple-option" style={{display: "flex", alignItems: "center"}}>
                    <div className="memberaddform" style={{marginLeft: 10}}>
                        {!!item.newOption ? __("Ajouter") + " " + item.label + " ..." : item.label}
                    </div>
                </div>
    }

    static selectizeRenderValue (item) {
        // When we select a value, this is how we display it
        return    <div className="simple-value">
                    <span className="memberaddform" style={{marginLeft: 10, verticalAlign: "middle"}}>{item.label}</span>
                </div>
    }

    static selectizeNoResultsFound () {
        return    <div className="no-results-found" style={{fontSize: 15}}>
                    {__("Pas de résultat")}
                </div>
    }
}


module.exports = {
    checkStatus: checkStatus,
    parseJSON: parseJSON,
    checkSession: checkSession,
    fetchAuth: fetchAuth,
    fetchCustom: fetchCustom,
    fetchGetToken: fetchGetToken,
    getUrlParameter: getUrlParameter,
    isMemberIdEusko: isMemberIdEusko,
    isPositiveInteger: isPositiveInteger,
    titleCase: titleCase,
    getCurrentLang: getCurrentLang,
    getCSRFToken: getCSRFToken,
    getAPIBaseURL: getAPIBaseURL,
    NavbarTitle: NavbarTitle,
    NavbarItems: NavbarItems,
    NavbarRight: NavbarRight,
    Flags: Flags,
    Flag: Flag,
    SelectizeUtils: SelectizeUtils
}
