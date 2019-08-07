import React from 'react';
import { Segment, Accordion, Header, Icon } from  'semantic-ui-react';


class MetaPanel extends React.Component {
  state = {
    activeIndex: -1,
    isPrivateChannel: this.props.isPrivateChannel,
  };

  setActiveIndex = (event, props) => {
    const { index }  = props;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index; // for cancel out the selection if clicking the same active index again
    this.setState({ activeIndex: newIndex });
  };

  render() {
    const { activeIndex, isPrivateChannel } = this.state;

    if (isPrivateChannel) return null;
    return (
      <Segment>
        <Header as="h3" attached="top">
          About a channel
        </Header>
        <Accordion styled attached="true">
          <Accordion.Title
            active={activeIndex===0}
            index={0}
            onClick={this.setActiveIndex}
            >
            <Icon name="dropdown"/>
            <Icon name="info"/>
            Channel Details
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 0}>
            details
          </Accordion.Content>

          <Accordion.Title
            active={activeIndex===1}
            index={1}
            onClick={this.setActiveIndex}
          >
            <Icon name="dropdown"/>
            <Icon name="user circle"/>
            Top posters
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 1}>
            details
          </Accordion.Content>

          <Accordion.Title
            active={activeIndex===2}
            index={2}
            onClick={this.setActiveIndex}
          >
            <Icon name="dropdown"/>
            <Icon name="pencil alternate"/>
            Created By
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 2}>
            creator
          </Accordion.Content>
        </Accordion>
      </Segment>
    );
  }
}

export default MetaPanel;