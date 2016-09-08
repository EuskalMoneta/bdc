import {
    fetchAuth,
    titleCase,
    getAPIBaseURL,
    NavbarTitle
} from 'Utils'


const MemberShow = React.createClass({

    componentWillMount() {
        this.state = {
            memberID: document.getElementById("member_id").value,
            member: undefined
        }

        // Get member data
        var computeMemberData = (member) => {
            this.setState({member: member})
        }
        fetchAuth(this.props.url + this.state.memberID + '/', 'get', computeMemberData)
    },

    render() {
        if (this.state.member) {
            // Whether or not, we have a up-to-date member subscription
            if (moment.unix(this.state.member.datefin) > moment()) {
                var memberStatus = (
                    <span className="label label-success member-show-statut"
                          data-eusko="member-show-statut">
                        {__("À jour")}
                    </span>
                )

                var memberStatusUpToDate = true
            }
            else {
                var memberStatus = (
                    <span className="label label-warning member-show-statut"
                          data-eusko="member-show-statut">
                        {__("Pas à jour")}
                    </span>
                )

                var memberStatusUpToDate = false
            }

            // Whether or not, we have a business member or a individual
            if (this.state.member.login.startsWith("Z", 0)) {
                // We have a business member

                var memberName = (
                    <div className="col-sm-4">
                        <span className="member-show-societe">{this.state.member.societe}</span>
                    </div>
                )

                // Whether or not, we have a up-to-date member subscription
                // "Change"
                // "Reconversion" (bouton primaire)
                if (memberStatusUpToDate) {
                    var memberActions = (
                        <div className="row member-show-div-margin-left">
                            <a href={"/members/change/euro-eusko/" + this.state.member.id}
                               className="btn btn-default">
                               {__("Change")}
                            </a>
                            <a className="btn btn-info col-sm-offset-1">{__("Reconversion")}</a>
                        </div>
                    )
                }
                // aucune opération n'est accessible
                else {
                    var memberActions = (
                        <div className="row">
                        </div>
                    )
                }
            }
            else {
                // We have a individual member
                var memberName = (
                    <div className="col-sm-4" >
                        <span className="member-show-civility">{titleCase(this.state.member.civility_id) + " "}</span>
                        <span data-eusko="member-show-fullname">
                            {this.state.member.firstname + " " + this.state.member.lastname}
                        </span>
                    </div>
                )

                // Whether or not, we have a up-to-date member subscription
                // "Change" (bouton primaire)
                // "Cotisation"
                if (memberStatusUpToDate) {
                    var memberActions = (
                        <div className="row member-show-div-margin-left">
                            <a href={"/members/change/euro-eusko/" + this.state.member.id}
                               className="btn btn-info">
                               {__("Change")}
                            </a>
                            <a href={"/members/subscription/add/" + this.state.member.id}
                               className="btn btn-default col-sm-offset-1">
                                {__("Cotisation")}
                            </a>
                        </div>
                    )
                }
                // "Cotisation" (bouton primaire)
                else {
                    var memberActions = (
                        <div className="row member-show-div-margin-left">
                            <a href={"/members/subscription/add/" + this.state.member.id} className="btn btn-info">
                                {__("Cotisation")}
                            </a>
                        </div>
                    )
                }
            }

            if (this.state.member.address)
                var memberAddress = (
                    <span data-eusko="member-show-address">
                        {this.state.member.address + "  ―  " + this.state.member.zip + " " + this.state.member.town}
                    </span>
                )
            else
                var memberAddress = (
                    <span data-eusko="member-show-address">
                        {this.state.member.zip + " " + this.state.member.town}
                    </span>
                )

            var memberData = (
                <div className="row">
                    <div className="panel panel-primary member-show-panel">
                        <div className="panel-body">
                            <div className="form-group row">
                                <label className="control-label col-sm-2">{__("N° Adhérent")}</label>
                                <div className="col-sm-4">
                                    <span data-eusko="member-show-login">{this.state.member.login}</span>
                                </div>
                                <div className="col-sm-6">
                                    {memberStatus}
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="control-label col-sm-2">{__("Nom complet")}</label>
                                {memberName}
                                <div className="col-sm-6">
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="control-label col-sm-2">{__("Adresse postale")}</label>
                                <div className="col-sm-8" >
                                    {memberAddress}
                                </div>
                            </div>
                        </div>
                    </div>
                    {memberActions}
                </div>
            )
        }
        else
            var memberData = null

        return memberData
    }
})


ReactDOM.render(
    <MemberShow url={getAPIBaseURL + "members/"} method="GET" />,
    document.getElementById('member-show')
)

ReactDOM.render(
    <NavbarTitle title={__("Fiche adhérent")} />,
    document.getElementById('navbar-title')
)