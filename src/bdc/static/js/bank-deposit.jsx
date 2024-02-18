import {
    fetchAuth,
    getAPIBaseURL,
    isPositiveInteger,
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

Formsy.addValidationRule('isPositiveInteger', isPositiveInteger)

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
            historyTableInitData: undefined,
            historyTableData: undefined,
            historyTableSelectedIds: Array(),
            historyTableSelectedRows: Array(),
            currentAmount: undefined,
            currentNumberCheques: undefined,
            paymentModeList: undefined,
            depositBankList: undefined,
            depositBank: undefined,
            depositAmount: "",
            depositCalculatedAmount: Number(0),
            displayWarningPlusDifference: false,
            displayWarningMinusDifference: false,
            amountDifference: undefined,
            bordereau: undefined,
            disableBordereau: false,
            displayCustomAmount: false,
        }
    },

    componentDidMount() {
        // Get payment_modes
        var computePaymentModes = (paymentModes) => {
            // 'Euro-LIQ'
            // 'Euro-CHQ'
            // 'Eusko-LIQ' <- We don't want the eusko payment mode in this page.
            this.setState({paymentModeList: _.chain(paymentModes)
                           .filter((item) => { return item.value.toLowerCase().indexOf("eusko") === -1 })
                           .sortBy((item) => { return item.label })
                           .value()
                           })
        }
        fetchAuth(getAPIBaseURL + "payment-modes/", 'get', computePaymentModes)

        // Get depositBankList
        var computeBankDepositList = (depositBankList) => {
            this.setState({depositBankList: _.sortBy(depositBankList, (item) => { return item.label })})
        }
        fetchAuth(getAPIBaseURL + "deposit-banks/", 'get', computeBankDepositList)

        // Get historyTableData
        var computeHistoryTableData = (historyTableData) => {
            this.setState({historyTableData: historyTableData.result.pageItems,
                           historyTableInitData: historyTableData.result.pageItems}, this.computeAmount)
        }
        fetchAuth(getAPIBaseURL +
                  "accounts-history/?account_type=caisse_euro_bdc&" +
                  "filter=a_remettre_a_euskal_moneta&" +
                  "direction=CREDIT",
                  'get', computeHistoryTableData)
    },

    // paymentMode
    paymentModeOnValueChange(item) {
        this.setState({paymentMode: item, depositAmount: ""}, this.validateForm)

        // Display custom amount field ?
        if (item && item.value.toLowerCase() === 'euro-liq')
            this.setState({displayCustomAmount: true})
        else
            this.setState({displayCustomAmount: false,
                           depositAmount: "",
                           displayWarningPlusDifference: false,
                           displayWarningMinusDifference: false})

        // Filter historyTableData according to new payment mode
        if (item)
        {
            var historyTableData = _.filter(this.state.historyTableInitData,
                (i) => {
                    // Firstly, I need to verify if i.customValues.field.internalName == "mode_de_paiement"
                    // If this is true, I have to verify that the field id == item.cyclos_id (which is the payment mode cyclos id)

                    // Some items like "Espèces non déposées" does not have customValues
                    if (! _.isEmpty(i.customValues)) {
                        // This var is needed because the function inside _.filter only knows its parent scope
                        var item_cyclos_id = item.cyclos_id

                        var res = _.filter(
                            i.customValues,
                                (j) => {
                                    if (j.field.internalName == 'mode_de_paiement') {
                                        return j.enumeratedValue.id == item_cyclos_id
                                    }
                                    else {
                                        return false
                                    }
                                }
                        )
                    }
                    else {
                        if (item.value === "Euro-LIQ" &&
                            i.type.internalName === "banque_de_depot.paiement_de_banque_de_depot_vers_caisse_euro_bdc") {
                            var res = i
                        }
                    }

                    if (_.isEmpty(res)) {
                        return false
                    }
                    else {
                        return true
                    }
                })

            // deselect all lines
            this.onSelectTableAll(false, null)
            this.setState({historyTableData: historyTableData}, this.computeAmount)
        }
        else {
            // deselect all lines
            this.onSelectTableAll(false, null)
            this.setState({historyTableData: this.state.historyTableInitData}, this.computeAmount)
        }
    },

    computeAmount() {
        var currentAmount = {balance: Number(0), currency: '€'}
        currentAmount.balance = _.reduce(
            this.state.historyTableData,
            (memo, row) => {
                return memo + Number(row.amount)
            }, Number(0))

        if (this.state.paymentMode &&
            this.state.paymentMode.value.toLowerCase() === 'euro-chq' &&
            this.state.historyTableData)
        {
            currentNumberCheques = _.reduce(
            this.state.historyTableData,
            (memo, row) => {
                return memo + Number(row)
            }, Number(0))
            this.setState({currentNumberCheques: currentNumberCheques})
        }
        else {
            this.setState({currentNumberCheques: undefined})
        }

        this.setState({currentAmount: currentAmount})
    },

    // depositBank
    depositBankOnValueChange(item) {
        this.setState({depositBank: item}, this.validateForm)
    },

    depositAmountOnBlur() {
        if (this.state.displayCustomAmount && this.state.depositCalculatedAmount != Number(0))
        {
            var numDepositAmount = Number(this.state.depositAmount)
            var numDepositCalculatedAmount = Number(this.state.depositCalculatedAmount)
            var diff = numDepositAmount - numDepositCalculatedAmount

            if ((numDepositAmount === numDepositCalculatedAmount) || !isPositiveInteger(null, this.state.depositAmount)) {
                this.setState({displayWarningPlusDifference: false,
                               displayWarningMinusDifference: false},
                              this.validateForm)
            }
            else {
                if (numDepositAmount > numDepositCalculatedAmount) {
                    this.setState({displayWarningPlusDifference: true,
                                   displayWarningMinusDifference: false,
                                   amountDifference: diff},
                                  this.validateForm)
                }
                else {
                    this.setState({displayWarningPlusDifference: false,
                                   displayWarningMinusDifference: true,
                                   amountDifference: diff},
                                  this.validateForm)
                }
            }
        }
        else {
            this.setState({displayWarningPlusDifference: false,
                           displayWarningMinusDifference: false},
                          this.validateForm)
        }
    },

    onFormChange(event, value) {
        this.setState({[event]: value}, this.depositAmountOnBlur)
    },

    onSelectTableRow(row, isSelected, event) {
        var baseNumber = Number(this.state.depositCalculatedAmount)
        var historyTableSelectedRows = this.state.historyTableSelectedRows
        var nbCheques =  Number(this.state.currentNumberCheques)

        if (Number.isNaN(baseNumber))
            var baseNumber = Number(0)

        if (isSelected) {
            if (this.state.paymentMode &&
            this.state.paymentMode.value.toLowerCase() === 'euro-chq' &&
            this.state.historyTableData)
            { nbCheques ++ }
            else 
            { nbCheques = undefined }
            historyTableSelectedRows.push(row)
            this.setState({depositCalculatedAmount: baseNumber + Number(row.amount),
                           historyTableSelectedIds: _.pluck(historyTableSelectedRows, 'id'),
                           historyTableSelectedRows: historyTableSelectedRows,
                           currentNumberCheques: nbCheques },
                          this.depositAmountOnBlur)
        }
        else {
            if (this.state.paymentMode &&
            this.state.paymentMode.value.toLowerCase() === 'euro-chq' &&
            this.state.historyTableData)
            { nbCheques -- }
            else 
            { nbCheques = undefined }
            var rows = _.filter(historyTableSelectedRows,
                (item) => {
                    if (row != item)
                        return item
                }
            )

            this.setState({depositCalculatedAmount: baseNumber - Number(row.amount),
                           historyTableSelectedIds: _.pluck(rows, 'id'),
                           historyTableSelectedRows: rows,
                           currentNumberCheques: nbCheques },
                          this.depositAmountOnBlur)
        }
    },

    onSelectTableAll(isSelected, rows) {
        var nbCheques =  Number(this.state.currentNumberCheques)
        if (isSelected) {
            if (this.state.paymentMode &&
            this.state.paymentMode.value.toLowerCase() === 'euro-chq' &&
            this.state.historyTableData)
            {
                nbCheques = _.reduce(rows, (memo, row) => { return memo + 1}, Number(0))
            }
            else { nbCheques = undefined }



            this.setState({depositCalculatedAmount: _.reduce(rows,
                                (memo, row) => {
                                    return memo + Number(row.amount)
                                }, Number(0)),
                           currentNumberCheques: nbCheques,
                           historyTableSelectedIds: _.pluck(rows, 'id'),
                           historyTableSelectedRows: rows},
                          this.depositAmountOnBlur)
        }
        else {
            if (this.state.paymentMode &&
            this.state.paymentMode.value.toLowerCase() === 'euro-chq' &&
            this.state.historyTableData)
            {
                nbCheques = Number(0)
            }
            else { nbCheques = undefined }
            this.setState({depositCalculatedAmount: Number(0),
                           currentNumberCheques: nbCheques,
                           historyTableSelectedIds: Array(),
                           historyTableSelectedRows: Array()},
                          this.depositAmountOnBlur)
        }
    },

    enableButton() {
        this.setState({canSubmit: true})
    },

    disableButton() {
        this.setState({canSubmit: false})
    },

    validateForm() {
        if (this.state.paymentMode &&
            this.state.depositBank &&
            this.state.depositCalculatedAmount != Number(0) &&
            (!this.state.displayCustomAmount ||
                this.state.displayCustomAmount &&
                isPositiveInteger(null, this.state.depositAmount)) &&
            (this.state.disableBordereau ||
                !this.state.disableBordereau &&
                this.state.bordereau)
        ) {
            this.enableButton()
        }
        else
            this.disableButton()
    },

    submitForm(data) {
        this.disableButton()

        var postData = {}
        postData.login_bdc = window.config.userName
        postData.payment_mode = this.state.paymentMode.cyclos_id
        postData.payment_mode_name = this.state.paymentMode.label
        postData.deposit_bank = this.state.depositBank.value
        postData.deposit_bank_name = this.state.depositBank.label
        postData.deposit_calculated_amount = this.state.depositCalculatedAmount
        postData.deposit_amount = this.state.depositAmount
        postData.disable_bordereau = this.state.disableBordereau
        postData.bordereau = this.state.bordereau
        postData.selected_payments = this.state.historyTableSelectedRows

        if (this.state.paymentMode.value == 'Euro-CHQ')
            postData.deposit_amount = this.state.depositCalculatedAmount

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

            setTimeout(() => window.location.assign("/manager/history/caisse-euro"), 3000)
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
        fetchAuth(this.props.url, this.props.method, computeForm, postData, promiseError)
    },

    render() {
        // Should we display customAmount field
        var divCustomAmountClass = classNames({
            'form-group row': true,
            'hidden': !this.state.displayCustomAmount,
        })


        // Display current amount information
        if (this.state.currentAmount) {
            var currentAmountLabel = this.state.currentAmount.balance + " " + this.state.currentAmount.currency
        }
        else
            var currentAmountLabel = null

        if (this.state.currentNumberCheques != undefined) {
            var divNumberCheques = (
                <div className="form-group row">
                    <label
                        className="control-label col-sm-3"
                        htmlFor="bank-deposit-deposit_amount">
                        {__("Nombre de chèques") + ": "}
                    </label>
                    <div className="col-sm-8 bank-deposit deposit-amount-div" data-eusko="bank-deposit-deposit_bank">
                        <span className="deposit-amount-span">
                            {this.state.currentNumberCheques}
                        </span>
                    </div>
                </div>
            )
        }
        else {
            var divNumberCheques = null
        }

        var statusRow = (
            <div>
                <div className="row margin-bottom">
                    <div className="col-md-2 col-sm-4">
                        <span className="col-md-12 amount-history-label">
                            {__("Montant total") + ": "}
                            <span className="font-weight-normal">
                                {currentAmountLabel}
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        )

        const selectRowProp = {
            mode: 'checkbox',
            clickToSelect: true,
            onSelect: this.onSelectTableRow,
            onSelectAll: this.onSelectTableAll,
            selected: this.state.historyTableSelectedIds
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
                    <TableHeaderColumn columnClassName="line-break" dataField="description">{__("Libellé")}</TableHeaderColumn>
                    <TableHeaderColumn dataField="amount" dataFormat={amountFormatter}>{__("Montant")}</TableHeaderColumn>
                </BootstrapTable>
            )
        }
        else
            var dataTable = null;

        // Warning message amount difference
        var warningCustomAmountDifference = null

        if (this.state.displayWarningPlusDifference) {
            var tmpMessage = __('Attention, il y a %%% € de trop dans le dépôt !')
            var warningCustomAmountDifferenceMessage = (
                tmpMessage.replace('%%%', this.state.amountDifference)
            )

            var warningCustomAmountDifference = (
                <div className="form-group row">
                    <div className="col-md-offset-2 col-md-8 alert alert-warning alert-deposit-amount-difference">
                       {warningCustomAmountDifferenceMessage}
                    </div>
                </div>
            )
        }
        else if (this.state.displayWarningMinusDifference) {
            var tmpMessage = __('Attention, il manque %%% € dans le dépôt !')
            var warningCustomAmountDifferenceMessage = (
                tmpMessage.replace('%%%', String(this.state.amountDifference).substring(1))
            )

            var warningCustomAmountDifference = (
                <div className="form-group row">
                    <div className="col-md-offset-2 col-md-8 alert alert-warning alert-deposit-amount-difference">
                       {warningCustomAmountDifferenceMessage}
                    </div>
                </div>
            )
        }

        return (
            <div className="row">
                <div className="col-md-3 history-form">
                    <div className="row"></div>
                    <BankDepositForm
                        onValidSubmit={this.submitForm}
                        onInvalidSubmit={this.submitForm}
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
                                        renderNoResultsFound={SelectizeUtils.selectizeNoResultsFound}
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
                                        renderNoResultsFound={SelectizeUtils.selectizeNoResultsFound}
                                        required
                                    />
                                </div>
                            </div>
                            <Input
                                name="depositAmount"
                                data-eusko="bank-deposit-depositAmount"
                                value={this.state.depositAmount ? this.state.depositAmount : ""}
                                label={__("Montant")}
                                type="number"
                                placeholder={__("Montant du dépôt")}
                                validations="isPositiveInteger"
                                validationErrors={{
                                    isPositiveInteger: __("Montant invalide.")
                                }}
                                onChange={this.onFormChange}
                                onBlur={this.depositAmountOnBlur}
                                rowClassName={divCustomAmountClass}
                                elementWrapperClassName={[{'col-sm-9': false}, 'col-sm-8']}
                                required={this.state.displayCustomAmount}
                                disabled={!this.state.displayCustomAmount}
                            />
                            {divNumberCheques}
                            <div className="form-group row">
                                <label
                                    className="control-label col-sm-3"
                                    htmlFor="bank-deposit-deposit_amount">
                                    {__("Montant calculé")}
                                </label>
                                <div className="col-sm-8 bank-deposit deposit-amount-div" data-eusko="bank-deposit-deposit_bank">
                                    <span className="deposit-amount-span">
                                        {this.state.depositCalculatedAmount + " €"}
                                    </span>
                                </div>
                            </div>
                            {warningCustomAmountDifference}
                            <Input
                                name="bordereau"
                                data-eusko="bank-deposit-bordereau"
                                value=""
                                label={__("Bordereau")}
                                type="text"
                                placeholder={__("N° du bordereau de remise")}
                                validations="isExisty"
                                validationErrors={{
                                    isExisty: __("N° bordereau invalide.")
                                }}
                                disabled={this.state.disableBordereau}
                                required={!this.state.disableBordereau}
                                onChange={this.onFormChange}
                                elementWrapperClassName={[{'col-sm-9': false}, 'col-sm-8']}
                            />
                            <Checkbox
                                name="disableBordereau"
                                data-eusko="bank-deposit-noBordereau"
                                value=""
                                label={__("Je ne connais pas le n° du bordereau")}
                                onChange={this.onFormChange}
                                rowLabel=""
                            />
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
                    {statusRow}
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
    <BankDepositPage url={getAPIBaseURL + "bank-deposit/"} method="POST" />,
    document.getElementById('bank-deposit')
)

ReactDOM.render(
    <NavbarTitle title={__("Dépot en banque")} />,
    document.getElementById('navbar-title')
)
