import {
    fetchAuth,
    getAPIBaseURL,
    NavbarTitle
} from 'Utils'

class Manager extends React.Component {
    constructor(props) {
        super(props)


        // Default state
        this.state = {
            stockBilletsData: undefined,
            caisseEuroData: undefined,
            caisseEuskoData: undefined,
            retourEuskoData: undefined,
        }

        // Get Accounts Summaries:
        // Stock de billets: stock_de_billets_bdc
        // Caisse euros: caisse_euro_bdc
        // Caisse eusko: caisse_eusko_bdc
        // Retour eusko: retours_d_eusko_bdc
        var computeManagerData = (data) => {
            this.setState({
                stockBilletsData: _.filter(data, (item) => { return item.type.id == "stock_de_billets_bdc" })[0],
                caisseEuroData: _.filter(data, (item) => { return item.type.id == "caisse_euro_bdc" })[0],
                caisseEuskoData: _.filter(data, (item) => { return item.type.id == "caisse_eusko_bdc" })[0],
                retourEuskoData: _.filter(data, (item) => { return item.type.id == "retours_d_eusko_bdc" })[0]
            })
        }
        fetchAuth(getAPIBaseURL + "accounts-summaries/", 'get', computeManagerData)
    }

    render() {
        return (
            <div className="col-md-10">
                <StockBillets data={this.state.stockBilletsData} />
                <CaisseEuro data={this.state.caisseEuroData} />
                <CaisseEusko data={this.state.caisseEuskoData} />
                <RetourEusko data={this.state.retourEuskoData} />
            </div>
        )
    }
}

var StockBillets = React.createClass({
    getInitialState() {
        return {
            balance: '',
            currency: '',
        }
    },

    componentWillReceiveProps(nextProps) {
        if (nextProps.data) {
            this.setState({balance: nextProps.data.balance,
                           currency: nextProps.data.currency})
        }
    },

    render() {
        return (
            <div className="panel panel-info">
                <div className="panel-heading">
                    <h3 className="panel-title">{__("Stock de billets")}</h3>
                </div>
                <div className="panel-body">
                    <div className="row">
                        <div className="col-md-8 col-sm-4">
                            <label className="control-label col-md-3">{__("Solde")} :</label>&nbsp;
                            <span className="col-md-5">{this.state.balance + " " + this.state.currency}</span>
                        </div>
                        <div className="col-md-4">
                            <a className="btn btn-default">{__("Historique")}</a>
                        </div>
                    </div>
                    <div className="row margin-top">
                        <div className="col-md-offset-2 col-md-2 col-sm-4">
                            <a href="/entree-stock" className="btn btn-info">{__("Entrée")}</a>
                        </div>
                        <div className="col-md-offset-2 col-md-2 col-sm-4">
                            <a href="/sortie-stock" className="btn btn-default">{__("Sortie")}</a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})

var CaisseEuro = React.createClass({
    getInitialState() {
        return {
            balance: '',
            currency: '',
            cash: '',
            cheques: '',
        }
    },

    componentWillReceiveProps(nextProps) {
        if (nextProps.data) {
            this.setState({balance: nextProps.data.balance,
                           cash: '',
                           checks: '',
                           currency: nextProps.data.currency})
        }
    },

    render() {
        return (
            <div className="panel panel-info">
                <div className="panel-heading">
                    <h3 className="panel-title">{__("Caisse euros")}</h3>
                </div>
                <div className="panel-body">
                    <div className="row">
                        <div className="col-md-8 col-sm-4">
                            <label className="control-label col-md-3">{__("Solde")} :</label>&nbsp;
                            <span className="col-md-5">{this.state.balance + " " + this.state.currency}</span>
                        </div>
                        <div className="col-md-4">
                            <a className="btn btn-default">{__("Historique")}</a>
                        </div>
                    </div>
                     <div className="row">
                        <div className="col-md-8 col-sm-4">
                            <label className="control-label col-md-3">{__("Espèces")} :</label>&nbsp;
                            <span className="col-md-5">{this.state.cash + " " + this.state.currency}</span>
                        </div>
                    </div>
                    <div className="row margin-top">
                        <div className="col-md-8 col-sm-4">
                            <label className="control-label col-md-3">{__("Chèques")} :</label>&nbsp;
                            <span className="col-md-5">{this.state.cheques + " " + this.state.currency}</span>
                        </div>
                    </div>
                    <div className="row margin-top">
                        <div className="col-md-offset-2 col-md-2 col-sm-4">
                            <a className="btn btn-info">{__("Dépôt en banque")}</a>
                        </div>
                        <div className="col-md-offset-2 col-md-2 col-sm-4">
                            <a className="btn btn-default">{__("Remise d'espèces")}</a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})

var CaisseEusko = React.createClass({
    getInitialState() {
        return {
            balance: '',
            currency: '',
        }
    },

    componentWillReceiveProps(nextProps) {
        if (nextProps.data) {
            this.setState({balance: nextProps.data.balance,
                           currency: nextProps.data.currency})
        }
    },

    render() {
        return (
            <div className="panel panel-info">
                <div className="panel-heading">
                    <h3 className="panel-title">{__("Caisse eusko")}</h3>
                </div>
                <div className="panel-body">
                    <div className="row">
                        <div className="col-md-8 col-sm-4">
                            <label className="control-label col-md-3">{__("Solde")} :</label>&nbsp;
                            <span className="col-md-5">{this.state.balance + " " + this.state.currency}</span>
                        </div>
                        <div className="col-md-4">
                            <a className="btn btn-default">{__("Historique")}</a>
                        </div>
                    </div>
                    <div className="row margin-top">
                        <div className="col-md-offset-2 col-md-2 col-sm-4">
                            <a className="btn btn-info">{__("Sortie")}</a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})

var RetourEusko = React.createClass({
    getInitialState() {
        return {
            balance: '',
            currency: '',
        }
    },

    componentWillReceiveProps(nextProps) {
        if (nextProps.data) {
            this.setState({balance: nextProps.data.balance,
                           currency: nextProps.data.currency})
        }
    },

    render() {
        return (
            <div className="panel panel-info">
                <div className="panel-heading">
                    <h3 className="panel-title">{__("Retour eusko")}</h3>
                </div>
                <div className="panel-body">
                    <div className="row">
                        <div className="col-md-8 col-sm-4">
                            <label className="control-label col-md-3">{__("Solde")} :</label>&nbsp;
                            <span className="col-md-5">{this.state.balance + " " + this.state.currency}</span>
                        </div>
                        <div className="col-md-4">
                            <a className="btn btn-default">{__("Historique")}</a>
                        </div>
                    </div>
                    <div className="row margin-top">
                        <div className="col-md-offset-2 col-md-2 col-sm-4">
                            <a className="btn btn-info">{__("Sortie")}</a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})

ReactDOM.render(
    <Manager />,
    document.getElementById('manager')
)

ReactDOM.render(
    <NavbarTitle title={__("Gestion")} />,
    document.getElementById('navbar-title')
)