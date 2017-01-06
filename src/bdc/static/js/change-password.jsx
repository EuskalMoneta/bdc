import {
    fetchAuth,
    getAPIBaseURL,
    NavbarTitle,
} from 'Utils'

const {
    Input,
    Row
} = FRC

import classNames from 'classnames'

const {
    ToastContainer
} = ReactToastr
const ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation)

const MemberChangePasswordForm = React.createClass({

    mixins: [FRC.ParentContextMixin],

    propTypes: {
        children: React.PropTypes.node
    },

    render() {
        return (
            <Formsy.Form
                className={this.getLayoutClassName()}
                {...this.props}
                ref="changepassword"
            >
                {this.props.children}
            </Formsy.Form>
        );
    }
});

class MemberChangePasswordPage extends React.Component {

    constructor(props) {
        super(props);

        // Default state
        this.state = {
            canSubmit: false,
        }
    }

    enableButton = () => {
        this.setState({canSubmit: true})
    }

    disableButton = () => {
        this.setState({canSubmit: false})
    }

    submitForm = (data) => {
        this.disableButton()

        var computeForm = (data) => {
            this.refs.container.success(
                __("L'enregistrement s'est déroulé correctement."),
                "",
                {
                    timeOut: 5000,
                    extendedTimeOut: 10000,
                    closeButton:true
                }
            )

            setTimeout(() => window.location.assign("/logout"), 3000)
        }

        var promiseError = (err) => {
            // Error during request, or parsing NOK :(
            console.error(this.props.url, err)
            this.refs.container.error(
                __("Une erreur s'est produite lors de l'enregistrement !"),
                "",
                {
                    timeOut: 5000,
                    extendedTimeOut: 10000,
                    closeButton:true
                }
            )
        }
        fetchAuth(this.props.url, this.props.method, computeForm, data, promiseError)
    }

    render = () =>
    {
        return (
            <div className="row">
                <MemberChangePasswordForm
                    onValidSubmit={this.submitForm}
                    onInvalid={this.disableButton}
                    onValid={this.enableButton}
                    ref="changepassword">
                    <fieldset>
                         <Input
                            name="old_password"
                            data-eusko="changepassword-old_password"
                            value=""
                            label={__("Mot de passe actuel")}
                            type="password"
                            placeholder={__("Votre mot de passe")}
                            validations="isExisty"
                            validationErrors={{
                                isExisty: __("Mot de passe invalide."),
                            }}
                            elementWrapperClassName={[{'col-sm-9': false}, 'col-sm-5']}
                            required
                        />
                         <Input
                            name="new_password"
                            data-eusko="changepassword-new_password"
                            value=""
                            label={__("Nouveau mot de passe")}
                            type="password"
                            placeholder={__("Votre nouveau mot de passe")}
                            validations="equalsField:confirm_password,minLength:4,maxLength:12"
                            validationErrors={{
                                equalsField: __("Les mots de passe ne correspondent pas."),
                                minLength: __("Un mot de passe doit faire entre 4 et 12 caractères."),
                                maxLength: __("Un mot de passe doit faire entre 4 et 12 caractères.")
                            }}
                            elementWrapperClassName={[{'col-sm-9': false}, 'col-sm-5']}
                            required
                        />
                        <Input
                            name="confirm_password"
                            data-eusko="changepassword-confirm_password"
                            value=""
                            label={__("Confirmer le nouveau mot de passe")}
                            type="password"
                            placeholder={__("Confirmation de votre nouveau mot de passe")}
                            validations="equalsField:new_password,minLength:4,maxLength:12"
                            validationErrors={{
                                equalsField: __("Les mots de passe ne correspondent pas."),
                                minLength: __("Un mot de passe doit faire entre 4 et 12 caractères."),
                                maxLength: __("Un mot de passe doit faire entre 4 et 12 caractères.")
                            }}
                            elementWrapperClassName={[{'col-sm-9': false}, 'col-sm-5']}
                            required
                        />
                    </fieldset>
                    <fieldset>
                        <Row layout="horizontal">
                            <input
                                name="submit"
                                data-eusko="changepassword-submit"
                                type="submit"
                                defaultValue={__("Enregistrer le mot de passe")}
                                className="btn btn-success"
                                formNoValidate={true}
                                disabled={!this.state.canSubmit}
                            />
                        </Row>
                    </fieldset>
                </MemberChangePasswordForm>
                <ToastContainer ref="container"
                                toastMessageFactory={ToastMessageFactory}
                                className="toast-top-right toast-top-right-navbar" />
            </div>
        );
    }
}


ReactDOM.render(
    <MemberChangePasswordPage url={getAPIBaseURL + "change-password/"} method="POST" />,
    document.getElementById('change-password')
)

ReactDOM.render(
    <NavbarTitle title={__("Changer mon mot de passe")} />,
    document.getElementById('navbar-title')
)