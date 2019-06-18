import React from 'react'
import { Segment, Comment} from 'semantic-ui-react';
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
    // one child will be appended at one time
    this.state.messageRef.child(channelId).on("child_added",
      snap => {
        loadedMessages.push(snap.val());
        this.setState({
          messages: loadedMessages,
          messageLoading: false,
        });
      }
    );
    // actullay child_added will be called X times where X is the number of children node which channelId contains.
    console.log('messages set' + this.state.messages.length);
  };

  render() {
    const { messageRef, messages, channel, user} = this.state;
    console.log('messages display' + messages.length);
    const displayedMessage =
      messages.length > 0 && (messages.map(message =>
        <Message
          key={message.timestamp}
          message={message}
          user={this.state.user}
        />
      )
    );
    // const displayedMessage =
    //   messages.map(message => (
    //     <div>message</div>
    //   ));
    console.log('render display' + displayedMessage.length);
    return (
      <div>
        <MessageHeader/>
        <Segment>
          <Comment.Group className="messages">
            {displayedMessage}
          </Comment.Group>
        </Segment>
        <MessageForm channel={channel} user={user} messageRef={messageRef} />
      </div>
    );
  }
}

export default Messages;