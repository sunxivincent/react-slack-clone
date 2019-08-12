import React, { Component, createRef } from 'react';
import { Grid, Ref, Sticky } from 'semantic-ui-react';
import { connect } from 'react-redux';

import './App.css';
import ColorPanel from "./ColorPanel/ColorPanel";
import SidePanel from "./SidePanel/SidePanel";
import Messages from "./Messages/Messages";
import MetaPanel from "./MetaPanel/MetaPanel";

class App extends React.Component {
  render() {
    const { currentUser, currentChannel, isPrivateChannel, userPosts, primaryColor, secondaryColor } = this.props;
    return (
      <Grid columns="equal" className="app" style={{background: secondaryColor}}>
        <ColorPanel
          key={currentUser && currentUser.name}
          currentUser={currentUser}/>
        <SidePanel
          key={currentUser && currentUser.uid }
          currentUser={currentUser}
          primaryColor={primaryColor}
        />
        <Grid.Column style={{marginLeft: 320}}>
          <Messages
            key={currentChannel && currentChannel.id}
            currentChannel={currentChannel}
            currentUser={currentUser}
            isPrivateChannel={isPrivateChannel}
          />
        </Grid.Column>
        <Grid.Column width={4}>
          <MetaPanel key={currentChannel && currentChannel.id }
                     isPrivateChannel={isPrivateChannel}
                     currentChannel={currentChannel}
                     userPosts={userPosts}
          />
        </Grid.Column>
      </Grid>
    );
  }
}

const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
  currentChannel: state.channel.currentChannel,
  isPrivateChannel: state.channel.isPrivateChannel,
  userPosts: state.channel.userPosts,
  primaryColor: state.color.primary,
  secondaryColor: state.color.secondary
});

export default connect(mapStateToProps)(App);
