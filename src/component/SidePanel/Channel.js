import React from 'react';
import { Menu, Icon, Modal, Form, Input, Button } from 'semantic-ui-react';

class Channel extends React.Component {

  state = {
    channels: [],
    modal: false,
    channelName: '',
    channelDetails: ''
  };

  closeModal = () => this.setState({ modal: false});

  handleChange = event => this.setState({ [event.target.name]: event.target.value});

  openModal = event => this.setState({ modal: true});

  render() {
    const { channels, modal } = this.state;

    return (
      <React.Fragment>
        <Menu.Menu style={{ paddingBottom: '2em' }}>
          <Menu.Item>
            <span> <Icon name="exchange" /> {"CHANNELS "} </span>
            ({ channels.length }) <Icon name="add" onClick={this.openModal} />
          </Menu.Item>
        </Menu.Menu>
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Add a channel</Modal.Header>
          <Modal.Content>
            <Form>
              <Form.Field>
                <Input fluid label="Name of channel" name="channelName" onChange={this.handleChange} />
              </Form.Field>
              <Form.Field>
                <Input fluid label="About channel" name="channelDetails" onChange={this.handleChange} />
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.openModal}>
              <Icon name="checkmark"/> Add
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove"/> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </React.Fragment>
    );
  }
}

export default Channel;

