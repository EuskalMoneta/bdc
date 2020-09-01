import {
    fetchAuth,
    titleCase,
    getAPIBaseURL,
    NavbarTitle,
    getCurrentLang,
} from 'Utils'


const MemberShow = React.createClass({

    componentWillMount() {
        this.state = {
            hasAcceptedCGU: false,
            memberID: document.getElementById("member_id").value,
            member: undefined,
        }

        // Get member data
        var computeMemberData = (member) => {
            var hasAcceptedCGU = member.array_options.options_accepte_cgu_eusko_numerique ? true : false
            this.setState({member: member, hasAcceptedCGU: hasAcceptedCGU})
        }
        fetchAuth(this.props.url + this.state.memberID + '/', 'get', computeMemberData)
    },

    render() {
        var memberData = null
        if (!this.state.member) {
            return null
        }
        moment.locale(getCurrentLang)
        var dateEndSub = moment.unix(this.state.member.datefin).format('DD MMMM YYYY');

        // Whether or not, we have an up-to-date member subscription
        if (moment.unix(this.state.member.datefin) > moment()) {
            var memberStatus = (
                <div className="font-member-status">
                    <span className="glyphicon glyphicon-ok member-status-ok"></span>
                    <span className="member-status-text" data-eusko="member-show-status">
                        {__("À jour")}
                    </span>
                    <span className="member-status-date">({dateEndSub})</span>
                </div>
            )

            var memberStatusUpToDate = true
        }
        else {
            var memberStatus = (
                <div className="font-member-status">
                    <span className="glyphicon glyphicon-remove member-status-nok"></span>
                    <span className="member-status-text" data-eusko="member-show-status">
                        {__("Pas à jour")}
                    </span>
                    <span className="member-status-date">({dateEndSub})</span>
                </div>
            )

            var memberStatusUpToDate = false
        }

        // Whether or not, we have a business member or a individual
        if (this.state.member.type.toLowerCase() != 'particulier'
           && this.state.member.type.toLowerCase() != 'touriste') {
            // We have a business member

            var memberName = (
                <div className="col-sm-4">
                    <span className="member-show-societe">
                        {this.state.member.company}
                    </span>
                </div>
            )

            // Whether or not, we have a up-to-date member subscription
            if (memberStatusUpToDate)
            {
                var changeNumerique = null
                var memberActionDepotCompte = null
                var memberActionRetraitCompte = null
            
                if (this.state.hasAcceptedCGU) {
                    var changeNumerique = (
                        <a href={"/members/change/euro-eusko-numeriques/" + this.state.member.id}
                           className="btn btn-default col-sm-offset-1">
                           {__("Chargement du compte")}
                        </a>
                    )

                    var memberActionDepotCompte = (
                        <a href={"/members/depot-eusko-numerique/" + this.state.member.id}
                           className="btn btn-default">
                            {__("Dépôt d'eusko sur le compte")}
                        </a>
                    )

                    var memberActionRetraitCompte = (
                        <a href={"/members/retrait-eusko-numerique/" + this.state.member.id}
                           className="btn btn-default col-sm-offset-1">
                            {__("Retrait d'eusko du compte")}
                        </a>
                    )
                }

                var memberActions = (
                    <div>
                        <div className="row member-show-div-margin-left">
                            <a href={"/members/change/euro-eusko/" + this.state.member.id}
                               className="btn btn-default">
                               {__("Change billets")}
                            </a>
                            {' '}
                            {changeNumerique}
                            {' '}
                            <a href={"/members/reconversion/" + this.state.member.id}
                               className="btn btn-info col-sm-offset-1">
                               {__("Reconversion")}
                            </a>
                        </div>
                        <div className="row member-show-div-margin-left margin-top">
                            {memberActionDepotCompte}
                            {' '}
                            {memberActionRetraitCompte}
                        </div>
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
            if (memberStatusUpToDate)
            {
                var changeNumerique = null
                var memberActionRetraitCompte = null
                if (this.state.hasAcceptedCGU) {
                    var changeNumerique = (
                        <a href={"/members/change/euro-eusko-numeriques/" + this.state.member.id}
                           className="btn btn-default col-sm-offset-1">
                           {__("Chargement du compte")}
                        </a>
                    )

                    var memberActionRetraitCompte = (
                        <a href={"/members/retrait-eusko-numerique/" + this.state.member.id}
                           className="btn btn-default">
                            {__("Retrait d'eusko du compte")}
                        </a>
                    )
                }

                var memberActions = (
                    <div>
                        <div className="row member-show-div-margin-left">
                            <a href={"/members/change/euro-eusko/" + this.state.member.id}
                               className="btn btn-info">
                               {__("Change billets")}
                            </a>
                            {' '}
                            {changeNumerique}
                            {' '}
                            <a href={"/members/subscription/add/" + this.state.member.id}
                               className="btn btn-default col-sm-offset-1">
                                {__("Cotisation")}
                            </a>
                        </div>
                        <div className="row member-show-div-margin-left margin-top">
                            {memberActionRetraitCompte}
                        </div>
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

        if (this.state.member.address) {
            var memberAddress = (
                <span data-eusko="member-show-address">
                    {this.state.member.address + "  ―  " + this.state.member.zip + " " + this.state.member.town}
                </span>
            )
        }
        else {
            var memberAddress = (
                <span data-eusko="member-show-address">
                    {this.state.member.zip + " " + this.state.member.town}
                </span>
            )
        }

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
                            <label className="control-label col-sm-2">{__("Nom")}</label>
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
