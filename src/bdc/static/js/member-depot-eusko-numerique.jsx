import {
    fetchAuth,
    getAPIBaseURL,
    NavbarTitle,
    isPositiveInteger,
    SelectizeUtils
} from 'Utils'

import ModalEusko from 'Modal'

const {
    Input,
    Row
} = FRC


import classNames from 'classnames'

const {
    ToastContainer
} = ReactToastr
const ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation)

Formsy.addValidationRule('isPositiveInteger', isPositiveInteger)

const MemberDepotEuskoNumeriqueForm = React.createClass({

    mixins: [FRC.ParentContextMixin],

    propTypes: {
        children: React.PropTypes.node
    },

    render() {
        return (
            <Formsy.Form
                className={this.getLayoutClassName()}
                {...this.props}
                ref="memberdepot-eusko-numerique"
            >
                {this.props.children}
            </Formsy.Form>
        );
    }
});

class MemberDepotEuskoNumeriquePage extends React.Component {

    constructor(props) {
        super(props);

        // Default state
        this.state = {
            canSubmit: false,
            memberID: document.getElementById("member_id").value,
            member: undefined,
            isModalOpen: false,
            formData: undefined,
            modalBody: undefined
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
        // nothing here
    }

    submitForm = () => {
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
                __("Une erreur s'est produite lors de l'enregistrement, vérifiez si le solde est bien disponible !"),
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

    buildForm = (data) => {
        this.disableButton()

        data.member_login = this.state.member.login
        data.login_bdc = window.config.userName

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
                        case 'member_login':
                            if (item.startsWith("Z")) {
                                var name = item + ' - ' + this.state.member.company
                            }
                            else {
                                var name = item + ' - ' + this.state.member.firstname + ' ' + this.state.member.lastname
                            }
                            return {'label': __('N° adhérent - Nom'), order: 1, 'value': name}
                            break;
                        case 'amount':
                            return {'label': __('Montant'), 'value': item, order: 2}
                            break;
                        case 'login_bdc':
                            break;
                        default:
                            return {'label': item, 'value': item, order: 999}
                            break;
                    }
                }
            )
        }, this.openModal)
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
            var memberName = null
            var memberLogin = null
        }

        return (
            <div className="row">
                <MemberDepotEuskoNumeriqueForm
                    onValidSubmit={this.buildForm}
                    onInvalid={this.disableButton}
                    onValid={this.enableButton}
                    ref="memberdepot-eusko-numerique">
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
                                htmlFor="memberdepot-eusko-numerique-fullname">
                                {__("Nom")}
                            </label>
                            <div className="col-sm-6 memberdepot-eusko-numerique control-label text-align-left"
                                 data-eusko="memberdepot-eusko-numerique-fullname">
                                {memberName}
                            </div>
                            <div className="col-sm-3"></div>
                        </div>
                        <Input
                            name="amount"
                            data-eusko="depot-eusko-numerique-amount"
                            value=""
                            label={__("Montant")}
                            type="number"
                            placeholder={__("Montant du dépot")}
                            validations="isPositiveInteger"
                            onChange={this.onChangeAmount}
                            validationErrors={{
                                isPositiveInteger: __("Montant invalide.")
                            }}
                            elementWrapperClassName={[{'col-sm-9': false}, 'col-sm-5']}
                            required
                        />
                    </fieldset>
                    <fieldset>
                        <Row layout="horizontal">
                            <input
                                name="submit"
                                data-eusko="memberdepot-eusko-numerique-submit"
                                type="submit"
                                defaultValue={__("Enregistrer")}
                                className="btn btn-success"
                                formNoValidate={true}
                                disabled={!this.state.canSubmit}
                            />
                        </Row>
                    </fieldset>
                </MemberDepotEuskoNumeriqueForm>
                <ToastContainer ref="container"
                                toastMessageFactory={ToastMessageFactory}
                                className="toast-top-right toast-top-right-navbar" />
                <ModalEusko hideModal={this.hideModal} isModalOpen={this.state.isModalOpen}
                            modalBody={this.state.modalBody}
                            modalTitle={__("Dépôt sur le compte") + " - " + __("Confirmation")}
                            onValidate={this.submitForm}
                />
            </div>
        )
    }
}


ReactDOM.render(
    <MemberDepotEuskoNumeriquePage url={getAPIBaseURL + "depot-eusko-numerique/"} method="POST" />,
    document.getElementById('depot-eusko-numerique')
)

ReactDOM.render(
    <NavbarTitle title={__("Dépôt sur le compte")} />,
    document.getElementById('navbar-title')
)