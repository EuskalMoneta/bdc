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

const BankDepositForm = React.createClass({

    mixins: [FRC.ParentContextMixin],

    propTypes: {
        children: React.PropTypes.node
    },

    render() {
        return (
            <Formsy.Form
                className={this.getLayoutClassName()}
                {...this.props}
                ref="bank-deposit"
            >
                {this.props.children}
            </Formsy.Form>
        );
    }
});

var BankDepositPage = React.createClass({

    getInitialState() {
        return {
            canSubmit: false,
            validFields: false,
            validCustomFields: false,
            historyTableData: undefined,
            paymentModeList: undefined,
            depositBankList: undefined,
            depositBank: undefined,
            depositAmount: '0',
            displayCustomAmount: false,
        }
    },

    componentDidMount() {
        // Get payment_modes
        var computePaymentModes = (paymentModes) => {
            // 'Euro-LIQ'
            // 'Euro-CHQ'
            // 'Eusko-LIQ' <- We don't want the eusko payment mode in this page.
            this.setState({paymentModeList:
                           _.filter(paymentModes,
                                    (item) => {
                                        return item.value.toLowerCase().indexOf("eusko") === -1
                                    })
                           })
        }
        fetchAuth(getAPIBaseURL + "payment-modes/", 'get', computePaymentModes)

        // Get depositBankList
        var computeBankDepositList = (depositBankList) => {
            this.setState({depositBankList: depositBankList})
        }
        fetchAuth(getAPIBaseURL + "deposit-banks/", 'get', computeBankDepositList)

        // Get historyTableData
        var computeHistoryTableData = (historyTableData) => {
            this.setState({historyTableData: historyTableData.result.pageItems})
        }
        fetchAuth(getAPIBaseURL + "payments-available-deposit/", 'get', computeHistoryTableData)
    },

    // paymentMode
    paymentModeOnValueChange (item) {
        this.setState({paymentMode: item}, this.validateForm)
        // debugger

        // Display custom amount field ?
        if (item && item.value.toLowerCase() === 'euro-liq')
            this.setState({displayCustomAmount: true})
        else
            this.setState({displayCustomAmount: false})

        // TODO filter historyTableData
    },

    // depositBank
    depositBankOnValueChange (item) {
        this.setState({depositBank: item}, this.validateForm)
    },

    enableButton() {
        this.setState({canSubmit: true})
    },

    disableButton() {
        this.setState({canSubmit: false})
    },

    validFields() {
        this.setState({validFields: true}, this.validateForm)
    },

    validateForm() {
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
    },

    submitForm(data) {
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
    },

    render() {

        // Should we display customAmount field
        var divCustomAmountClass = classNames({
            'form-group row': true,
            'hidden': !this.state.displayCustomAmount,
        })

        const selectRowProp = {
            mode: 'checkbox',
            clickToSelect: true,
            onSelect: (row, isSelected, event) => {
                debugger
                this.setState({depositAmount: Number(this.state.depositAmount) + Number(row.amount)})
            }
        }

        // History data table
        if (this.state.historyTableData) {
            var dateFormatter = (cell, row) => {
                // !! Force moment to be french
                moment.locale('fr')
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
                    <BankDepositForm
                        onValidSubmit={this.submitForm}
                        onInvalid={this.disableButton}
                        onValid={this.validFields}
                        ref="bank-deposit">
                        <fieldset>
                            <div className="form-group row">
                                <label
                                    className="control-label col-sm-3"
                                    data-required="true"
                                    htmlFor="bank-deposit-payment_mode">
                                    {__("Paiement")}
                                    <span className="required-symbol">&nbsp;*</span>
                                </label>
                                <div className="col-sm-8 bank-deposit" data-eusko="bank-deposit-payment_mode">
                                    <SimpleSelect
                                        ref="select"
                                        value={this.state.paymentMode}
                                        options={this.state.paymentModeList}
                                        placeholder={__("Mode de paiement")}
                                        theme="bootstrap3"
                                        onValueChange={this.paymentModeOnValueChange}
                                        renderOption={SelectizeUtils.selectizeRenderOption}
                                        renderValue={SelectizeUtils.selectizeRenderValue}
                                        onBlur={this.validateForm}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group row">
                                <label
                                    className="control-label col-sm-3"
                                    data-required="true"
                                    htmlFor="bank-deposit-payment_mode">
                                    {__("Banque")}
                                    <span className="required-symbol">&nbsp;*</span>
                                </label>
                                <div className="col-sm-8 bank-deposit" data-eusko="bank-deposit-deposit_bank">
                                    <SimpleSelect
                                        ref="select"
                                        value={this.state.depositBank}
                                        options={this.state.depositBankList}
                                        placeholder={__("Banque de dépôt")}
                                        theme="bootstrap3"
                                        onValueChange={this.depositBankOnValueChange}
                                        renderOption={SelectizeUtils.selectizeRenderOption}
                                        renderValue={SelectizeUtils.selectizeRenderValue}
                                        onBlur={this.validateForm}
                                        required
                                    />
                                </div>
                            </div>
                            <Input
                                name="amount"
                                data-eusko="bank-deposit-amount"
                                value=""
                                label={__("Montant")}
                                type="number"
                                placeholder={__("Montant du dépôt")}
                                validations="isPostiveNumeric"
                                validationErrors={{
                                    isPostiveNumeric: __("Montant invalide.")
                                }}
                                rowClassName={divCustomAmountClass}
                                elementWrapperClassName={[{'col-sm-9': false}, 'col-sm-8']}
                                required
                            />
                            <div className="form-group row">
                                <label
                                    className="control-label col-sm-3"
                                    data-required="true"
                                    htmlFor="bank-deposit-deposit_amount">
                                    {__("Montant calculé")}
                                    <span className="required-symbol">&nbsp;*</span>
                                </label>
                                <div className="col-sm-8 bank-deposit" data-eusko="bank-deposit-deposit_bank">
                                    <span className="deposit-amount-span">
                                        {this.state.depositAmount}
                                    </span>
                                </div>
                            </div>
                        </fieldset>
                        <fieldset>
                            <Row layout="horizontal">
                                <input
                                    name="submit"
                                    data-eusko="bank-deposit-submit"
                                    type="submit"
                                    defaultValue={__("Enregistrer")}
                                    className="btn btn-success"
                                    formNoValidate={true}
                                    disabled={!this.state.canSubmit}
                                />
                            </Row>
                        </fieldset>
                    </BankDepositForm>
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


ReactDOM.render(
    <BankDepositPage />,
    document.getElementById('bank-deposit')
)

ReactDOM.render(
    <NavbarTitle title={__("Dépot en banque")} />,
    document.getElementById('navbar-title')
)