import React from 'react'
import { Segment, Comment, Image} from 'semantic-ui-react';
import MessageHeader from "./MessageHeader";
import MessageForm from "./MessageForm";
import firebase from "../../firebase";
import Message from "./Message";
import { connect } from 'react-redux';
import { setUserPosts } from "../../actions/index";
import Typing from './Typing';

// TODO invetigate sticky to make message box sticks to the bottom of the screen
class Messages extends React.Component {

  state = {
    isPrivateChannel: this.props.isPrivateChannel,
    privateMessagesRef: firebase.database().ref("privateMessages"),
    messageRef: firebase.database().ref("messages"),
    usersRef: firebase.database().ref('users'),
    typingRef: firebase.database().ref('typing'),
    connectedRef: firebase.database().ref('.info/connected'),
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    messages: [],
    messageLoading: true,
    progressBar: false,
    numUniqueUsers: '',
    searchTerm: '',
    searchLoading: false,
    searchResults: [],
    isChannelStarred: false,
    typingUsers: [],
  };

  componentDidMount() {
    const { channel, user } = this.state;

    if (channel && user) {
      this.addListeners(channel.id);
      this.addUserStarsListener(channel.id, user.uid);
    }
  }


  componentDidUpdate(prevProps, prevState) {
    if (this.messageEnd) {
      this.scrollToBottom();
    }
  }

  scrollToBottom = () => {
    this.messageEnd.scrollIntoView({ behavior: 'smooth'});
  };


  addListeners = channelId => {
    this.addMessageListener(channelId);
    this.addTypingListensers(channelId);
  };

  addTypingListensers = channelId => {
    // TODO: using map.. .
    let typingUsers = [];
    this.state.typingRef.child(channelId).on('child_added', snap => {
      if (snap.key !== this.state.user.uid) {
        typingUsers = typingUsers.concat({
          id: snap.key, // user's uid
          name: snap.val() // user' displayName
        });
        this.setState({ typingUsers });
      }
    });

    this.state.typingRef.child(channelId).on('child_removed', snap => {
      const index = typingUsers.findIndex(user => user.id === snap.key);
      if (index !== -1) {
        typingUsers = typingUsers.filter(user => user.id !== snap.key);
        this.setState({ typingUsers });
      }
    });

    this.state.connectedRef.on('value', snap => {
      if (snap.val() === true) {
        this.state.typingRef
          .child(channelId)
          .child(this.state.user.uid)
          .onDisconnect()
          .remove(
            error => {
              if (error !== null) {
                console.log(error);
              }
            }
          )
      }
    })
  };

  addMessageListener = channelId => {
    const ref = this.getMessageRef();
    let loadedMessages = [];
    // actullay child_added will be called X times where X is the number of children node which channelId contains.
    // one child will be appended at one time
    ref.child(channelId).on("child_added",
      snap => {
        loadedMessages.push(snap.val());
        this.setState({
          messages: loadedMessages,
          messageLoading: false,
        });
        this.countUniqueUsers(loadedMessages);
        this.countUserPosts(loadedMessages);
      }
    );
  };

  addUserStarsListener = (channelId, userId) => {
    this.state.usersRef
      .child(`${userId}/starred`)
      .once('value')
      .then(data => {
        if (data.val() !== null) {
          const channelIds = Object.keys(data.val());
          const prevStarred = channelIds.includes(channelId);
          this.setState({ isChannelStarred: prevStarred});
        }
      })
  };

  getMessageRef = () => {
    const { messageRef, privateMessagesRef, isPrivateChannel } = this.state;
    return isPrivateChannel ? privateMessagesRef : messageRef;
  };

  isProgressBarVisible = percent => {
    if (percent > 0) {
      this.setState({
        progressBar: true
      });
    }
  };

  displayChannelName = channel => {
    return channel ? `${this.state.isPrivateChannel ? '@' : '#'}${channel.name}` : '';
  };

  handleSearchChange = event => {
    this.setState({
      searchTerm: event.target.value,
      searchLoading: true,
    }, () => this.handleSearchMessages());
  };

  handleSearchMessages = () => {
    const channelMessages = [...this.state.messages];
    const regex = new RegExp(this.state.searchTerm, 'gi'); // globally and case insensitive
    const searchResults = channelMessages.reduce((acc, message) => {
      if (message.content && message.content.match(regex) || message.user.name.match(regex)) {
        acc.push(message);
      }
      return acc;
    }, []);
    this.setState({ searchResults });
    setTimeout(() => this.setState({ searchLoading: false }), 1000)
  };

  displayedMessage = messages =>
    messages.length > 0 && (messages.map(message =>
        <Message
          key={message.timestamp}
          message={message}
          user={this.state.user}
        />
      )
    );

  handleStar = () => {
    this.setState(prevState => ({
      isChannelStarred: !prevState.isChannelStarred
    }), () => this.starChannel())
  };

  starChannel = () => {
    if (this.state.isChannelStarred) {
      this.state.usersRef
        .child(`${this.state.user.uid}/starred`)
        .update({
          [this.state.channel.id]: {
            name: this.state.channel.name,
            details:this.state.channel.details,
            createdBy: {
              name: this.state.channel.createdBy.name,
              avatar: this.state.channel.createdBy.avatar,
            }
          }
        });
    } else {
      this.state.usersRef
        .child(`${this.state.user.uid}/starred`)
        .child(this.state.channel.id)
        .remove(err => {
          if (err !== null) {
            console.log(err);
          }
        });
    }
  };

  render() {
    const { messageRef, messages, channel, user, progressBar, numUniqueUsers, searchTerm, searchResults, searchLoading, isPrivateChannel, isChannelStarred, typingUsers} = this.state;

    return (
      <div>
        <MessageHeader
          channelName={this.displayChannelName(channel)}
          numUniqueUsers={numUniqueUsers}
          handleSearchChange={this.handleSearchChange}
          searchLoading={searchLoading}
          isPrivateChannel={isPrivateChannel}
          isChannelStarred={isChannelStarred}
          handleStar={this.handleStar}
        />
        <Segment>
          <Comment.Group className={progressBar? 'message__progress' : 'messages'}>
            {searchTerm ? this.displayedMessage(searchResults) : this.displayedMessage(messages)}
            {this.displayTypingUsers(typingUsers)}
            <div ref={node => (this.messageEnd = node)}></div>
          </Comment.Group>
        </Segment>
        <MessageForm getMessageRef={this.getMessageRef} isPrivateChannel={isPrivateChannel} channel={channel} user={user} messageRef={messageRef} isProgressBarVisible={this.isProgressBarVisible} />
      </div>
    );
  }

  displayTypingUsers = users => (
    users.length > 0 && (
      users.map(user =>
        <div key={user.id} style={{ display: 'flex', alignItems: "center"}}>
          <span className="user__typing">{user.name} is typing</span> <Typing/>
        </div>
      )
    )
  );

  countUniqueUsers = loadedMessages => {
    const uniqueUsers = loadedMessages.reduce((acc, message) => {
      if (!acc.includes(message.user.name)) {
        acc.push(message.user.name);
      }
      return acc;
    }, []);
    const numUniqueUsers = `${uniqueUsers.length}users`;
    this.setState({ numUniqueUsers });
  };

  countUserPosts = loadedMessages => {
    const userPosts = loadedMessages.reduce((acc, message) => {
      if (message.user.name in acc) {
        acc[message.user.name].count +=1;
      } else {
        acc[message.user.name] = {
          avatar: message.user.avatar,
          count: 1
        }
      }
      return acc;
    }, {});
    this.props.setUserPosts(userPosts)
  }
}

export default connect(null, {setUserPosts})(Messages);