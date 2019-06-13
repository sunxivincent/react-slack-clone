import React from 'react';
import { Segment, Button, Input} from 'semantic-ui-react';

class MessageForm extends React.Component {
  render() {
    return (
      <Segment className="message__form">
        <Input
          fluid
          name="messages"
          style={{ marginBottom: '0.7em' }}
          label={<Button icon="add"/>}
          placeholder="write your message"
        />
        <Button.Group icon widths="2">
          <Button
            color="orange"
            content="Add Reply"
            icon="edit"
            labelPosition="left"
          />
          <Button
            color="teal"
            content="Upload Media"
            icon="cloud upload"
            labelPosition="right"
          />
        </Button.Group>
      </Segment>
    );
  }
}

export default MessageForm;