import {
    fetchAuth,
    isPostiveNumeric,
    getAPIBaseURL,
    NavbarTitle,
    SelectizeUtils
} from 'Utils'

const {
    Input,
    Row
} = FRC

const {
    ToastContainer
} = ReactToastr
const ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation)

Formsy.addValidationRule('isPostiveNumeric', isPostiveNumeric)

const EntreeStockForm = React.createClass({

    mixins: [FRC.ParentContextMixin],

    propTypes: {
        children: React.PropTypes.node
    },

    render() {
        return (
            <Formsy.Form
                className={this.getLayoutClassName()}
                {...this.props}
                ref="entreestock"
            >
                {this.props.children}
            </Formsy.Form>
        );
    }
});

class EntreeStockPage extends React.Component {

    constructor(props) {
        super(props);

        // Default state
        this.state = {
            canSubmit: false,
            response: undefined,
        }
    }

    enableButton = () => {
        this.setState({canSubmit: true})
    }

    disableButton = () => {
        this.setState({canSubmit: false})
    }

    submitForm = (data) => {
        console.log(data)

        var computeForm = (response) => {
            this.setState({response: response})
            this.refs.container.success(
                __("L'enregistrement de l'entrée stock s'est déroulée correctement."),
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
            console.error(getAPIBaseURL + "entree-stock/", err)
            this.refs.container.error(
                __("Une erreur s'est produite lors de l'enregistrement de l'entrée stock !"),
                "",
                {
                    timeOut: 5000,
                    extendedTimeOut: 10000,
                    closeButton:true
                }
            )
        }
        fetchAuth(getAPIBaseURL + "entree-stock/", 'POST', computeForm, data, promiseError)
    }

    render = () => {
        return (
            <div className="row">
                <EntreeStockForm
                    onValidSubmit={this.submitForm}
                    onInvalid={this.disableButton}
                    onValid={this.enableButton}
                    ref="entreestock">
                    <fieldset>
                        <Input
                            name="amount"
                            data-eusko="entreestock-amount"
                            value=""
                            label={__("Montant")}
                            type="number"
                            placeholder={__("Montant de l'entrée stock")}
                            validations="isPostiveNumeric"
                            validationErrors={{
                                isPostiveNumeric: __("Montant invalide.")
                            }}
                            elementWrapperClassName={[{'col-sm-9': false}, 'col-sm-5']}
                            required
                        />
                        <Input
                            name="porteur"
                            data-eusko="entreestock-porteur"
                            value=""
                            label={__("Porteur")}
                            type="text"
                            placeholder={__("Nom du porteur")}
                            validations="isExisty"
                            validationErrors={{
                                isExisty: __("Nom de porteur invalide.")
                            }}
                            elementWrapperClassName={[{'col-sm-9': false}, 'col-sm-5']}
                            required
                        />
                    </fieldset>
                    <fieldset>
                        <Row layout="horizontal">
                            <input
                                name="submit"
                                data-eusko="entreestock-submit"
                                type="submit"
                                defaultValue={__("Enregistrer l'entrée stock")}
                                className="btn btn-success"
                                formNoValidate={true}
                                disabled={!this.state.canSubmit}
                            />
                        </Row>
                    </fieldset>
                </EntreeStockForm>
                <ToastContainer ref="container"
                                toastMessageFactory={ToastMessageFactory}
                                className="toast-top-right toast-top-right-navbar" />
            </div>
        );
    }
}


ReactDOM.render(
    <EntreeStockPage />,
    document.getElementById('entree-stock')
)

ReactDOM.render(
    <NavbarTitle title={__("Entrée Stock BDC")} />,
    document.getElementById('navbar-title')
)