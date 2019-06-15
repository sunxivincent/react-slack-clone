import React from 'react'
import { Segment, Comment, Ref, Sticky } from 'semantic-ui-react';
import MessageHeader from "./MessageHeader";
import MessageForm from "./MessageForm";
import firebase from "../../firebase";

// TODO invetigate sticky to make message box sticks to the bottom of the screen
class Messages extends React.Component {

  state = {
    messageRef: firebase.database().ref("messages"),
    channel: this.props.currentChannel,
    user: this.props.currentUser,
  };

  render() {

    const { messageRef, channel, user} = this.state;

    return (
      <div ref={this.handleContextRef}>
        {/*<Sticky context={this.state.context}>*/}
          <MessageHeader/>
        {/*</Sticky>*/}
        <Segment>
          <Comment.Group className="messages">
          </Comment.Group>
        </Segment>
        <MessageForm channel={channel} user={user} messageRef={messageRef} />
      </div>
    );
  }
}

export default Messages;