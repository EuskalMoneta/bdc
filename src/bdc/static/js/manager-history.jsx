import {
    fetchAuth,
    getAPIBaseURL,
    NavbarTitle,
    SelectizeUtils,
    getCurrentLang
} from 'Utils'

import {
    BootstrapTable,
    TableHeaderColumn
} from 'react-bootstrap-table'
import 'node_modules/react-bootstrap-table/dist/react-bootstrap-table.min.css'

var ManagerHistoryPage = React.createClass({

    getInitialState() {
        return {
            accountName: document.getElementById("account_name").value,
            historyList: undefined,
            currentSolde: undefined
        }
    },

    componentDidMount() {
        // Get Accounts summaries
        var computeHistoryData = (data) => {
            this.setState(
                { currentSolde: _.filter(data, (item) => { return item.type.id == this.props.mode })[0] },

                // WARNING: This looks ugly at first, but this is essential !
                // this function below is a callback function for setState() because it is asynchronous...
                // setState() does not immediately mutate this.state but creates a pending state transition
                // See Notes: https://facebook.github.io/react/docs/component-api.html#setstate
                // We need to do this because we need the this.state.currentSolde to be set.
                () => {
                    var computeHistoryList = (historyList) => {
                        var res = _.map(historyList.result.pageItems,
                            (item, index, list) => {
                                var newItem = item

                                // Input data are strings,
                                // we need to cast it in a Number object to use the toFixed method.
                                if (index === 0)
                                    newItem.solde = Number(this.state.currentSolde.balance)
                                else
                                    newItem.solde = Number(list[index-1].solde) - Number(list[index-1].amount)

                                newItem.solde = newItem.solde.toFixed(2)
                                return newItem
                            }
                        );

                        this.setState({historyList: res});
                    };

                    // Get account history
                    fetchAuth(getAPIBaseURL + "accounts-history/?account_type=" + this.props.mode, 'get', computeHistoryList)
                });
        }
        fetchAuth(getAPIBaseURL + "accounts-summaries/", 'get', computeHistoryData)
    },

    render() {
        // Display current solde information
        if (this.state.currentSolde) {
            var currentSoldeLabel = (
                <span className="solde-history-span">
                    {this.state.currentSolde.balance + " " + this.state.currentSolde.currency}
                </span>
            )
        }
        else
            var currentSoldeLabel = null

        // Which buttons we need to display before the table
        if (this.props.mode == 'stock_de_billets_bdc') {
            var actionButtons = (
                <div className="row margin-bottom">
                    <div className="col-md-offset-2 col-md-2 col-sm-4">
                        <a href="/manager/entree-stock" className="btn btn-info">{__("Entrée")}</a>
                    </div>
                    <div className="col-md-offset-1 col-md-2 col-sm-4">
                        <a href="/manager/sortie-stock" className="btn btn-default">{__("Sortie")}</a>
                    </div>
                    <div className="col-md-offset-1 col-md-2 col-sm-4">
                        <label className="control-label col-md-12 solde-history-label">
                            {__("Solde") + ": "}
                            {currentSoldeLabel}
                        </label>
                    </div>
                </div>
            )
        }
        else if (this.props.mode == 'caisse_euro_bdc') {
            var actionButtons = (
                <div className="row margin-bottom">
                    <div className="col-md-offset-2 col-md-2 col-sm-4">
                        <a href="/manager/bank-deposit" className="btn btn-info">{__("Dépôt en banque")}</a>
                    </div>
                    <div className="col-md-offset-1 col-md-2 col-sm-4">
                        <a href="/manager/cash-deposit" className="btn btn-default">{__("Remise de monnaie à Euskal Moneta")}</a>
                    </div>
                    <div className="col-md-offset-1 col-md-2 col-sm-4">
                        <label className="control-label col-md-12 solde-history-label">
                            {__("Solde") + ": "}
                            {currentSoldeLabel}
                        </label>
                    </div>
                </div>
            )
        }
        else if (this.props.mode == 'caisse_eusko_bdc') {
            var actionButtons = (
                <div className="row margin-bottom">
                    <div className="col-md-offset-2 col-md-2 col-sm-4">
                        <a href="/manager/sortie-caisse-eusko" className="btn btn-info">{__("Sortie")}</a>
                    </div>
                    <div className="col-md-offset-1 col-md-2 col-sm-4">
                        <label className="control-label col-md-12 solde-history-label">
                            {__("Solde") + ": "}
                            {currentSoldeLabel}
                        </label>
                    </div>
                </div>
            )
        }
        else if (this.props.mode == 'retours_d_eusko_bdc') {
            var actionButtons = (
                <div className="row margin-bottom">
                    <div className="col-md-offset-2 col-md-2 col-sm-4">
                        <a href="/manager/sortie-retour-eusko" className="btn btn-info">{__("Sortie")}</a>
                    </div>
                    <div className="col-md-offset-1 col-md-2 col-sm-4">
                        <label className="control-label col-md-12 solde-history-label">
                            {__("Solde") + ": "}
                            {currentSoldeLabel}
                        </label>
                    </div>
                </div>
            )
        }

        // History data table
        if (this.state.historyList) {
            var dateFormatter = (cell, row) => {
                // Force moment i18n
                moment.locale(getCurrentLang)
                return moment(cell).format('DD/MM/YYYY HH:mm')
            }

            var amountFormatter = (cell, row) => {
                // Cell is a string for now,
                // we need to cast it in a Number object to use the toFixed method.
                return Number(cell).toFixed(2)
            }

            var historyTable = (
                <BootstrapTable
                 data={this.state.historyList} striped={true} hover={true} pagination={true}
                 selectRow={{mode: 'none'}} tableContainerClass="react-bs-table-account-history"
                 options={{noDataText: __("Pas d'historique à afficher."), hideSizePerPage: true, sizePerPage: 20}}
                 >
                    <TableHeaderColumn isKey={true} hidden={true} dataField="id">{__("ID")}</TableHeaderColumn>
                    <TableHeaderColumn dataField="date" dataFormat={dateFormatter}>{__("Date")}</TableHeaderColumn>
                    <TableHeaderColumn columnClassName="line-break" dataField="description">{__("Libellé")}</TableHeaderColumn>
                    <TableHeaderColumn dataField="amount" dataFormat={amountFormatter}>{__("Montant")}</TableHeaderColumn>
                </BootstrapTable>
            )
        }
        else
            var historyTable = null;

        return (
            <div className="row">
                <div className="col-md-10">
                    {actionButtons}
                    <div className="row margin-right">
                        <div className="col-md-12 col-md-offset-1">
                            {historyTable}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
})

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