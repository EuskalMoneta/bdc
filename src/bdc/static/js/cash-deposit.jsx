import {
    fetchAuth,
    getAPIBaseURL,
    isPositiveNumeric,
    NavbarTitle,
    SelectizeUtils,
    getCurrentLang
} from 'Utils'

const {
    Input,
    Checkbox,
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

Formsy.addValidationRule('isPositiveNumeric', isPositiveNumeric)

const CashDepositForm = React.createClass({

    mixins: [FRC.ParentContextMixin],

    propTypes: {
        children: React.PropTypes.node
    },

    render() {
        return (
            <Formsy.Form
                className={this.getLayoutClassName()}
                {...this.props}
                ref="cash-deposit"
            >
                {this.props.children}
            </Formsy.Form>
        );
    }
});

var CashDepositPage = React.createClass({

    getInitialState() {
        return {
            canSubmit: false,
            historyTableData: undefined,
            historyTableSelectedRows: Array(),
            depositCalculatedAmount: Number(0),
        }
    },

    componentDidMount() {
        // Get historyTableData
        var computeHistoryTableData = (historyTableData) => {
            // I only want to display items which status is "A remettre à Euskal Moneta"
            this.setState({historyTableData: _.filter(
                historyTableData.result.pageItems,
                (item) => {
                    if (_.findWhere(item.statuses, {name: "A remettre à Euskal Moneta"})) {
                        return item
                    }
                })
            })
        }
        fetchAuth(getAPIBaseURL + "payments-available-deposit/", 'get', computeHistoryTableData)
    },

    onSelectTableRow(row, isSelected, event) {
        var baseNumber = Number(this.state.depositCalculatedAmount)
        var historyTableSelectedRows = this.state.historyTableSelectedRows

        if (Number.isNaN(baseNumber))
            var baseNumber = Number(0)

        if (isSelected) {
            historyTableSelectedRows.push(row)
            this.setState({depositCalculatedAmount: baseNumber + Number(row.amount),
                           historyTableSelectedRows: historyTableSelectedRows},
                          this.validateForm)
        }
        else {
            this.setState({depositCalculatedAmount: baseNumber - Number(row.amount),
                           historyTableSelectedRows: _.filter(historyTableSelectedRows,
                            (item) => {
                                if (row != item)
                                    return item
                            })
                          }, this.validateForm)
        }
    },

    onSelectTableAll(isSelected, rows) {
        if (isSelected) {
            this.setState({depositCalculatedAmount: _.reduce(rows,
                                (memo, row) => {
                                    return memo + Number(row.amount)
                                }, Number(0)),
                           historyTableSelectedRows: rows},
                          this.validateForm)
        }
        else {
            this.setState({depositCalculatedAmount: Number(0),
                           historyTableSelectedRows: Array()},
                          this.validateForm)
        }
    },

    enableButton() {
        this.setState({canSubmit: true})
    },

    disableButton() {
        this.setState({canSubmit: false})
    },

    validateForm() {
        if (this.state.depositCalculatedAmount == Number(0))
            this.disableButton()
        else
            this.enableButton()
    },

    submitForm(data) {
        var postData = {}
        postData.mode = this.props.mode
        postData.login_bdc = window.config.userName
        postData.deposit_amount = this.state.depositCalculatedAmount
        postData.selected_payments = this.state.historyTableSelectedRows

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

            console.log(data)
            console.log("redirect to: " + this.props.nextURL)
            // window.location.assign(this.props.nextURL)
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
        fetchAuth(this.props.url, this.props.method, computeForm, postData, promiseError)
    },

    render() {
        const selectRowProp = {
            mode: 'checkbox',
            clickToSelect: true,
            onSelect: this.onSelectTableRow,
            onSelectAll: this.onSelectTableAll,
        }

        // History data table
        if (this.state.historyTableData) {
            var dateFormatter = (cell, row) => {
                // Force moment i18n
                moment.locale(getCurrentLang)
                return moment(cell).format('LLLL')
            }

            var amountFormatter = (cell, row) => {
                // Cell is a string for now,
                // we need to cast it in a Number object to use the toFixed method.
                return Number(cell).toFixed(2)
            }

            var dataTable = (
                <BootstrapTable
                 data={this.state.historyTableData} striped={true} hover={true}
                 selectRow={selectRowProp} tableContainerClass="react-bs-table-account-history"
                 options={{noDataText: __("Rien à afficher.")}}
                 >
                    <TableHeaderColumn isKey={true} hidden={true} dataField="id">{__("ID")}</TableHeaderColumn>
                    <TableHeaderColumn dataField="date" dataFormat={dateFormatter}>{__("Date")}</TableHeaderColumn>
                    <TableHeaderColumn dataField="description">{__("Libellé")}</TableHeaderColumn>
                    <TableHeaderColumn dataField="amount" dataFormat={amountFormatter}>{__("Montant")}</TableHeaderColumn>
                </BootstrapTable>
            )
        }
        else
            var dataTable = null;

        return (
            <div className="row">
                <div className="col-md-3 history-form">
                    <div className="row"></div>
                    <CashDepositForm
                        onValidSubmit={this.submitForm}
                        onInvalidSubmit={this.submitForm}
                        ref="cash-deposit">
                        <fieldset>
                            <div className="form-group row">
                                <label
                                    className="control-label col-sm-4"
                                    htmlFor="cash-deposit-deposit_amount">
                                    {__("Montant calculé")}
                                </label>
                                <div className="col-sm-8 cash-deposit cash-deposit-amount-div" data-eusko="cash-deposit-deposit_cash">
                                    <span className="deposit-amount-span">
                                        {this.state.depositCalculatedAmount + " €"}
                                    </span>
                                </div>
                            </div>
                        </fieldset>
                        <fieldset>
                            <Row layout="horizontal">
                                <input
                                    name="submit"
                                    data-eusko="cash-deposit-submit"
                                    type="submit"
                                    defaultValue={__("Enregistrer")}
                                    className="btn btn-success"
                                    formNoValidate={true}
                                    disabled={!this.state.canSubmit}
                                />
                            </Row>
                        </fieldset>
                    </CashDepositForm>
                </div>
                <div className="col-md-9 col-history-table">
                    <div className="row margin-right">
                        {dataTable}
                    </div>
                </div>
                <ToastContainer ref="container"
                                toastMessageFactory={ToastMessageFactory}
                                className="toast-top-right toast-top-right-navbar"
                />
            </div>
        );
    }
})

if (window.location.pathname.toLowerCase().indexOf("cash-deposit") != -1)
{
    // URL = cash-deposit
    var propMode = "cash-deposit"
    var propNextURL =  "/manager/history/caisse-euro"
    var propTranslateTitle = __("Remise d'espèces")
}
else if (window.location.pathname.toLowerCase().indexOf("sortie-caisse-eusko") != -1)
{
    // URL = sortie-caisse-eusko
    var propMode =  "sortie-caisse-eusko"
    var propNextURL =  "/manager/history/caisse-eusko"
    var propTranslateTitle = __("Sortie caisse eusko")
}
else if (window.location.pathname.toLowerCase().indexOf("sortie-retour-eusko") != -1)
{
    // URL = sortie-caisse-eusko
    var propMode =  "sortie-retour-eusko"
    var propNextURL =  "/manager/history/retour-eusko"
    var propTranslateTitle = __("Sortie retours d'eusko")
}
else
    window.location.assign("/manager");

ReactDOM.render(
    <CashDepositPage url={getAPIBaseURL + propMode + "/"} method="POST" mode={propMode} nextURL={propNextURL}/>,
    document.getElementById('cash-deposit')
)

ReactDOM.render(
    <NavbarTitle title={propTranslateTitle} />,
    document.getElementById('navbar-title')
)