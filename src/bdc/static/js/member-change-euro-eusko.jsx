import {
    fetchAuth,
    getAPIBaseURL,
    isPositiveNumeric,
    NavbarTitle,
    SelectizeUtils
} from 'Utils'

const {
    Input,
    Select,
    Row
} = FRC

import ReactSelectize from 'react-selectize'
const SimpleSelect = ReactSelectize.SimpleSelect

import classNames from 'classnames'

const {
    ToastContainer
} = ReactToastr
const ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation)

Formsy.addValidationRule('isPositiveNumeric', isPositiveNumeric)

const MemberChangeEuroEuskoForm = React.createClass({

    mixins: [FRC.ParentContextMixin],

    propTypes: {
        children: React.PropTypes.node
    },

    render() {
        return (
            <Formsy.Form
                className={this.getLayoutClassName()}
                {...this.props}
                ref="memberchangeeuroeusko"
            >
                {this.props.children}
            </Formsy.Form>
        );
    }
});

class MemberChangeEuroEuskoPage extends React.Component {

    constructor(props) {
        super(props);

        // Default state
        this.state = {
            canSubmit: false,
            validFields: false,
            validCustomFields: false,
            memberID: document.getElementById("member_id").value,
            member: undefined,
            paymentMode: '',
            paymentModeList: ''
        }

        // Get member data
        var computeMemberData = (member) => {
            this.setState({member: member})
        }
        fetchAuth(getAPIBaseURL + "members/" + this.state.memberID + "/", 'get', computeMemberData)

        // Get payment_modes
        var computePaymentModes = (paymentModes) => {
            // 'Euro-LIQ'
            // 'Euro-CHQ'
            // 'Eusko-LIQ' <- Nous sommes dans un change, donc pas d'eusko en moyen de paiement...
            this.setState({paymentModeList:
                           _.filter(paymentModes, (item) => {
                                        return item.value.toLowerCase().indexOf("eusko") === -1
                                    })
                          })
        }
        fetchAuth(getAPIBaseURL + "payment-modes/", 'get', computePaymentModes)
    }

    // paymentMode
    paymentModeOnValueChange = (item) => {
        this.setState({paymentMode: item}, this.validateForm)
    }

    enableButton = () => {
        this.setState({canSubmit: true})
    }

    disableButton = () => {
        this.setState({canSubmit: false})
    }

    validFields = () => {
        this.setState({validFields: true}, this.validateForm)
    }

    validateForm = () => {
        if (this.state.paymentMode)
        {
            this.setState({validCustomFields: true})

            if (this.state.validFields)
                this.enableButton()
            else
                this.disableButton()
        }
        else
            this.disableButton()
    }

    submitForm = (data) => {
        this.disableButton()

        data.member_login = this.state.member.login
        data.payment_mode = this.state.paymentMode.cyclos_id

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
        var divAmountClass = classNames({
            'form-group row': true,
            'has-error has-feedback': this.state.amountInvalid,
        })

        var reactSelectizeErrorClass = classNames({
            'has-error has-feedback': this.state.amountInvalid,
        })

        if (this.state.member) {
            var memberName = this.state.member.firstname + " " + this.state.member.lastname
        }
        else {
            var memberName = null
        }

        return (
            <div className="row">
                <MemberChangeEuroEuskoForm
                    onValidSubmit={this.submitForm}
                    onInvalid={this.disableButton}
                    onValid={this.validFields}
                    ref="memberchangeeuroeusko">
                    <fieldset>
                        <div className="form-group row">
                            <label
                                className="control-label col-sm-3"
                                htmlFor="memberchangeeuroeusko-fullname">
                                {__("Nom complet")}
                            </label>
                            <div className="col-sm-6 memberchangeeuroeusko control-label text-align-left"
                                 data-eusko="memberchangeeuroeusko-fullname">
                                {memberName}
                            </div>
                            <div className="col-sm-3"></div>
                        </div>
                        <Input
                            name="amount"
                            data-eusko="entreestock-amount"
                            value=""
                            label={__("Montant")}
                            type="number"
                            placeholder={__("Montant du change")}
                            validations="isPositiveNumeric"
                            validationErrors={{
                                isPositiveNumeric: __("Montant invalide.")
                            }}
                            elementWrapperClassName={[{'col-sm-9': false}, 'col-sm-5']}
                            required
                        />
                        <div className="form-group row">
                            <label
                                className="control-label col-sm-3"
                                data-required="true"
                                htmlFor="memberchangeeuroeusko-payment_mode">
                                {__("Mode de paiement")}
                                <span className="required-symbol">&nbsp;*</span>
                            </label>
                            <div className="col-sm-5 memberchangeeuroeusko" data-eusko="memberchangeeuroeusko-payment_mode">
                                <SimpleSelect
                                    className={reactSelectizeErrorClass}
                                    ref="select"
                                    value={this.state.paymentMode}
                                    options={this.state.paymentModeList}
                                    placeholder={__("Mode de paiement")}
                                    theme="bootstrap3"
                                    onValueChange={this.paymentModeOnValueChange}
                                    renderOption={SelectizeUtils.selectizeRenderOption}
                                    renderValue={SelectizeUtils.selectizeRenderValue}
                                    onBlur={this.validateForm}
                                    renderNoResultsFound={SelectizeUtils.selectizeNoResultsFound}
                                    required
                                />
                            </div>
                            <div className="col-sm-3"></div>
                        </div>
                    </fieldset>
                    <fieldset>
                        <Row layout="horizontal">
                            <input
                                name="submit"
                                data-eusko="memberchangeeuroeusko-submit"
                                type="submit"
                                defaultValue={__("Enregistrer le change")}
                                className="btn btn-success"
                                formNoValidate={true}
                                disabled={!this.state.canSubmit}
                            />
                        </Row>
                    </fieldset>
                </MemberChangeEuroEuskoForm>
                <ToastContainer ref="container"
                                toastMessageFactory={ToastMessageFactory}
                                className="toast-top-right toast-top-right-navbar" />
            </div>
        );
    }
}


ReactDOM.render(
    <MemberChangeEuroEuskoPage url={getAPIBaseURL + "change-euro-eusko/"} method="POST" />,
    document.getElementById('change-euro-eusko')
)

ReactDOM.render(
    <NavbarTitle title={__("Change € - Eusko")} />,
    document.getElementById('navbar-title')
)