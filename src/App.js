import React, { Component } from 'react';
import StripeCheckout from "react-stripe-checkout"
import logo from './logo.svg';
import './App.css';

class LambdaDemo extends Component {
  constructor(props) {
    super(props);
    this.state = {loading: false, msg: null};
  }

  handleClick = (e) => {
    e.preventDefault();

    this.setState({loading: true});
    fetch('/.netlify/functions/hello')
      .then(response => response.json())
      .then(json => this.setState({loading: false, msg: json.msg}));
  }

  render() {
    const {loading, msg} = this.state;

    return <p>
      <button onClick={this.handleClick}>{loading ? 'Loading...' : 'Call Lambda'}</button><br/>
      <span>{msg}</span>
    </p>
  }
}

class App extends Component {
  onToken = token => {
    const data = {
      token:token,
      amount : 111,
      idempotency_key:6789678,
    }
    console.log(token)
    fetch("/.netlify/functions/hello", {
      method: "POST",
      body: JSON.stringify(data)
    }).then(response => {
      response.json().then(data => {
        console.log(data)
        alert(`We are in business, ${data.email}`);
      });
    });
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <LambdaDemo/>
        <StripeCheckout
          token={this.onToken}
          stripeKey={'pk_test_cD1gIBptwIBFuzEaIBXSuLvJ'}
        />  
      </div>
    );
  }
}

export default App;
