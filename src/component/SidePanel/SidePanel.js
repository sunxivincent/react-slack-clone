import React from 'react';
import { Menu } from 'semantic-ui-react';
import UserPanel from "./UserPanel";
import Channel from "./Channel";
import DirectMessages from "./DirectMessages";
import Starred from "./Starred";

class SidePanel extends React.Component {
  render() {
    const { currentUser } = this.props;

    return (
      <Menu size="large" inverted fixed="left" vertical style={{ background: '#4c3c4c', fontSize: '1.2rem' }}>
        <UserPanel currentUser={currentUser} />
        <Starred />
        <Channel currentUser={currentUser} />
        <DirectMessages currentUser={currentUser} />
      </Menu>
    );
  }
}

export default SidePanel;