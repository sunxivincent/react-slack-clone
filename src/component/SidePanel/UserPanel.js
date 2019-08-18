import React from 'react';

import { Grid, Header, Icon, Dropdown, Image, Modal, Input, Button } from 'semantic-ui-react';
import firebase from '../../firebase';
import AvatarEditor from "react-avatar-editor";

class UserPanel extends React.Component {
  state = {
    user: this.props.currentUser,
    modal: false,
    previewImage: "",
    croppedImage: "",
    uploadedCroppedImage: "",
    blob: '',
    storageRef: firebase.storage().ref(),
    userRef: firebase.auth().currentUser,
    usersRef: firebase.database().ref("users"),
    metadata: {
      contentType: 'image/jpeg',
    }
  };

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });
  // this is not recommended as we need to check whether or not state is updated before we actullay use it
  // componentDidMount() {
  //   this.setState({
  //     user: this.props.currentUser
  //   });
  // }

  render() {
    const { user, modal, previewImage, croppedImage } = this.state;
    const { primaryColor } = this.props;

    return (
      <Grid style={{ background: primaryColor}}>
        <Grid.Column>
          <Grid.Row style={{ padding: '1.2em', margin:0 }}>
            <Header inverted floated="left" as="h2">
              <Icon name="code"/>
              <Header.Content>Dev chat</Header.Content>
            </Header>

            <Header styled={{ padding: "0.25em" }} as="h4" inverted>
              <Dropdown trigger= {
                <span>
                  <Image src={user.photoURL} spaced="right" avatar/>
                  {user.displayName}
                </span>
              } options={this.dropdownOptions()}/>
            </Header>
          </Grid.Row>
          <Modal basic open={modal} onClose={this.closeModal}>
            <Modal.Header>Change Avatar</Modal.Header>
            <Modal.Content>
              <Input
                fluid
                type="file"
                label="New Avatar"
                name="previewImage"
                onChange={this.handleChange}
              />
              <Grid centered stackable columns={2}>
                <Grid.Row centered>
                  <Grid.Column className="ui center aligned grid">
                    {previewImage && (
                      <AvatarEditor
                        ref={node => (this.avatarEditor = node) }
                        image={previewImage}
                        width={120}
                        height={120}
                        border={50}
                        scale={1.2}
                      />
                    )}
                  </Grid.Column>
                  <Grid.Column className="ui center aligned grid">
                    {croppedImage && (
                      <Image
                        style={{ margin: '3.5em auto'}}
                        width={100}
                        height={100}
                        src={croppedImage}
                      />
                    )}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Modal.Content>
            <Modal.Actions>
              {croppedImage && (
                <Button color="green" onClick={this.uploadCroppedImage} inverted>
                  <Icon name="save"/> Change Avatar
                </Button>
              )}
              <Button color="green" onClick={this.handleCropImage} inverted>
                <Icon name="image"/> Preview
              </Button>
              <Button color="red" onClick={this.closeModal} inverted>
                <Icon name="remove"/> Cancel
              </Button>
            </Modal.Actions>
          </Modal>
        </Grid.Column>
      </Grid>
    );
  }

  dropdownOptions = () => [
    {
      key: 'user',
      text: <span>Signed in as <strong>{this.state.user.displayName}</strong> </span>,
      disabled: true
    },
    {
      key: 'avatar',
      text: <span onClick={this.openModal} >Change Avatar</span>,
    },
    {
      key: 'signout',
      text: <span onClick={this.handleSignout}>Sign Out</span>,
    }
  ];

  handleSignout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => console.log('sign out'));
  };

  handleChange = event => {
    const file = event.target.files[0];
    console.log(file);
    const reader = new FileReader();
    if (file) {
      reader.readAsDataURL(file);
      reader.addEventListener('load', () => {
        console.log('loaded');
        console.log(reader.result);
        this.setState({ previewImage: reader.result });
      })
    }
  };

  handleCropImage = () => {
    if (this.avatarEditor) {
      this.avatarEditor.getImageScaledToCanvas().toBlob(blob => {
        let imageUrl = URL.createObjectURL(blob);
        this.setState({
          croppedImage: imageUrl,
          blob
        })
      });
    }
  };

  uploadCroppedImage = () => {
    const { storageRef, userRef, metadata, blob } = this.state;
    storageRef
      .child(`avatars/user/${userRef.uid}`)
      .put(blob, metadata)
      .then(snap => {
        snap.ref.getDownloadURL().then(
          url => this.setState({
            uploadedCroppedImage: url
          }, () => this.changeAvatar())
        )
      })
  };

  changeAvatar = () => {
    this.state.userRef
      .updateProfile(({
        photoURL: this.state.uploadedCroppedImage
      }))
      .then(() => {
        console.log("photo url uploaded");
        this.closeModal();
      })
      .catch(e => console.error(e));

    this.state.usersRef
      .child(this.state.user.uid)
      .update({
        avatar: this.state.uploadedCroppedImage
      })
      .then(() => {
        console.log("user avatar upadted")
      })
      .catch(e => console.error(e));
  }
}

export default UserPanel;