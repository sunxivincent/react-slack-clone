import React from 'react';
import firebase from '../../firebase';
import { Menu, Icon, Modal, Form, Input, Button, Label } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { setPrivateChannel, setCurrentChannel } from "../../actions/index";

class Starred extends React.Component {
  state = {
    user: this.props.currentUser,
    usersRef: firebase.database().ref("users"),
    starredChannels: [],
    activeChannel: '',
  };

  componentDidMount() {
    if (this.state.user) {
      this.addListeners(this.state.user.uid);
    }
  }


  componentWillUnmount() {
    this.removeListeners();
  }

  removeListeners = () => {
    this.state.usersRef.child(`${this.state.user.uid}/starred`).off();
  };

  addListeners = (userId) => {
    this.state.usersRef
      .child(`${userId}/starred`)
      .on('child_added', snap => {
        // append id to channel props
        const starredChannel = {
          id : snap.key,
          ... snap.val(),
        };
        // append the new starred channel to starred channel list
        this.setState({
          starredChannels: [...this.state.starredChannels, starredChannel]
        });
      });

    this.state.usersRef
      .child(`${userId}/starred`)
      .on('child_removed', snap => {
        const removedChannel = {
          id : snap.key,
          ... snap.val(),
        };
        const filteredChannel = this.state.starredChannels.filter(channel => channel.id !== snap.key);
        this.setState({
          starredChannels: filteredChannel
        });
      });
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