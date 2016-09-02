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
            data: undefined,
            stockBilletsData: undefined,
            caisseEuroData: undefined,
            caisseEuskoData: undefined,
            retourEuskoData: undefined,
        }

        // Get payment_modes
        var computeManagerData = (data) => {
            this.setState({data: data.result})

            this.setState({stockBilletsData:
                           _.filter(data.result,
                                    function(item){ return item.type.name == "Stock de billets BDC" })
                          })

            this.setState({caisseEuroData:
                           _.filter(data.result,
                                    function(item){ return item.type.name == "Caisse € BDC" })
                          })

            this.setState({caisseEuskoData:
                           _.filter(data.result,
                                    function(item){ return item.type.name == "Caisse eusko BDC" })
                          })

            this.setState({retourEuskoData:
                           _.filter(data.result,
                                    function(item){ return item.type.name == "Retours d'eusko BDC" })
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

class StockBillets extends React.Component {
    constructor(props) {
        super(props)


        // Default state
        this.state = {
            amount: this.props.data.balance,
            currency: this.props.data.currency.suffix
        }
    }

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
                            <span className="col-md-5">{this.state.amount + " " + this.state.currency}</span>
                        </div>
                        <div className="col-md-4">
                            <a className="btn btn-default">{__("Historique")}</a>
                        </div>
                    </div>
                    <div className="row margin-top">
                        <div className="col-md-offset-2 col-md-2 col-sm-4">
                            <a className="btn btn-info">{__("Entrée")}</a>
                        </div>
                        <div className="col-md-offset-2 col-md-2 col-sm-4">
                            <a className="btn btn-default">{__("Sortie")}</a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

class CaisseEuro extends React.Component {
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
                            <span className="col-md-5">1232 eusko</span>
                        </div>
                        <div className="col-md-4">
                            <a className="btn btn-default">{__("Historique")}</a>
                        </div>
                    </div>
                     <div className="row">
                        <div className="col-md-8 col-sm-4">
                            <label className="control-label col-md-3">{__("Espèces")} :</label>&nbsp;
                            <span className="col-md-5">742 €</span>
                        </div>
                    </div>
                    <div className="row margin-top">
                        <div className="col-md-8 col-sm-4">
                            <label className="control-label col-md-3">{__("Chèques")} :</label>&nbsp;
                            <span className="col-md-5">490 €</span>
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
}

class CaisseEusko extends React.Component {
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
                            <span className="col-md-5">13 eusko</span>
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
}

class RetourEusko extends React.Component {
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
                            <span className="col-md-5">128 eusko</span>
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
}

ReactDOM.render(
    <Manager />,
    document.getElementById('manager')
)

ReactDOM.render(
    <NavbarTitle title={__("Gestion")} />,
    document.getElementById('navbar-title')
)