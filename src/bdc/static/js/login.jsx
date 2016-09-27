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

import ReactSpinner from 'react-spinjs'

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
            displaySpinner: false,
            username: '',
            password: '',
            spinnerConfig: {
                lines: 13, // The number of lines to draw
                length: 28, // The length of each line
                width: 14, // The line thickness
                radius: 42, // The radius of the inner circle
                scale: 0.5, // Scales overall size of the spinner
                corners: 1, // Corner roundness (0..1)
                color: '#000', // #rgb or #rrggbb or array of colors
                opacity: 0.25, // Opacity of the lines
                rotate: 0, // The rotation offset
                direction: 1, // 1: clockwise, -1: counterclockwise
                speed: 1, // Rounds per second
                trail: 60, // Afterglow percentage
                fps: 20, // Frames per second when using setTimeout() as a fallback for CSS
                zIndex: 2e9, // The z-index (defaults to 2000000000)
                className: 'spinner', // The CSS class to assign to the spinner
                top: '62%', // Top position relative to parent
                left: '50%', // Left position relative to parent
                shadow: false, // Whether to render a shadow
                hwaccel: false, // Whether to use hardware acceleration
                position: 'absolute' // Element positioning
            },
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
        // Trigger <ReactSpinner /> to disable login form
        this.setState({displaySpinner: true, canSubmit: false})

        // Get api-auth-token + auth in Django

        var promiseError = (err) => {
            // Error during request, or parsing NOK :(
            console.error('api-token-auth/ failed!')
            console.error(err)
            // Highlight login/password fields !
            this.setState({invalidLogin: true, displaySpinner: false, canSubmit: false})
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
                .then((response) => {
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
                    this.setState({invalidLogin: true, displaySpinner: false, canSubmit: false})
                })
        }
        fetchGetToken(this.state.username, this.state.password, promiseSuccessApiAuth, promiseError)
    }

    render = () => {

        var parentDivClasses = classNames({
            'has-spinner': this.state.displaySpinner,
        })

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

        if (this.state.displaySpinner)
            var spinner = <ReactSpinner config={this.state.spinnerConfig} />
        else
            var spinner = null

        return (
            <div className={parentDivClasses}>
                {spinner}
                <div className={divClasses}>
                    <h2 className="form-signin-heading">{__("Se connecter")}</h2>
                    <LoginForm
                        onValidSubmit={this.submitForm}
                        ref="loginform">
                            <input type="text" className="form-control"
                                   name="username" id="username"
                                   value={this.state.username}
                                   onChange={this.handleChange}
                                   placeholder={__('Identifiant Bureau de Change')}
                                   disabled={this.state.displaySpinner}
                                   required
                            />

                            <input type="password" className="form-control"
                                   name="password" id="password"
                                   value={this.state.password}
                                   onChange={this.handleChange}
                                   placeholder={__("Mot de passe")}
                                   disabled={this.state.displaySpinner}
                                   required
                            />

                            {messageInvalidLogin}

                            <input type="submit" className="btn btn-lg btn-success btn-block"
                                   defaultValue={__("Se connecter")} formNoValidate={true}
                                   disabled={!this.state.canSubmit} />
                    </LoginForm>
                </div>
            </div>
        )
    }
}


ReactDOM.render(
    <LoginPage />,
    document.getElementById('login')
)

ReactDOM.render(
    <NavbarTitle />,
    document.getElementById('navbar-title')
)