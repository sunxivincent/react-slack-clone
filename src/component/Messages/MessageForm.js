import React from 'react';
import { Segment, Button, Input} from 'semantic-ui-react';
import firebase from '../../firebase';
import FileModal from './FileModal';

class MessageForm extends React.Component {
  state = {
    message: "",
    loading: false,
    user: this.props.user,
    channel: this.props.channel,
    errors:[],
    modal: false,
  };

  openModal = () => {
    this.setState({
      modal: true,
    });
  };

  closeModal = () => {
    this.setState({
      modal: false,
    });
  };

  handleMessageChange = (event) => {
    this.setState({ message : event.target.value })
  };

  createMessage = () => {
    const message = {
      content: this.state.message,
      user: {
        id: this.state.user.uid,
        name: this.state.user.displayName,
        avatar: this.state.user.photoURL,
      },
      timestamp: firebase.database.ServerValue.TIMESTAMP,
    };
    return message;
  };

  sendMessage = () => {
    const { messageRef } = this.props;
    const { message, channel } = this.state;

    if (message) {
      this.setState({ loading: true });
      messageRef
        .child(channel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({ loading: false, message: '', errors:[] })
        })
        .catch(err => {
          this.setState({
            loading: false,
            errors: this.state.errors.concat(err)
          })
        })
    } else {
      this.setState({
        errors: this.state.errors.concat({ message: "add a message "})
      })
    }
  };

  render() {
    const { errors, message, loading, modal} = this.state;
    return (
      <Segment className="message__form">
        <Input
          fluid
          name="message"
          value={message}
          style={{ marginBottom: '0.7em' }}
          label={<Button icon="add"/>}
          placeholder="write your message"
          onChange={this.handleMessageChange}
          className={
            errors.some(error => error.message.includes('message')) ? 'error' : ''
          }
        />
        <Button.Group icon widths="2">
          <Button
            color="orange"
            content="Add Reply"
            icon="edit"
            labelPosition="left"
            onClick={this.sendMessage}
            disabled={loading}
          />
          <Button
            color="teal"
            content="Upload Media"
            icon="cloud upload"
            labelPosition="right"
            onClick={this.openModal}
          />
          <FileModal
            modal={modal}
            closeModal={this.closeModal}
          />
        </Button.Group>
      </Segment>
    );
  }
}

export default MessageForm;