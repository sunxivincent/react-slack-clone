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
    return (
      <Grid columns="equal" className="app" style={{background: '#eee'}}>
        <ColorPanel/>
        <SidePanel currentUser={this.props.currentUser}/>
        <Grid.Column style={{marginLeft: 320}}>
          <Messages/>
        </Grid.Column>
        <Grid.Column width={4}>
          <MetaPanel/>
        </Grid.Column>
      </Grid>
    );
  }
}

const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
});

export default connect(mapStateToProps)(App);
