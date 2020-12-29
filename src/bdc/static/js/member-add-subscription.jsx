import {
    fetchAuth,
    getAPIBaseURL,
    isPositiveInteger,
    NavbarTitle,
    SelectizeUtils,
} from 'Utils'

import ModalEusko from 'Modal'

const {
    Input,
    RadioGroup,
    Row,
} = FRC

import ReactSelectize from 'react-selectize'
const SimpleSelect = ReactSelectize.SimpleSelect

import classNames from 'classnames'

const {
    ToastContainer
} = ReactToastr
const ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation)

Formsy.addValidationRule('isPositiveInteger', isPositiveInteger)


const MemberSubscriptionForm = React.createClass({

    mixins: [FRC.ParentContextMixin],

    propTypes: {
        children: React.PropTypes.node
    },

    render() {
        return (
            <Formsy.Form
                className={this.getLayoutClassName()}
                {...this.props}
                ref="memberaddsubscription"
            >
                {this.props.children}
            </Formsy.Form>
        );
    }
});

class MemberSubscriptionPage extends React.Component {

    constructor(props) {
        super(props);

        // Default state 
        var stateData = JSON.parse(sessionStorage.getItem('restart-member-add-subscription'))

        if (stateData) {
            stateData.isModalOpen = false
            stateData.modalBody = undefined
            this.state = stateData
        }
        else {
            this.state = {
                canSubmit: false,
                amount: undefined,
                customAmount: undefined,
                amountInvalid: false,
                memberID: document.getElementById("member_id").value,
                member: undefined,
                paymentMode: '',
                paymentModeList: undefined,
                displayCustomAmount: false,
                isModalOpen: false,
                formData: undefined,
                modalBody: undefined
            }
        }

        // Get member data
        var computeMemberData = (member) => {
            this.setState({member: member})
        }

        // Get payment_modes
        var computePaymentModes = (paymentModes) => {
            this.setState({paymentModeList: paymentModes})
        }

        // We don't need to update default state, if we already got a state from sessionStorage
        if (!stateData) {
            fetchAuth(getAPIBaseURL + "members/" + this.state.memberID + "/", 'get', computeMemberData)
            fetchAuth(getAPIBaseURL + "payment-modes/", 'get', computePaymentModes)
        }
    }

    enableButton = () => {
        this.setState({canSubmit: true});
    }

    disableButton = () => {
        this.setState({canSubmit: false});
    }

    submitForm = () => {
        var computeForm = (data) => {
            // Clean sessionStorage from data we may have saved
            sessionStorage.removeItem('restart-member-add-subscription')

            this.refs.container.success(
                __("L'enregistrement de la cotisation s'est déroulée correctement."),
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

            // Save actual state for later
            sessionStorage.setItem('restart-member-add-subscription', JSON.stringify(this.state))
            this.enableButton()

            console.error(this.props.url, err)
            this.refs.container.error(
                __("Une erreur s'est produite lors de l'enregistrement de la cotisation !"),
                "",
                {
                    timeOut: 5000,
                    extendedTimeOut: 10000,
                    closeButton:true
                }
            )
        }
        fetchAuth(this.props.url, this.props.method, computeForm, this.state.formData, promiseError)
    }

    buildForm = () => {
        this.disableButton()

        var data = {amount: this.state.amount,
                    payment_mode: this.state.paymentMode.value,
                    member_id: document.getElementById("member_id").value,
                    cyclos_id_payment_mode: this.state.paymentMode.cyclos_id}

        if (this.state.customAmount)
            data.amount = this.state.customAmount

        this.setState({formData: data}, this.getModalElements)
    }

    openModal = () => {
        this.setState({isModalOpen: true})
    }

    hideModal = () => {
        this.setState({isModalOpen: false})
    }

    getModalElements = () => {
        this.setState({modalBody:
            _.map(this.state.formData,
                (item, key) => {
                    switch (key) {
                        case 'member_id':
                            if (this.state.member.login.startsWith("Z")) {
                                var name = this.state.member.login + ' - ' + this.state.member.company
                            }
                            else {
                                var name = this.state.member.login + ' - ' + this.state.member.firstname + ' ' + this.state.member.lastname
                            }
                            return {'label': __('N° adhérent - Nom'), order: 1, 'value': name}
                            break;
                        case 'amount':
                            return {'label': __('Montant'), 'value': item, order: 2}
                            break;
                        case 'payment_mode':
                            return {'label': __('Mode de paiement'), 'value': this.state.paymentMode.label, order: 3}
                            break;
                        case 'cyclos_id_payment_mode':
                            break;
                        default:
                            return {'label': item, 'value': item, order: 999}
                            break;
                    }
                }
            )
        }, this.openModal)
    }

    validateForm = () => {
        if (Boolean(this.state.paymentMode) &&
            (Boolean(!this.state.customAmount && this.state.amount) ||
                Boolean(this.state.customAmount && !this.state.amountInvalid)))
        {
            this.enableButton()
        }
        else {
            this.disableButton()
        }
    }

    // amount
    validateAmount = (field, value) => {
        if (isPositiveInteger(null, value)) {
            this.setState({customAmount: value}, this.validateForm)
        }
        else {
            this.setState({customAmount: undefined}, this.validateForm)
        }

        if (Number(value) >= Number(5)) {
            this.setState({amountInvalid: false}, this.validateForm)
        }
        else {
            this.setState({amountInvalid: true}, this.validateForm)
        }
    }

    setAmount = (field, value) => {
        if (value == 'customAmount') {
            this.setState({amount: 'customAmount', customAmount: undefined, displayCustomAmount: true}, this.validateForm)
        } else {
            this.setState({amount: value, customAmount: undefined, displayCustomAmount: false}, this.validateForm)
        }
    }

    // paymentMode
    paymentModeRenderOption = (item) => {
        // This is how the list itself is displayed
        return  <div className="simple-option" style={{display: "flex", alignItems: "center"}}>
                    <div className="memberaddform" style={{marginLeft: 10}}>
                        {item.label}
                    </div>
                </div>
    }

    paymentModeRenderValue = (item) => {
        // When we select a value, this is how we display it
        return  <div className="simple-value">
                    <span className="memberaddform" style={{marginLeft: 10, verticalAlign: "middle"}}>
                        {item.label}
                    </span>
                </div>
    }

    paymentModeOnValueChange = (item) => {
        if (item)
            this.setState({paymentMode: item})
        else
            this.setState({paymentMode: undefined})

        this.validateForm()
    }

    render = () => {
        var divCustomAmountClass = classNames({
            'form-group row': true,
            'hidden': !this.state.displayCustomAmount,
            'has-error has-feedback': this.state.amountInvalid,
        })

        if (this.state.amountInvalid)
            var spanInvalidAmount = (
                <span className="help-block has-error-value">
                    {__("Montant personnalisé incorrect, choisissez un montant dans la liste ou un montant supérieur à 5 €/eusko.")}
                </span>)
        else
            var spanInvalidAmount = null

        if (this.state.member) {
            var memberName = this.state.member.firstname + " " + this.state.member.lastname
            var memberLogin = this.state.member.login
        }
        else {
            var memberName = null
            var memberLogin = null
        }

        return (
            <div className="row">
                <MemberSubscriptionForm
                    onInvalid={this.validateForm}
                    onValid={this.validateForm}
                    ref="memberaddsubscription">
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
                                htmlFor="memberaddsubscription-fullname">
                                {__("Nom")}
                            </label>
                            <div className="col-sm-6 memberaddsubscription control-label text-align-left"
                                 data-eusko="memberaddsubscription-fullname">
                                {memberName}
                            </div>
                            <div className="col-sm-3"></div>
                        </div>
                        <RadioGroup
                            name="amount"
                            data-eusko="memberaddsubscription-amount"
                            value={this.state.amount}
                            label={__("Montant")}
                            options={[
                                {value: '24', label: '24 €/eusko'},
                                {value: '36', label: '36 €/eusko'},
                                {value: '60', label: '60 €/eusko'},
                                {value: '5', label: __("5 €/eusko (chômeurs, allocataires de minima sociaux, étudiants)")},
                                {value: 'customAmount', label: __("Autre montant")},
                            ]}
                            required
                            onChange={this.setAmount}
                        />
                        <Input
                            name="customAmount"
                            data-eusko="bank-deposit-customAmount"
                            value={this.state.customAmount ? this.state.customAmount : ""}
                            type="number"
                            placeholder={__("Montant de la cotisation")}
                            validations="isPositiveInteger"
                            validationErrors={{
                               isPositiveInteger: __("Montant invalide.")
                            }}
                            label={__("Montant personnalisé")}
                            onChange={this.validateAmount}
                            rowClassName={divCustomAmountClass}
                            elementWrapperClassName={[{'col-sm-9': false}, 'col-sm-6']}
                            required={this.state.displayCustomAmount}
                            disabled={!this.state.displayCustomAmount}
                        />
                        {spanInvalidAmount}
                        <div className="form-group row">
                            <label
                                className="control-label col-sm-3"
                                data-required="true"
                                htmlFor="memberaddsubscription-payment_mode">
                                {__("Mode de paiement")}
                                <span className="required-symbol">&nbsp;*</span>
                            </label>
                            <div className="col-sm-6 memberaddsubscription" data-eusko="memberaddsubscription-payment_mode">
                                <SimpleSelect
                                    ref="select"
                                    value={this.state.paymentMode}
                                    options={this.state.paymentModeList}
                                    placeholder={__("Mode de paiement")}
                                    theme="bootstrap3"
                                    onValueChange={this.paymentModeOnValueChange}
                                    renderOption={this.paymentModeRenderOption}
                                    renderValue={this.paymentModeRenderValue}
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
                                data-eusko="memberaddsubscription-submit"
                                type="submit"
                                defaultValue={__("Enregistrer la cotisation")}
                                className="btn btn-success"
                                formNoValidate={true}
                                onClick={() => this.buildForm()}
                                disabled={!this.state.canSubmit}
                            />
                        </Row>
                    </fieldset>
                </MemberSubscriptionForm>
                <ToastContainer ref="container"
                                toastMessageFactory={ToastMessageFactory}
                                className="toast-top-right toast-top-right-navbar" />
                <ModalEusko hideModal={this.hideModal} isModalOpen={this.state.isModalOpen}
                            modalBody={this.state.modalBody}
                            modalTitle={__("Enregistrement d'une cotisation") + " - " + __("Confirmation")}
                            onValidate={this.submitForm}
                />
            </div>
        );
    }
}


ReactDOM.render(
    <MemberSubscriptionPage url={getAPIBaseURL + "members-subscriptions/"} method="POST" />,
    document.getElementById('member-add-subscription')
)

ReactDOM.render(
    <NavbarTitle title={__("Enregistrement d'une cotisation")} />,
    document.getElementById('navbar-title')
)
