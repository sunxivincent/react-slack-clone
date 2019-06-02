import React from 'react';
import ReactDOM from 'react-dom';
import App from './Component/App';
import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import Login from "./Component/Auth/Login";
import Register from "./Component/Auth/Register";

import 'semantic-ui-css/semantic.min.css';

const Root = () => (
  <Router>
    <Switch>
      <Route exact path="/" component={App} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
    </Switch>
  </Router>
);

ReactDOM.render(<Root />, document.getElementById('root'));
registerServiceWorker();
