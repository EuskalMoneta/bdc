import {
    fetchAuth,
    getAPIBaseURL,
    isPostiveNumeric,
    NavbarTitle,
    SelectizeUtils
} from 'Utils'

const {
    Input,
    Textarea,
    Row
} = FRC

import ReactSelectize from 'react-selectize'
const SimpleSelect = ReactSelectize.SimpleSelect

import classNames from 'classnames'

const {
    ToastContainer
} = ReactToastr
const ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation)

Formsy.addValidationRule('isPostiveNumeric', isPostiveNumeric)

const IOStockForm = React.createClass({

    mixins: [FRC.ParentContextMixin],

    propTypes: {
        children: React.PropTypes.node
    },

    render() {
        return (
            <Formsy.Form
                className={this.getLayoutClassName()}
                {...this.props}
                ref="iostock"
            >
                {this.props.children}
            </Formsy.Form>
        );
    }
});

class IOStockPage extends React.Component {

    constructor(props) {
        super(props);

        // Default state
        this.state = {
            canSubmit: false,
            validFields: false,
            validCustomFields: false,
            response: undefined,
            porteur: '',
            porteurList: ''
        }

        // Get porteurList data
        var computePorteurListData = (porteurList) => {
            this.setState({porteurList: _.sortBy(porteurList, function(item){ return item.label })})
        }
        fetchAuth(getAPIBaseURL + "porteurs-eusko/", 'get', computePorteurListData)
    }

    // porteur
    porteurOnValueChange = (item) => {
        this.setState({porteur: item}, this.validateForm)
    }

    enableButton = () => {
        this.setState({canSubmit: true})
    }

    disableButton = () => {
        this.setState({canSubmit: false})
    }

    validFields = () => {
        this.setState({validFields: true}, this.validateForm);
    }

    validateForm = () => {
        if (this.state.porteur)
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
        data.porteur = this.state.porteur.value
        console.log(data)

        var computeForm = (response) => {
            this.setState({response: response})
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
        fetchAuth(this.props.url, 'POST', computeForm, data, promiseError)
    }

    render = () => {
        var divAmountClass = classNames({
            'form-group row': true,
            'has-error has-feedback': this.state.amountInvalid,
        })

        var reactSelectizeErrorClass = classNames({
            'has-error has-feedback': this.state.amountInvalid,
        })

        return (
            <div className="row">
                <IOStockForm
                    onValidSubmit={this.submitForm}
                    onInvalid={this.disableButton}
                    onValid={this.validFields}
                    ref="iostock">
                    <fieldset>
                        <Input
                            name="amount"
                            data-eusko="iostock-amount"
                            value=""
                            label={__("Montant")}
                            type="number"
                            placeholder={__("Montant de l'enregistrement")}
                            validations="isPostiveNumeric"
                            validationErrors={{
                                isPostiveNumeric: __("Montant invalide.")
                            }}
                            elementWrapperClassName={[{'col-sm-9': false}, 'col-sm-6']}
                            required
                        />
                        <div className="form-group row">
                            <label
                                className="control-label col-sm-3"
                                data-required="true"
                                htmlFor="iostock-porteur">
                                {__("Porteur")}
                                <span className="required-symbol">&nbsp;*</span>
                            </label>
                            <div className="col-sm-6 iostock" data-eusko="iostock-porteur">
                                <SimpleSelect
                                    className={reactSelectizeErrorClass}
                                    ref="select"
                                    value={this.state.porteur}
                                    options={this.state.porteurList}
                                    placeholder={__("Porteur")}
                                    theme="bootstrap3"
                                    onValueChange={this.porteurOnValueChange}
                                    renderOption={SelectizeUtils.selectizeRenderOption}
                                    renderValue={SelectizeUtils.selectizeRenderValue}
                                    onBlur={this.validateForm}
                                    renderNoResultsFound={SelectizeUtils.selectizeNoResultsFound}
                                    required
                                />
                            </div>
                            <div className="col-sm-3"></div>
                        </div>
                        <Textarea
                            name="description"
                            value={this.props.textarea_description}
                            data-eusko="iostock-description"
                            rows={3}
                            elementWrapperClassName={[{'col-sm-9': false}, 'col-sm-6']}
                            label={__("Description")}
                            placeholder={__("Vous devez fournir une description.")}
                            required
                        />
                    </fieldset>
                    <fieldset>
                        <Row layout="horizontal">
                            <input
                                name="submit"
                                data-eusko="iostock-submit"
                                type="submit"
                                defaultValue={propTranslateButton}
                                className="btn btn-success"
                                formNoValidate={true}
                                disabled={!this.state.canSubmit}
                            />
                        </Row>
                    </fieldset>
                </IOStockForm>
                <ToastContainer ref="container"
                                toastMessageFactory={ToastMessageFactory}
                                className="toast-top-right toast-top-right-navbar" />
            </div>
        );
    }
}

if (window.location.pathname.toLowerCase().indexOf("entree-stock") != -1)
{
    // URL = entree-stock
    var propURL = getAPIBaseURL + "entree-stock/"
    var propTitle = "Entrée stock BDC"
    var propTranslateTitle = __("Entrée stock BDC")
    var propTranslateButton = __("Enregistrer l'entrée stock")
}
else {
    // URL = sortie-stock
    var propURL = getAPIBaseURL + "sortie-stock/"
    var propTitle = "Sortie stock BDC"
    var propTranslateTitle = __("Sortie stock BDC")
    var propTranslateButton = __("Enregistrer la sortie stock")
}

ReactDOM.render(
    <IOStockPage url={propURL} textarea_description={propTitle} validate_button={propTranslateButton} />,
    document.getElementById('io-stock')
)

ReactDOM.render(
    <NavbarTitle title={propTranslateTitle} />,
    document.getElementById('navbar-title')
)