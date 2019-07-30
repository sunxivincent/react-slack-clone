import React from 'react';
import { Menu, Icon } from 'semantic-ui-react';
import firebase from '../../firebase';

class DirectMessages extends React.Component {
  state = {
    user: this.props.currentUser,
    users: [],
    usersRef: firebase.database().ref('users'),
    connectedRef: firebase.database().ref('.info/connected'),
    presenceRef: firebase.database().ref('presence')
  };

  componentDidMount() {
    if (this.state.user) {
      console.log(this.state.user);
      this.addListeners(this.state.user.uid);
    }
  }

  addListeners = currentUserUid => {
    let loadedUsers = [];
    this.state.usersRef.on('child_added', snap => {
      if (currentUserUid !== snap.key) {
        let user = snap.val();
        user['uid'] = snap.key;
        user['status'] = 'offline';
        loadedUsers.push(user);
        this.setState({users: loadedUsers}); // load other users and default the online status to logged out
      }
    });

    // bug fix: we are supposed to set current connected users status to connected. Or otherwise when we loggin to
    // another user account, it cannot reflect to current user's online status
    // add user to the presence map if connected
    this.state.connectedRef.on('value', snap => {
      if (snap.val() === true) {
        const ref = this.state.presenceRef.child(currentUserUid);
        ref.set(true);
        ref.onDisconnect().remove(error => {
          if (error != null) {
            console.log(error);
          }
        })
      }
    });

    // set the connected user status from current user's point of view
    this.state.presenceRef.on('child_added', snap => {
      if (currentUserUid !== snap.key) {
        this.addStatusToUser(snap.key, true);
      }
    });

    this.state.presenceRef.on('child_removed', snap => {
      if (currentUserUid !== snap.key) {
        this.addStatusToUser(snap.key, false);
      }
    })
  };

  addStatusToUser = (userId, connected = true) => {
    const updatedUsers = this.state.users.reduce((acc, user) => {
      if (user.uid === userId) {
        user['status'] = `${connected ? 'online' : 'offline'}`;
      }
      return acc.concat(user);
    }, []);
    this.setState({users: updatedUsers});
  };

  render() {
    const {users} = this.state;
    return (
      <Menu.Menu className='menu'>
        <Menu.Item>
          <span>
            <Icon name="mail"/> Direct Messages
          </span> {' '}
          ({users.length})
        </Menu.Item>
        {users.map(user => (
          <Menu.Item
            key={user.uid}
            onClick={() => console.log(user)}
          >
            <Icon
              name='circle'
              color={this.isUserOnline(user) ? 'green' : 'red'}
            />
            @{user.name}
          </Menu.Item>
        ))}
      </Menu.Menu>
    );
  }

  isUserOnline = (user) => {
    return user.status === 'online';
  };
}

export default DirectMessages;