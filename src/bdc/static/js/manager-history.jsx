import {
    fetchAuth,
    getAPIBaseURL,
    isPostiveNumeric,
    NavbarTitle,
    SelectizeUtils
} from 'Utils'

const {
    Input,
    Row
} = FRC

import {
    BootstrapTable,
    TableHeaderColumn
} from 'react-bootstrap-table'
import 'node_modules/react-bootstrap-table/dist/react-bootstrap-table.min.css'

import ReactSelectize from 'react-selectize'
const SimpleSelect = ReactSelectize.SimpleSelect

import classNames from 'classnames'

const {
    ToastContainer
} = ReactToastr
const ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation)

Formsy.addValidationRule('isPostiveNumeric', isPostiveNumeric)

const ManagerHistoryForm = React.createClass({

    mixins: [FRC.ParentContextMixin],

    propTypes: {
        children: React.PropTypes.node
    },

    render() {
        return (
            <Formsy.Form
                className={this.getLayoutClassName()}
                {...this.props}
                ref="managerhistory"
            >
                {this.props.children}
            </Formsy.Form>
        );
    }
});

class ManagerHistoryPage extends React.Component {

    constructor(props) {
        super(props);

        // Default state
        this.state = {
            canSubmit: false,
            validFields: false,
            validCustomFields: false,
            accountName: document.getElementById("account_name").value,
            historyList: undefined,
        }

        // Get payment_modes
        var computeHistoryList = (historyList) => {
            this.setState({historyList: historyList})
        }
        fetchAuth(getAPIBaseURL + "accounts-history/?account_type=" + this.props.mode, 'get', computeHistoryList)
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
        data.member_login = this.state.member.login
        data.payment_mode = this.state.paymentMode.cyclos_id

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
        var divAmountClass = classNames({
            'form-group row': true,
            'has-error has-feedback': this.state.amountInvalid,
        })

        var reactSelectizeErrorClass = classNames({
            'react-selectize-manager-history': true,
            'has-error has-feedback': this.state.amountInvalid,
        })

        // Which buttons we need to display before the table
        if (this.props.mode == 'stock_de_billets_bdc') {
            var actionButtons = (
                <div className="row margin-bottom">
                    <div className="col-md-offset-1 col-md-2 col-sm-4">
                        <a href="/entree-stock" className="btn btn-info">{__("Entrée")}</a>
                    </div>
                    <div className="col-md-offset-1 col-md-2 col-sm-4">
                        <a href="/sortie-stock" className="btn btn-default">{__("Sortie")}</a>
                    </div>
                    <div className="col-md-offset-1 col-md-2 col-sm-4">
                        <label className="control-label col-sm-3 solde-history-label">{__("Solde") + ": "}</label>
                    </div>
                </div>
            )
        }
        else if (this.props.mode == 'caisse_euro_bdc') {
            var actionButtons = (
                <div className="row margin-bottom">
                    <div className="col-md-offset-1 col-md-2 col-sm-4">
                        <a className="btn btn-info">{__("Dépôt en banque")}</a>
                    </div>
                    <div className="col-md-offset-1 col-md-2 col-sm-4">
                        <a className="btn btn-default">{__("Remise d'espèces")}</a>
                    </div>
                    <div className="col-md-offset-1 col-md-2 col-sm-4">
                        <label className="control-label col-sm-3 solde-history-label">{__("Solde") + ": "}</label>
                    </div>
                </div>
            )
        }
        else if (this.props.mode == 'caisse_eusko_bdc' || this.props.mode == 'retours_d_eusko_bdc') {
            var actionButtons = (
                <div className="row margin-bottom">
                    <div className="col-md-offset-1 col-md-2 col-sm-4">
                        <a href="/sortie-stock" className="btn btn-info">{__("Sortie")}</a>
                    </div>
                    <div className="col-md-offset-1 col-md-2 col-sm-4">
                        <label className="control-label col-sm-3 solde-history-label">{__("Solde") + ": "}</label>
                    </div>
                </div>
            )
        }


        const selectRowProp = {
            mode: 'checkbox',
            clickToSelect: true,
            onSelect: (row, isSelected, event) => {
                // window.location.assign("/members/" + row.id)
            }
        }

        // History data table
        if (this.state.historyList) {
            var historyTable = (
                <BootstrapTable data={this.state.historyList} striped={true} hover={true} selectRow={selectRowProp}>
                    <TableHeaderColumn dataField="date" isKey={true} width="100">{__("Date")}</TableHeaderColumn>
                    <TableHeaderColumn dataField="label">{__("Libellé")}</TableHeaderColumn>
                    <TableHeaderColumn dataField="amount">{__("Montant")}</TableHeaderColumn>
                    <TableHeaderColumn dataField="solde">{__("Solde")}</TableHeaderColumn>
                </BootstrapTable>
            )
        }
        else
            var historyTable = null;

        return (
            <div className="row">
                <div className="col-md-3 history-form">
                    <div className="row"></div>
                    <ManagerHistoryForm
                        onValidSubmit={this.submitForm}
                        onInvalid={this.disableButton}
                        onValid={this.validFields}
                        ref="managerhistory">
                        <fieldset>
                            <Input
                                name="amount"
                                data-eusko="entreestock-amount"
                                value=""
                                label={__("Montant")}
                                type="number"
                                placeholder={__("Montant du change")}
                                validations="isPostiveNumeric"
                                validationErrors={{
                                    isPostiveNumeric: __("Montant invalide.")
                                }}
                                elementWrapperClassName={[{'col-sm-9': false}, 'col-sm-8']}
                                required
                            />
                            <div className="form-group row">
                                <label
                                    className="control-label col-sm-3"
                                    data-required="true"
                                    htmlFor="managerhistory-payment_mode">
                                    {__("Mode de paiement")}
                                    <span className="required-symbol">&nbsp;*</span>
                                </label>
                                <div className="col-sm-8 managerhistory" data-eusko="managerhistory-payment_mode">
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
                            </div>
                        </fieldset>
                        <fieldset>
                            <Row layout="horizontal">
                                <input
                                    name="submit"
                                    data-eusko="managerhistory-submit"
                                    type="submit"
                                    defaultValue={__("Enregistrer le change")}
                                    className="btn btn-success"
                                    formNoValidate={true}
                                    disabled={!this.state.canSubmit}
                                />
                            </Row>
                        </fieldset>
                    </ManagerHistoryForm>
                </div>
                <div className="col-md-9 col-history-table">
                    {actionButtons}
                    <div className="row">
                        {historyTable}
                    </div>
                </div>
                <ToastContainer ref="container"
                                toastMessageFactory={ToastMessageFactory}
                                className="toast-top-right toast-top-right-navbar"
                />
            </div>
        );
    }
}

if (window.location.pathname.toLowerCase().indexOf("stock-billets") != -1)
{
    var pageTitle = __("Historique stock billets")
    var mode = 'stock_de_billets_bdc'
    var url = getAPIBaseURL + "change-euro-eusko/"
}
else if (window.location.pathname.toLowerCase().indexOf("caisse-euro") != -1)
{
    var pageTitle = __("Historique caisse Euro")
    var mode = 'caisse_euro_bdc'
    var url = getAPIBaseURL + "change-euro-eusko/"
}
else if (window.location.pathname.toLowerCase().indexOf("caisse-eusko") != -1)
{
    var pageTitle = __("Historique caisse Eusko")
    var mode = 'caisse_eusko_bdc'
    var url = getAPIBaseURL + "change-euro-eusko/"
}
else if (window.location.pathname.toLowerCase().indexOf("retour-eusko") != -1)
{
    var pageTitle = __("Historique retour Eusko")
    var mode = 'retours_d_eusko_bdc'
    var url = getAPIBaseURL + "change-euro-eusko/"
}
else
    window.location.assign("/manager");



ReactDOM.render(
    <ManagerHistoryPage url={url} mode={mode} />,
    document.getElementById('manager-history')
)

ReactDOM.render(
    <NavbarTitle title={pageTitle} />,
    document.getElementById('navbar-title')
)