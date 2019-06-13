import React from 'react'
import { Segment, Comment, Ref, Sticky } from 'semantic-ui-react';
import MessageHeader from "./MessageHeader";
import MessageForm from "./MessageForm";

// TODO invetigate sticky to make message box sticks to the bottom of the screen
class Messages extends React.Component {
  render() {
    return (
      <div ref={this.handleContextRef}>
        {/*<Sticky context={this.state.context}>*/}
          <MessageHeader/>
        {/*</Sticky>*/}
        <Segment>
          <Comment.Group className="messages">
          </Comment.Group>
        </Segment>
        <MessageForm />
      </div>
    );
  }
}

export default Messages;