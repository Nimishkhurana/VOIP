import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import { MDBBtn, MDBCard, MDBContainer,MDBCardBody, MDBCardImage, MDBCardTitle, MDBCardText, MDBCol } from 'mdbreact';
import Navbar from './components/Navbar';
import Login from './components/Login'
import Test from './components/Test'
import User from './components/User'
import { Signup } from './components/Signup'
import Groupchat from './components/Groupchat'
import axios from 'axios';

class Video extends Component {
  render() {
    return (
      <MDBContainer>
        <MDBCard>
          <MDBCardBody>
            <div className="embed-responsive embed-responsive-16by9">
              <iframe className="embed-responsive-item" src="/presentation.mp4" allowfullscreen></iframe>
            </div>
          </MDBCardBody>
        </MDBCard>
      </MDBContainer>
    )
  }
}
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogin: false,
      user: {}
    }
    this.logOut = this.logOut.bind(this);
    this.logIn = this.logIn.bind(this);
  }
  componentDidMount() {
    axios.get('/api/user/user').then((res)=>{
      this.setState({
        user:res.data.user,
        isLogin: true
      })
    }).catch((err) => {
      console.log(err.response.data);
    });
  }
  logIn() {
    axios.get('/api/user/user').then((res)=>{
      this.setState({
        user:res.data.user,
        isLogin: true
      })
    }).catch((err) => {
      console.log(err);
    });
  }
  logOut() {
    this.setState({isLogin:false,user:{}})
  }
  render() {
    return (
        <div>
          <Route path = '/' component={(props) => (<Navbar {...props} logOut={this.logOut} isLogin={this.state.isLogin}/>)}/>
          <Switch>
            <Route path = '/signin' component = {(props) => (<Login logIn={this.logIn} {...props} />)} />
            <Route path = '/signup' component = {Signup} />
            <Route path = '/User' component = {(props) => (<User user={this.state.user} socket={this.props.socket} {...props} />)} />
            <Route path = '/test' component = {Test} />
            <Route path = '/groupchat' component = {(props) => (<Groupchat user={this.state.user} socket={this.props.socket} {...props} />)} />
            <Route path = '/' component = {Video} />
          </Switch>
        </div>
    );
  }
}

export default App;
