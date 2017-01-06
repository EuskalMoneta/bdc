import {
    Modal,
    ModalHeader,
    ModalTitle,
    ModalClose,
    ModalBody,
    ModalFooter
} from 'react-modal-bootstrap'

export default class ModalEusko extends React.Component {
    constructor(props) {
        super(props);

        // Compute body (from props with labels and user data)
        var modalBody = this.props.modalBody

        this.state = this.props
    }

    computeModalBody(modalBody) {
        return _.map(modalBody, (item) => {
            return (<div className="form-group row" key={item.label}>
                        <label className="col-sm-3">{item.label} :</label>
                        <div className="col-sm-6">
                            <span>{item.value}</span>
                        </div>
                    </div>)
        })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps) {
            // We need to do this because nextProps is read-only...
            var newProps = _.mapObject(nextProps, (item) => { return item })

            // Compute modalBody from new prop
            newProps.modalBody = this.computeModalBody(newProps.modalBody)

            // Display modalBody
            this.setState(newProps)
        }
    }

    hideModal() {
        this.setState({isModalOpen: false})
    }

    onValidate() {
        this.setState({isModalOpen: false}, this.props.onValidate)
    }

    render() {
        return (
            <Modal isOpen={this.state.isModalOpen} onRequestHide={this.hideModal.bind(this)}>
                <ModalHeader>
                    <ModalClose onClick={this.hideModal.bind(this)}/>
                    <ModalTitle>{this.props.modalTitle}</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <div>{this.state.modalBody}</div>
                </ModalBody>
                <ModalFooter>
                    <button className="btn btn-default" onClick={this.hideModal.bind(this)}>
                      {this.props.cancelLabel}
                    </button>
                    <button onClick={this.onValidate.bind(this)} className="btn btn-success">
                      {this.props.validateLabel}
                    </button>
                </ModalFooter>
            </Modal>
        )
    }
}

// Specifies the default values and type checking for props
ModalEusko.defaultProps = {
    cancelLabel: __("Annuler"),
    validateLabel: __("Valider"),
    modalTitle: __("Confirmation")
}

ModalEusko.propTypes = {
    onValidate: React.PropTypes.func.isRequired,
    isModalOpen: React.PropTypes.bool.isRequired,
    modalBody: React.PropTypes.array
}
