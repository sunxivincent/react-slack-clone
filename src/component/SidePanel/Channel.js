import React from 'react';
import { Menu, Icon, Modal, Form, Input, Button } from 'semantic-ui-react';
import firebase from '../../firebase';
import { connect } from 'react-redux';
import { setCurrentChannel} from "../../actions/index";

class Channel extends React.Component {

  state = {
    user: this.props.currentUser,
    channels: [],
    modal: false,
    channelName: '',
    channelDetails: '',
    channelsRef: firebase.database().ref('channels'),
    firstLoad: true,
    activeChannel: '',
  };

  closeModal = () => this.setState({ modal: false});

  handleChange = event => this.setState({ [event.target.name]: event.target.value});

  handleSubmit = event => {
    event.preventDefault();
    if (this.isFormValid(this.state)) {
      this.addChannel();
    }
  };

  isFormValid = ({ channelName, channelDetails }) => channelName && channelDetails;

  openModal = event => this.setState({ modal: true});

  addChannel = () => {
    const { channelsRef, channelName, channelDetails, user } = this.state;
    const key = channelsRef.push().key;
    const newChannel = {
      id: key,
      name: channelName,
      details: channelDetails,
      createdBy: {
        name: user.displayName,
        avatar: user.photoURL
      }
    };
    channelsRef
      .child(key)
      .update(newChannel)
      .then(() => {
        this.setState({ channelName: '', channelDetails: ''});
        this.closeModal();
      })
      .catch(error => {
        console.log(error);
      })
  };

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  addListeners = () => {
    let loadedChannels = [];
    this.state.channelsRef.on('child_added', snap => {
      loadedChannels.push(snap.val());
      this.setState({ channels: loadedChannels }, () => this.setFirstChannel());
    })
  };

  removeListeners = () => {
    this.state.channelsRef.off();
  };

  render() {
    const { channels, modal } = this.state;

    return (
      <React.Fragment>
        <Menu.Menu style={{ paddingBottom: '2em' }}>
          <Menu.Item>
            <span> <Icon name="exchange" /> {"CHANNELS "} </span>
            ({ channels.length }) <Icon name="add" onClick={this.openModal} />
          </Menu.Item>
          {this.displayChannels(channels)}
        </Menu.Menu>
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Add a channel</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input fluid label="Name of channel" name="channelName" onChange={this.handleChange} />
              </Form.Field>
              <Form.Field>
                <Input fluid label="About channel" name="channelDetails" onChange={this.handleChange} />
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSubmit}>
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

  displayChannels = (channels) => (
    channels.length > 0 && channels.map(channel => (
      <Menu.Item key={channel.id} onClick={() => this.changeChannel(channel)} name={channel.name}
                 active={channel.id === this.state.activeChannel}>
        #{channel.name}
      </Menu.Item>)
    )
  );

  changeChannel = channel => {
    this.setActiveChannel(channel);
    this.props.setCurrentChannel(channel);
  };

  setActiveChannel = (channel) => {
    this.setState({
      activeChannel: channel.id,
    })
  };

  setFirstChannel= () => {
    const firstChannel = this.state.channels[0];
    if (this.state.firstLoad && this.state.channels.length > 0) {
      this.props.setCurrentChannel(firstChannel);
      this.setState({
        firstLoad: false
      });
      this.setActiveChannel(firstChannel);
    }
  }
}

export default connect(null, { setCurrentChannel })(Channel);

