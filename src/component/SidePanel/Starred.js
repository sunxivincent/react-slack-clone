import React from 'react';
import { Menu, Icon, Modal, Form, Input, Button, Label } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { setPrivateChannel, setCurrentChannel } from "../../actions/index";

class Starred extends React.Component {
  state = {
    starredChannels: [],
    activeChannel: '',
  };

  render() {
    const { starredChannels } = this.state;
    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span> <Icon name="star" /> {"STARRED "} </span>
          ({ starredChannels.length }) <Icon name="add" onClick={this.openModal} />
        </Menu.Item>
        {this.displayChannels(starredChannels)}
      </Menu.Menu>
    );
  }

  setActiveChannel = (channel) => {
    this.setState({
      activeChannel: channel.id,
    })
  };

  changeChannel = channel => {
    this.setActiveChannel(channel);
    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false);
  };

  displayChannels = (channels) => (
    channels.length > 0 && channels.map(channel => {
        return (
          <Menu.Item key={channel.id} onClick={() => this.changeChannel(channel)} name={channel.name}
                     active={channel.id === this.state.activeChannel}>
            #{channel.name}
          </Menu.Item>);
      }
    )
  );
}

export default connect(null, {setCurrentChannel, setPrivateChannel})(Starred);