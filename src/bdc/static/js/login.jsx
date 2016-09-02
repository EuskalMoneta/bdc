import {
    checkStatus,
    fetchCustom,
    fetchGetToken,
    getUrlParameter,
    getCSRFToken,
    getAPIBaseURL,
    NavbarTitle,
} from 'Utils'

import classNames from 'classnames'

const {
    Row
} = FRC

const LoginForm = React.createClass({

    mixins: [FRC.ParentContextMixin],

    propTypes: {
        children: React.PropTypes.node
    },

    render() {
        return (
            <Formsy.Form
                className={this.getLayoutClassName()}
                {...this.props}
                ref="loginform"
            >
                {this.props.children}
            </Formsy.Form>
        );
    }
});

class LoginPage extends React.Component {
    constructor(props) {
        super(props)

        // Default state
        this.state = {
            canSubmit: false,
            invalidLogin: false,
            username: '',
            password: ''
        }
    }

    handleChange = (event) => {
        // /!\ I had to use a callback function (validateForm) /!\
        // setState() does not immediately mutate this.state but creates a pending state transition
        // See Notes: https://facebook.github.io/react/docs/component-api.html#setstate
        this.setState({
            [event.target.name]: event.target.value,
            invalidLogin: false
        }, this.validateForm)
    }

    validateForm = () => {
        if (this.state.username && this.state.password)
            this.setState({canSubmit: true})
        else
            this.setState({canSubmit: false})
    }

    submitForm = (data) => {
        // Get api-auth-token + auth in Django

        var promiseError = (err) => {
            // Error during request, or parsing NOK :(
            console.error('api-token-auth/ failed!')
            console.error(err)
            // Highlight login/password fields !
            this.setState({invalidLogin: true})
        }

        var promiseSuccessApiAuth = () => {
            // Auth in Django
            fetch('/login/',
                  {
                    method: 'post',
                    credentials: 'same-origin',
                    body: JSON.stringify({'username': this.state.username,
                                          'password': this.state.password}),
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCSRFToken,
                    }
                })
                .then(checkStatus)
                .then(() => {
                    var next = getUrlParameter('next')
                    if (!next)
                        next = window.config.getLoginRedirectURL

                    console.log('redirect to: ' + next)
                    window.location.assign(next)
                })
                .catch((err) => {
                    // Error during request, or parsing NOK :(
                    console.error('login/ failed!')
                    console.error(err)
                    // Highlight login/password fields !
                    this.setState({invalidLogin: true})
                })
        }
        fetchGetToken(this.state.username, this.state.password, promiseSuccessApiAuth, promiseError)
    }

    render = () => {

        var divClasses = classNames({
            'form-signin': true,
            'has-error': this.state.invalidLogin,
        })

        if (this.state.invalidLogin)
            var messageInvalidLogin = (
                <div className="alert alert-danger">
                    {__("Identifiants incorrects !")}
                </div>
            )
        else
            var messageInvalidLogin = null

        return (
            <div className={divClasses}>
                <h2 className="form-signin-heading">{__("Se connecter")}</h2>
                <LoginForm
                    onValidSubmit={this.submitForm}
                    ref="loginform">
                        <input type="text" className="form-control"
                               name="username" id="username"
                               value={this.state.username}
                               onChange={this.handleChange}
                               placeholder={__('Identifiant Bureau de Change')} required />

                        <input type="password" className="form-control"
                               name="password" id="password"
                               value={this.state.password}
                               onChange={this.handleChange}
                               placeholder={__("Mot de passe")} required />

                        {messageInvalidLogin}

                        <input type="submit" className="btn btn-lg btn-success btn-block"
                               defaultValue={__("Se connecter")} formNoValidate={true}
                               disabled={!this.state.canSubmit} />
                </LoginForm>
            </div>
        )
    }
}


ReactDOM.render(
    <LoginPage />,
    document.getElementById('login')
)

ReactDOM.render(
    <NavbarTitle title={__("Connexion")} />,
    document.getElementById('navbar-title')
)