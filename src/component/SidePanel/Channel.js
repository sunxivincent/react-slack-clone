import React from 'react';
import { Menu, Icon, Modal, Form, Input, Button, Label } from 'semantic-ui-react';
import firebase from '../../firebase';
import { connect } from 'react-redux';
import { setCurrentChannel, setPrivateChannel} from "../../actions/index";

class Channel extends React.Component {

  state = {
    user: this.props.currentUser,
    channel: null,
    channels: [],
    modal: false,
    channelName: '',
    channelDetails: '',
    channelsRef: firebase.database().ref('channels'),
    messageRef: firebase.database().ref('messages'),
    notifications: [],
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
      this.addNotificationListenerForEachChannel(snap.key)
    })
  };

  addNotificationListenerForEachChannel = channelId => {
    this.state.messageRef.child(channelId).on('value', snap => {
      if (this.state.channel) {
        this.handleNotifications(
          channelId,
          this.state.channel.id, //channel selected
          this.state.notifications,
          snap
        )
      }
    })
  };

  handleNotifications = (channelId, currentChannelId, notifications, messages) => {
    let lastTotal = 0;
    // find the notification has the channelId that we are iterating
    let index = notifications.findIndex(notification => notification.id === channelId);
    if (index != -1 ) {
      if (channelId !== currentChannelId) {
        lastTotal = notifications[index].total;
        if (messages.numChildren() > lastTotal) {
          notifications[index].count = messages.numChildren() - lastTotal;
        }
      }
      // set no matter which channel we are currently on
      notifications[index].lastKnownTotal =messages.numChildren();
    } else  { // this else block only serves the purpose for initializing notifications array
      // each signed in user has its own view of unread message number
      notifications.push({
        id: channelId,
        total: messages.numChildren(),
        lastKnownTotal: messages.numChildren(),
        count:0,
      })
    }
    this.setState({ notifications })
  };

  removeListeners = () => {
    this.state.channelsRef.off();
  };

  render() {
    const { channels, modal } = this.state;

    return (
      <React.Fragment>
        <Menu.Menu className="menu">
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
    channels.length > 0 && channels.map(channel => {
      const count = this.getNotificationCount(channel);
      return (
        <Menu.Item key={channel.id} onClick={() => this.changeChannel(channel)} name={channel.name}
                   active={channel.id === this.state.activeChannel}>
          {count > 0 && (
            <Label color='red'>
              {count}
            </Label>
          )}
          #{channel.name}
        </Menu.Item>);
      }
    )
  );

  getNotificationCount = channel => {
    let index = this.state.notifications.findIndex(n => channel.id === n.id && n.count > 0);
    return index !== -1 ? this.state.notifications[index].count : 0;
  };

  clearNotifiactions = () => {
    let index = this.state.notifications.findIndex(n => this.state.channel.id === n.id);
    if (index != -1) {
      let updatedNotifications = [...this.state.notifications];
      updatedNotifications[index].total = updatedNotifications[index].lastKnownTotal;
      updatedNotifications[index].count = 0;
      this.setState({ notifications: updatedNotifications});
    }
  };

  changeChannel = channel => {
    this.setActiveChannel(channel);
    this.clearNotifiactions();
    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false);
    this.setState({ channel });
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
      this.setState({channel: firstChannel});
    }
  }
}

export default connect(null, { setCurrentChannel, setPrivateChannel })(Channel);

