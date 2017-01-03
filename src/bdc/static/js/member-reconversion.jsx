import {
    fetchAuth,
    getAPIBaseURL,
    NavbarTitle,
    isPositiveNumeric,
    SelectizeUtils
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

Formsy.addValidationRule('isPositiveNumeric', isPositiveNumeric)

const MemberReconversionForm = React.createClass({

    mixins: [FRC.ParentContextMixin],

    propTypes: {
        children: React.PropTypes.node
    },

    render() {
        return (
            <Formsy.Form
                className={this.getLayoutClassName()}
                {...this.props}
                ref="memberreconversion"
            >
                {this.props.children}
            </Formsy.Form>
        );
    }
});

class MemberReconversionPage extends React.Component {

    constructor(props) {
        super(props);

        // Default state
        this.state = {
            canSubmit: false,
            memberID: document.getElementById("member_id").value,
            member: undefined,
            commisionAmount: undefined,
            prestataireAmount: undefined,
        }

        // Get member data
        var computeMemberData = (member) => {
            this.setState({member: member})
        }
        fetchAuth(getAPIBaseURL + "members/" + this.state.memberID + "/", 'get', computeMemberData)
    }

    enableButton = () => {
        this.setState({canSubmit: true})
    }

    disableButton = () => {
        this.setState({canSubmit: false})
    }

    onChangeAmount = (field, value) => {
        // Frais de commission (5%)
        // Euros versés au prestataire (95%)
        this.setState({commisionAmount: String(Number(Number(value) * 0.05).toFixed(2)).replace(".", ","),
                       prestataireAmount: String(Number(Number(value) * 0.95).toFixed(2)).replace(".", ",")})
    }

    submitForm = (data) => {
        this.disableButton()

        data.member_login = this.state.member.login

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

            setTimeout(() => window.location.assign("/members/" + document.getElementById("member_id").value), 3000)
        }

        var promiseError = (err) => {
            // Error during request, or parsing NOK :(
            this.enableButton()

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

    render = () => {
        if (this.state.member) {
            if (this.state.member.company)
                var memberName = this.state.member.company
            else
                var memberName = this.state.member.firstname + " " + this.state.member.lastname

            var memberLogin = this.state.member.login
        }
        else {
            var memberLogin = null
            var memberName = null
        }

        if (this.state.commisionAmount)
            var commisionAmount = this.state.commisionAmount + " €"
        else
            var commisionAmount = "– €"

        if (this.state.prestataireAmount)
            var prestataireAmount = this.state.prestataireAmount + " €"
        else
            var prestataireAmount = "– €"

        return (
            <div className="row">
                <MemberReconversionForm
                    onValidSubmit={this.submitForm}
                    onInvalid={this.disableButton}
                    onValid={this.enableButton}
                    ref="memberreconversion">
                    <fieldset>
                        <div className="form-group row member-login-row">
                            <label
                                className="control-label col-sm-3"
                                htmlFor="memberretrait-eusko-numerique-fullname">
                                {__("N° Adhérent")}
                            </label>
                            <div className="col-sm-6 memberretrait-eusko-numerique control-label text-align-left"
                                 data-eusko="memberretrait-eusko-numerique-fullname">
                                {memberLogin}
                            </div>
                            <div className="col-sm-3"></div>
                        </div>
                        <div className="form-group row">
                            <label
                                className="control-label col-sm-3"
                                htmlFor="memberreconversion-fullname">
                                {__("Nom")}
                            </label>
                            <div className="col-sm-6 memberreconversion control-label text-align-left"
                                 data-eusko="memberreconversion-fullname">
                                {memberName}
                            </div>
                            <div className="col-sm-3"></div>
                        </div>
                        <Input
                            name="amount"
                            data-eusko="reconversion-amount"
                            value=""
                            label={__("Montant")}
                            type="number"
                            placeholder={__("Montant de la reconversion")}
                            validations="isPositiveNumeric"
                            onChange={this.onChangeAmount}
                            validationErrors={{
                                isPositiveNumeric: __("Montant invalide.")
                            }}
                            elementWrapperClassName={[{'col-sm-9': false}, 'col-sm-5']}
                            required
                        />
                        <Input
                            name="facture"
                            data-eusko="reconversion-facture"
                            value=""
                            label={__("N° facture")}
                            type="text"
                            placeholder={__("N° facture")}
                            validations="isExisty"
                            validationErrors={{
                                isExisty: __("N° de facture invalide.")
                            }}
                            elementWrapperClassName={[{'col-sm-9': false}, 'col-sm-5']}
                            required
                        />
                        <div className="form-group row">
                            <label
                                className="control-label col-sm-3"
                                htmlFor="memberreconversion-frais">
                                {__("Frais de commission (5%)")}
                            </label>
                            <div className="col-sm-6 memberreconversion control-label text-align-left"
                                 data-eusko="memberreconversion-frais">
                                {commisionAmount}
                            </div>
                            <div className="col-sm-3"></div>
                        </div>
                        <div className="form-group row">
                            <label
                                className="control-label col-sm-3"
                                htmlFor="memberreconversion-prestataire">
                                {__("Euros versés au prestataire (95%)")}
                            </label>
                            <div className="col-sm-6 memberreconversion control-label text-align-left"
                                 data-eusko="memberreconversion-prestataire">
                                {prestataireAmount}
                            </div>
                            <div className="col-sm-3"></div>
                        </div>
                    </fieldset>
                    <fieldset>
                        <Row layout="horizontal">
                            <input
                                name="submit"
                                data-eusko="memberreconversion-submit"
                                type="submit"
                                defaultValue={__("Enregistrer la reconversion")}
                                className="btn btn-success"
                                formNoValidate={true}
                                disabled={!this.state.canSubmit}
                            />
                        </Row>
                    </fieldset>
                </MemberReconversionForm>
                <ToastContainer ref="container"
                                toastMessageFactory={ToastMessageFactory}
                                className="toast-top-right toast-top-right-navbar" />
            </div>
        )
    }
}


ReactDOM.render(
    <MemberReconversionPage url={getAPIBaseURL + "reconversion/"} method="POST" />,
    document.getElementById('reconversion')
)

ReactDOM.render(
    <NavbarTitle title={__("Reconversion")} />,
    document.getElementById('navbar-title')
)