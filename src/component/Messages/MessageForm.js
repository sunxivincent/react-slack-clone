import React from 'react';
import {Segment, Button, Input} from 'semantic-ui-react';
import firebase from '../../firebase';
import FileModal from './FileModal';
import uuidv4 from 'uuid/v4';
import ProgressBar from './ProgressBar';

class MessageForm extends React.Component {
  state = {
    percentUploaded: 0,
    storageRef: firebase.storage().ref(),
    typingRef: firebase.database().ref('typing'),
    uploadTask: null,
    uploadState: '',
    message: "",
    loading: false,
    user: this.props.user,
    channel: this.props.channel,
    errors: [],
    modal: false,
    isPrivateChannel: this.props.isPrivateChannel
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
    this.setState({message: event.target.value})
  };

  handleKeyDown = () => {
    const { message, typingRef, channel, user } = this.state;
    if (message) {
      typingRef
        .child(channel.id)
        .child(user.uid)
        .set(user.displayName)
    } else {
      typingRef
        .child(channel.id)
        .child(user.uid)
        .remove();
    }
  };

  createMessage = (downloadUrl = null) => {
    const message = {
      user: {
        id: this.state.user.uid,
        name: this.state.user.displayName,
        avatar: this.state.user.photoURL,
      },
      timestamp: firebase.database.ServerValue.TIMESTAMP,
    };
    if (downloadUrl !== null) {
      message['image'] = downloadUrl;
    } else {
      message['content'] = this.state.message;
    }
    return message;
  };

  sendMessage = () => {
    const {getMessageRef} = this.props;
    const {message, channel, user, typingRef} = this.state;

    if (message) {
      this.setState({loading: true});
      getMessageRef()
        .child(channel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({loading: false, message: '', errors: []})
          typingRef
            .child(channel.id)
            .child(user.uid)
            .remove();
        })
        .catch(err => {
          this.setState({
            loading: false,
            errors: this.state.errors.concat(err)
          })
        })
    } else {
      this.setState({
        errors: this.state.errors.concat({message: "add a message "})
      })
    }
  };

  getPath = () => {
    const { isPrivateChannel } = this.state;
    if (isPrivateChannel) {
      return `chat/private-${this.state.channel.id}`;
    } else {
      return `chat/public`;
    }
  };

  uploadFile = (file, metadata) => {
    const pathToUpload = this.state.channel.id;
    const ref = this.props.messageRef;
    const filePath = `${this.getPath()}/${uuidv4()}.jpg`;

    this.setState({
      uploadState: 'uploading',
      uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
    }, () => {
      this.state.uploadTask.on('state_changed', snap => {
        const percentUploaded = (snap.bytesTransferred / snap.totalBytes) * 100;
        this.props.isProgressBarVisible(percentUploaded);
        this.setState({percentUploaded});
      }, err => {
        console.error(err);
        this.setState({
          errors: this.errors.concat(err),
          uploadState: 'error',
          uploadTask: null
        });
      }, () => {
        this.state.uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
          this.sendFileMessage(downloadURL, ref, pathToUpload);
        }).catch(
          err => {
            console.error(err);
            this.setState({
              errors: this.errors.concat(err),
              uploadState: 'error',
              uploadTask: null
            });
          }
        )
      })
    })
  };

  render() {
    const {errors, message, loading, modal, percentUploaded, uploadState} = this.state;
    return (
      <Segment className="message__form">
        <Input
          fluid
          name="message"
          value={message}
          style={{marginBottom: '0.7em'}}
          label={<Button icon="add"/>}
          placeholder="write your message"
          onChange={this.handleMessageChange}
          onKeyDown={this.handleKeyDown}
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
            disabled={uploadState === "uploading"}
            color="teal"
            content="Upload Media"
            icon="cloud upload"
            labelPosition="right"
            onClick={this.openModal}
          />
        </Button.Group>
        <FileModal
          modal={modal}
          closeModal={this.closeModal}
          uploadFile={this.uploadFile}
        />
        <ProgressBar
          percentUploaded={percentUploaded}
          uploadState={uploadState}
        />
      </Segment>
    );
  }

  sendFileMessage = (downloadURL, ref, pathToUpload) => {
    ref.child(pathToUpload)
      .push()
      .set(this.createMessage(downloadURL))
      .then(() => {
        this.setState({uploadState: "done"});
      })
      .catch(err => {
        console.error(err);
        this.setState({
          errors: this.errors.concat(err),
        });
      })
  }
}

export default MessageForm;