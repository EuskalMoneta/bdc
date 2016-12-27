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

const MemberRetraitEuskoNumeriqueForm = React.createClass({

    mixins: [FRC.ParentContextMixin],

    propTypes: {
        children: React.PropTypes.node
    },

    render() {
        return (
            <Formsy.Form
                className={this.getLayoutClassName()}
                {...this.props}
                ref="memberretrait-eusko-numerique"
            >
                {this.props.children}
            </Formsy.Form>
        );
    }
});

class MemberRetraitEuskoNumeriquePage extends React.Component {

    constructor(props) {
        super(props);

        // Default state
        this.state = {
            canSubmit: false,
            memberID: document.getElementById("member_id").value,
            member: undefined
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

    submitForm = (data) => {
        this.disableButton()

        data.member_login = this.state.member.login
        data.login_bdc = window.config.userName

        var computeForm = (data) => {
            console.log(this.props.url, data.error)
            if (data.error) {
                console.log('oui')
                this.refs.container.success(
                    __(data.error),
                    "",
                    {
                        timeOut: 5000,
                        extendedTimeOut: 10000,
                        closeButton:true
                    }
                )
            }
            else {
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
        }

        var promiseError = (err) => {
            // Error during request, or parsing NOK :(
            this.enableButton()
            console.error(this.props.url, err)
            this.refs.container.error(
                __(data.error),
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
            var memberName = null
            var memberLogin = null
        }

        return (
            <div className="row">
                <MemberRetraitEuskoNumeriqueForm
                    onValidSubmit={this.submitForm}
                    onInvalid={this.disableButton}
                    onValid={this.enableButton}
                    ref="memberretrait-eusko-numerique">
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
                                htmlFor="memberretrait-eusko-numerique-fullname">
                                {__("Nom")}
                            </label>
                            <div className="col-sm-6 memberretrait-eusko-numerique control-label text-align-left"
                                 data-eusko="memberretrait-eusko-numerique-fullname">
                                {memberName}
                            </div>
                            <div className="col-sm-3"></div>
                        </div>
                        <Input
                            name="amount"
                            data-eusko="retrait-eusko-numerique-amount"
                            value=""
                            label={__("Montant")}
                            type="number"
                            placeholder={__("Montant du retrait")}
                            validations="isPositiveNumeric"
                            onChange={this.onChangeAmount}
                            validationErrors={{
                                isPositiveNumeric: __("Montant invalide.")
                            }}
                            elementWrapperClassName={[{'col-sm-9': false}, 'col-sm-5']}
                            required
                        />
                    </fieldset>
                    <fieldset>
                        <Row layout="horizontal">
                            <input
                                name="submit"
                                data-eusko="memberretrait-eusko-numerique-submit"
                                type="submit"
                                defaultValue={__("Enregistrer")}
                                className="btn btn-success"
                                formNoValidate={true}
                                disabled={!this.state.canSubmit}
                            />
                        </Row>
                    </fieldset>
                </MemberRetraitEuskoNumeriqueForm>
                <ToastContainer ref="container"
                                toastMessageFactory={ToastMessageFactory}
                                className="toast-top-right toast-top-right-navbar" />
            </div>
        )
    }
}


ReactDOM.render(
    <MemberRetraitEuskoNumeriquePage url={getAPIBaseURL + "retrait-eusko-numerique/"} method="POST" />,
    document.getElementById('retrait-eusko-numerique')
)

ReactDOM.render(
    <NavbarTitle title={__("Retrait du compte")} />,
    document.getElementById('navbar-title')
)