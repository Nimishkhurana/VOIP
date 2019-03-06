import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import logo from '../assets/images/logo.jpg'
import { MDBNavbar, MDBNavbarBrand, MDBNavbarNav, MDBNavItem, MDBNavLink, MDBNavbarToggler, MDBCollapse } from "mdbreact";
class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
    isOpen: false,
  }
  this.logout = this.logout.bind(this);
}
logout = () => {
  axios.get('/api/user/logout').then((res)=>{
    this.props.logOut();
    this.props.history.replace('/signin')
  }).catch((err)=>{
    console.log(err);
  })
}
toggleCollapse = () => {
  this.setState({ isOpen: !this.state.isOpen });
}
render() {
  var userHandle;
  if(!this.props.isLogin) {
    userHandle = (
      <MDBNavbarNav right>
        <MDBNavItem>
          <MDBNavLink to="signin">Sign In</MDBNavLink>
        </MDBNavItem>
        <MDBNavItem>
          <MDBNavLink to="signup">Sign up</MDBNavLink>
        </MDBNavItem>
      </MDBNavbarNav>
    )
  } else {
    userHandle = (
      <MDBNavbarNav right>
        <MDBNavItem>
          <MDBNavLink to="user">Profile</MDBNavLink>
        </MDBNavItem>
        <MDBNavItem>
          <MDBNavLink onClick={this.logout} to="#">Logout</MDBNavLink>
        </MDBNavItem>
      </MDBNavbarNav>
    )
  }
  return (
    <MDBNavbar color="primary-color" dark expand="md">
      <div className="container">
        <MDBNavbarBrand>
          <strong className="white-text"><img style={{maxWidth:"50px"}} src={logo} alt={logo}/> E2Ecalls</strong>
        </MDBNavbarBrand>
        <MDBNavbarToggler onClick={this.toggleCollapse} />
        <MDBCollapse id="navbarCollapse3" isOpen={this.state.isOpen} navbar>
          <MDBNavbarNav left>
            <MDBNavItem>
              <MDBNavLink to="">Home</MDBNavLink>
            </MDBNavItem>
            <MDBNavItem>
              <MDBNavLink to="/groupchat">Group Chat</MDBNavLink>
            </MDBNavItem>
            <MDBNavItem>
              <MDBNavLink to="/test">API</MDBNavLink>
            </MDBNavItem>
          </MDBNavbarNav>
              {userHandle}
        </MDBCollapse>
        </div>
    </MDBNavbar>
    );
  }
};

Navbar.propTypes = {
  isLogin: PropTypes.bool,
  logOut: PropTypes.func
};

export default Navbar;
