import {
    Modal,
    ModalHeader,
    ModalTitle,
    ModalClose,
    ModalBody,
    ModalFooter
} from 'react-modal-bootstrap'

class ModalEusko extends React.Component {
    constructor(props) {
        super(props);

        // Compute body (from props with labels and user data)
        var modalBody = this.props.modalBody

        this.state = {
            isModalOpen: false,
            modalBody: modalBody,
            cancelLabel: this.props.cancelLabel,
            validateLabel: this.props.validateLabel
        }
    }

    openModal() {
        this.setState({isModalOpen: true})
    }

    hideModal() {
        this.setState({isModalOpen: false})
    }

    render() {
        return (
            <Modal isOpen={this.state.isModalOpen} onRequestHide={this.hideModal}>
                <ModalHeader>
                    <ModalClose onClick={this.hideModal}/>
                    <ModalTitle>{this.props.modalTitle}</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <p>{this.state.modalBody}</p>
                </ModalBody>
                <ModalFooter>
                    <button className="btn btn-default" onClick={this.hideModal}>
                      {this.props.cancelLabel}
                    </button>
                    <button onClick={this.handleDeleteBDC} className="btn btn-danger">
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
    validateLabel: __("Valider")
}

ModalEusko.propTypes = {
    modalBody: React.PropTypes.element.isRequired,
    modalTitle: React.PropTypes.element.isRequired
}


export default ModalEusko;