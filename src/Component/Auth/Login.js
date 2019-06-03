import React from 'react';
import { Grid, Form, Segment, Button, Header, Message, Icon} from 'semantic-ui-react';
import { Link } from 'react-router-dom'
import firebase from '../../firebase';

class Login extends React.Component {
  state = {
    email: '',
    password: '',
    errors: [],
    loading: false,
  };

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleSubmit = event => {
    event.preventDefault();
    if (this.isFormValid(this.state)) {
      this.setState( {errors: [], loading: true });
      firebase
        .auth()
        .signInWithEmailAndPassword(this.state.email, this.state.password)
        .then(signedUser => {
          console.log(signedUser);
          this.setState({
            loading: false,
          })
        })
        .catch(error => {
          console.error(error);
          this.setState({
            errors: this.state.errors.concat(error),
            loading: false,
          })
        })
    }
  };

  handleErrorInput = (errors, input) => {
    return errors.some(error => error.message.includes(input)) ? 'error' : '';
  };

  render() {
    const { email, password, errors, loading } = this.state;
    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450}}>
          <Header as="h1" icon color="violet" textAlign="center">
            <Icon name="code branch" color="violet"/>
            Login to chat
          </Header>
          <Form onSubmit={this.handleSubmit} size="large">
            <Segment stacked>
               <Form.Input fluid name="email" icon="mail" iconPosition="left"
                          placeholder="Email" onChange={this.handleChange} type="email" value={email}
                          className={this.handleErrorInput(errors, 'email')}
              />
              <Form.Input fluid name="password" icon="lock" iconPosition="left"
                          placeholder="Password" onChange={this.handleChange} type="password" value={password}
                          className={this.handleErrorInput(errors, 'password')}
              />
              <Button disabled={loading} className={loading ? "loading" : ""} coloer="violet" fluid size="large">Submit</Button>
            </Segment>
          </Form>
          {errors.length > 0 && (
            <Message error>
              <h3>Error</h3>
              {this.displayErrors(errors)}
            </Message>
          )}
          <Message>Don't have an account? <Link to="/register">Register</Link></Message>
        </Grid.Column>>
      </Grid>
    );
  }

  isFormValid = ({ email, password }) => {
    return email && password;
  };

  displayErrors = errors => errors.map((error, i) => <p key={i}>{error.message}</p>);
}

export default Login;