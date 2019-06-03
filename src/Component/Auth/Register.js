import React from 'react';
import { Grid, Form, Segment, Button, Header, Message, Icon} from 'semantic-ui-react';
import { Link } from 'react-router-dom'
import firebase from '../../firebase';
import md5 from 'md5';

class Register extends React.Component {
  state = {
    username: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    errors: [],
    loading: false,
    usersRef: firebase.database().ref('users')
  };

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleSubmit = event => {
    event.preventDefault();
    if (this.isFormValid()) {
      this.setState( {errors: [], loading: true });
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.state.email, this.state.password)
        .then(createdUser => {
          console.log(createdUser);
          createdUser.user.updateProfile({
            displayName: this.state.username,
            photoURL: `http://gravatar.com/avatar/${md5(createdUser.user.email)}?d=identicon`
          })
          .then(() => {
            this.saveUser(createdUser)
              .then(() => {
                console.log("user saved");
              });
            this.setState({ loading: false });
          })
          .catch(e => {
            console.error(e);
            this.setState({ loading: false, errors: this.state.errors.concat(e) });
            })
        })
        .catch( e => {
          console.error(e);
          this.setState({ loading: false, errors: this.state.errors.concat(e) });
        });
    }
  };

  handleErrorInput = (errors, input) => {
    return errors.some(error => error.message.includes(input)) ? 'error' : '';
  };

  render() {
    const { username, email, password, passwordConfirmation, errors, loading } = this.state;
    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450}}>
          <Header as="h2" icon color="orange" textAlign="center">
            <Icon name="puzzle piece" color="orange"/>
            Register for chat
          </Header>
          <Form onSubmit={this.handleSubmit} size="large">
            <Segment stacked>
              <Form.Input fluid name="username" icon="user" iconPosition="left"
                placeholder="Username" onChange={this.handleChange} type="text" value={username}/>
              <Form.Input fluid name="email" icon="mail" iconPosition="left"
                placeholder="Email" onChange={this.handleChange} type="email" value={email}
                className={this.handleErrorInput(errors, 'email')}
              />
              <Form.Input fluid name="password" icon="lock" iconPosition="left"
                placeholder="Password" onChange={this.handleChange} type="password" value={password}
                className={this.handleErrorInput(errors, 'password')}
              />
              <Form.Input fluid name="passwordConfirmation" icon="repeat" iconPosition="left"
                placeholder="Password Confirmation" onChange={this.handleChange} type="password" value={passwordConfirmation}
                className={this.handleErrorInput(errors, 'password')}
              />
              <Button disabled={loading} className={loading ? "loading" : ""} coloer="orange" fluid size="large">Submit</Button>
            </Segment>
          </Form>
          {errors.length > 0 && (
            <Message error>
              <h3>Error</h3>
              {this.displayErrors(errors)}
            </Message>
          )}
          <Message>Already a user ? <Link to="/login">Login</Link></Message>
        </Grid.Column>>
      </Grid>
    );
  }

  isFormValid = () => {
    let errors = [];
    let error;
    if (this.isFormEmpty(this.state)) {
      error = { message:  'fill all fields'};
      this.setState({ errors: errors.concat(error) });
      return false;
    } else if (!this.isPasswordValid(this.state)) {
      error = { message:  'password is not valid '};
      this.setState({ errors: errors.concat(error) });
      return false;
    } else {
      return true;
    }
  };

  isFormEmpty = ({ username, email, password, passwordConfirmation }) => {
    return !username.length || !email.length || !password.length  || !passwordConfirmation.length ;
  };

  isPasswordValid = ({ password, passwordConfirmation }) => {
    return password.length > 6 && passwordConfirmation.length > 6 && password === passwordConfirmation;
  };

  displayErrors = errors => errors.map((error, i) => <p key={i}>{error.message}</p>);

  saveUser = createdUser => {
    return this.state.usersRef.child(createdUser.user.uid).set({
      name: createdUser.user.displayName,
      avatar: createdUser.user.photoURL,
    });
  }
}

export default Register;