import React from 'react';
import {Segment, Button, Input} from 'semantic-ui-react';
import firebase from '../../firebase';
import FileModal from './FileModal';
import uuidv4 from 'uuid/v4';
import ProgressBar from './ProgressBar';
import 'emoji-mart/css/emoji-mart.css';
import { Picker, emojiIndex } from "emoji-mart";

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
    isPrivateChannel: this.props.isPrivateChannel,
    emojiPicker: false,
  };


  componentWillUnmount() {
    if (this.state.uploadTask !== null) {
      this.state.uploadTask.cancel();
      this.setState({ uploadTask: null});
    }
  }

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

  handleKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.keyCode === 13) {
      this.sendMessage();
    }

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

  handleTogglePicker = () => {
    this.setState({ emojiPicker: !this.state.emojiPicker});
  };

  selectEmoji = emoji => {
    const oldMessage = this.state.message;
    const newMessage = this.colonToUnicode(` ${oldMessage} ${emoji.colons} `);
    this.setState({ message: newMessage, emojiPicker: false});
    setTimeout(() => this.messageInputRef.focus(), 0);
  };

  colonToUnicode = message => {
    return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
      x = x.replace(/:/g, "");
      let emoji = emojiIndex.emojis[x];
      if (typeof emoji !== "undefined") {
        let unicode = emoji.native;
        if (typeof unicode !== "undefined") {
          return unicode;
        }
      }
      x = ":" + x + ":";
      return x;
    });
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
      return `chat/private/${this.state.channel.id}`;
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
    const {errors, message, loading, modal, percentUploaded, uploadState, emojiPicker} = this.state;
    return (
      <Segment className="message__form">
        {emojiPicker && (
          <Picker
            set="apple"
            className="emojipicker"
            title="pick your emoji"
            emoji="point_up"
            onSelect={this.selectEmoji}
          />
        )}
        <Input
          fluid
          name="message"
          value={message}
          style={{marginBottom: '0.7em'}}
          label={
            <Button
              icon={emojiPicker ? 'close' : 'add'}
              content={emojiPicker ? 'close' : null}
              onClick={this.handleTogglePicker}
            />
          }
          placeholder="write your message"
          onChange={this.handleMessageChange}
          onKeyDown={this.handleKeyDown}
          ref={node => (this.messageInputRef = node)}
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