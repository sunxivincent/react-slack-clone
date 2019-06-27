import React from 'react'
import { Segment, Comment, Image} from 'semantic-ui-react';
import MessageHeader from "./MessageHeader";
import MessageForm from "./MessageForm";
import firebase from "../../firebase";
import Message from "./Message";

// TODO invetigate sticky to make message box sticks to the bottom of the screen
class Messages extends React.Component {

  state = {
    messageRef: firebase.database().ref("messages"),
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    messages: [],
    messageLoading: true,
    progressBar: false,
    numUniqueUsers: ''
  };

  componentDidMount() {
    const { channel, user } = this.state;

    if (channel && user) {
      this.addListeners(channel.id);
    }
  }

  addListeners = channelId => {
    this.addMessageListener(channelId);
  };

  addMessageListener = channelId => {
    let loadedMessages = [];
    // actullay child_added will be called X times where X is the number of children node which channelId contains.
    // one child will be appended at one time
    this.state.messageRef.child(channelId).on("child_added",
      snap => {
        loadedMessages.push(snap.val());
        this.setState({
          messages: loadedMessages,
          messageLoading: false,
        });
        this.countUniqueUsers(loadedMessages)
      }
    );
  };

  isProgressBarVisible = percent => {
    if (percent > 0) {
      this.setState({
        progressBar: true
      });
    }
  };

  displayChannelName = channel => {
    return channel ? `#${channel.name}` : '';
  };


  render() {
    const { messageRef, messages, channel, user, progressBar, numUniqueUsers} = this.state;
    const displayedMessage =
      messages.length > 0 && (messages.map(message =>
        <Message
          key={message.timestamp}
          message={message}
          user={this.state.user}
        />
      )
    );

    return (
      <div>
        <MessageHeader
          channelName = {this.displayChannelName(channel)}
          numUniqueUsers = {numUniqueUsers}
        />
        <Segment>
          <Comment.Group className={progressBar? 'message__progress' : 'messages'}>
            {displayedMessage}
          </Comment.Group>
        </Segment>
        <MessageForm channel={channel} user={user} messageRef={messageRef} isProgressBarVisible={this.isProgressBarVisible} />
      </div>
    );
  }

  countUniqueUsers = loadedMessages => {
    const uniqueUsers = loadedMessages.reduce((acc, message) => {
      if (!acc.includes(message.user.name)) {
        acc.push(message.user.name);
      }
      return acc;
    }, []);
    const numUniqueUsers = `${uniqueUsers.length}users`;
    this.setState({ numUniqueUsers });
  };


}

export default Messages;