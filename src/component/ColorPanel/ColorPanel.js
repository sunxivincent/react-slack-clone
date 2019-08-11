import React from 'react';
import { Sidebar, Menu, Divider, Button, Modal, Icon, Label, Segment } from 'semantic-ui-react';
import { SliderPicker } from 'react-color';
import firebase from '../../firebase';

class ColorPanel extends React.Component {
  state = {
    modal: false,
    primary: '',
    secondary: '',
    user: this.props.currentUser,
    usersRef: firebase.database().ref('users')
  };

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  handleChangePrimary = color => this.setState({ primary: color.hex });

  handleChangeSecondary = color => this.setState({ secondary: color.hex });

  handleSaveColors = () => {
    if (this.state.primary && this.state.secondary) {
      this.state.usersRef
        .child(`${this.state.user.uid}/colors`)
        .push()
        .update({
          primary: this.state.primary,
          secondary: this.state.secondary
        })
        .then(() =>{
          console.log('colors added');
          this.closeModal();
        })
        .catch(e => {
          console.error(e);
        })
    }
  };

  render() {
    const { modal, primary, secondary } = this.state;

    return (
      <Sidebar
        as={Menu}
        icon="labeled"
        inverted
        vertical
        visible
        width="very thin"
      >
        <Divider/>
        <Button icon="add" size="small" color="blue" onClick={this.openModal}/>
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header> Choose App color </Modal.Header>
          <Modal.Content>
            <Segment inverted>
              <Label content="primary color" />
              <SliderPicker color={primary} onChange={this.handleChangePrimary} />
            </Segment>

            <Segment inverted>
              <Label content="secondary color" />
              <SliderPicker color={secondary} onChange={this.handleChangeSecondary} />
            </Segment>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSaveColors}>
              <Icon name="checkmark"/> Save colors
            </Button>
            <Button color="red" inverted onClick={this.closeModal} >
              <Icon name="remove"/> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </Sidebar>
    );
  }
}

export default ColorPanel;