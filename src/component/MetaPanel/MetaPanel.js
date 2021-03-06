import React from 'react';
import { Segment, Accordion, Header, Icon, Image, List} from  'semantic-ui-react';


class MetaPanel extends React.Component {
  state = {
    activeIndex: -1,
    isPrivateChannel: this.props.isPrivateChannel,
    currentChannel: this.props.currentChannel,
  };

  setActiveIndex = (event, props) => {
    const { index }  = props;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index; // for cancel out the selection if clicking the same active index again
    this.setState({ activeIndex: newIndex });
  };

  displayTopPosters = posts => (
    Object.entries(posts)
      .sort((a, b) => b[1].count - a[1].count )
      .map(([k, v], index) => (
        <List.Item key={index}>
          <Image avatar src={v.avatar}/>
          <List.Content>
            <List.Header as="a">{k}</List.Header>
            <List.Description>{v.count} posts</List.Description>
          </List.Content>
        </List.Item>
      ))
      .slice(0,5)
  );

  render() {
    const { activeIndex, isPrivateChannel, currentChannel } = this.state;
    const { userPosts } = this.props;

    if (isPrivateChannel) return null;
    return (
      <Segment loading={!currentChannel}>
        <Header as="h3" attached="top">
          About #{currentChannel && currentChannel.name}
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
            {currentChannel && currentChannel.details}
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
            <List>
              {userPosts && this.displayTopPosters(userPosts)}
            </List>
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
            <Header as="h3">
              <Image circular src={currentChannel && currentChannel.createdBy.avatar} />
              {currentChannel && currentChannel.createdBy.name}
            </Header>
          </Accordion.Content>
        </Accordion>
      </Segment>
    );
  }
}

export default MetaPanel;