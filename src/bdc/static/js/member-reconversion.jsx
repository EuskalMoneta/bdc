import {
    fetchAuth,
    getAPIBaseURL,
    NavbarTitle,
    isPostiveNumeric,
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

Formsy.addValidationRule('isPostiveNumeric', isPostiveNumeric)

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
        }

        // Get member data
        var computeMemberData = (member) => {
            this.setState({member: member})
        }
        fetchAuth(getAPIBaseURL + "members/" + this.state.memberID + "/", 'get', computeMemberData)
    }

    enableButton = () => {
        this.setState({canSubmit: true});
    }

    disableButton = () => {
        this.setState({canSubmit: false});
    }

    submitForm = (data) => {
        data.member_login = this.state.member.login
        console.log(data)

        var computeForm = (data) => {
            this.setState({data: data})
            this.refs.container.success(
                __("L'enregistrement s'est déroulée correctement."),
                "",
                {
                    timeOut: 5000,
                    extendedTimeOut: 10000,
                    closeButton:true
                }
            )
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

    render = () => {
        if (this.state.member) {
            var memberName = this.state.member.firstname + " " + this.state.member.lastname
        }
        else {
            var memberName = null
        }

        return (
            <div className="row">
                <MemberReconversionForm
                    onValidSubmit={this.submitForm}
                    onInvalid={this.disableButton}
                    onValid={this.enableButton}
                    ref="memberreconversion">
                    <fieldset>
                        <div className="form-group row">
                            <label
                                className="control-label col-sm-3"
                                htmlFor="memberreconversion-fullname">
                                {__("Nom complet")}
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
                            validations="isPostiveNumeric"
                            validationErrors={{
                                isPostiveNumeric: __("Montant invalide.")
                            }}
                            elementWrapperClassName={[{'col-sm-9': false}, 'col-sm-5']}
                            required
                        />
                        <Input
                            name="facture"
                            data-eusko="reconversion-amount"
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