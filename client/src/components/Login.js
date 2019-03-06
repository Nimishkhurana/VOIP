import React, { Component, Fragment } from 'react';
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBInput, MDBBtn, MDBModalFooter } from 'mdbreact';
import axios from 'axios';
import { Link } from 'react-router-dom';
class Login extends Component {
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }
  _token = '';
  state = {
    email:'',
    password: '',
    message: {},
    isLoading: false
  }
  componentWillMount() {
    axios.get('/api/user/signin').then((res)=>{
      this._token = res.data._token;
    }).catch((err) => {
      console.log(err);
    });
  }
  onSubmit = (e) => {
    this.setState({
      isLoading:true
    })
    var data = {
      email: this.state.email ,
      password: this.state.password ,
      _csrf: this._token,
      message: {},
    }
    axios({
      method: 'post',
      url: '/api/user/signin',
      data: data
    }).then((res) => {
      this.props.logIn();
      this.props.history.replace('/user');
    }).catch((err) => {
      this.setState({isLoading:false,message: err.response.data});
    })
  }
  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  }
  render() {
    let info = {}
    if( !(Object.keys(this.state.message).length === 0) ) {
      var type = Object.keys(this.state.message)[0];
      info = {
        messages: (
          <Fragment>
            <div className={"alert alert-"+type}>
              <strong>{this.state.message[type]}</strong>
            </div>
          </Fragment>
        )
      }
    }
    let btnOrLoad;
    if(this.state.isLoading) {
      btnOrLoad = (
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      )
    } else {
      btnOrLoad = (
        <MDBBtn
          type="button"
          gradient="blue"
          onClick={this.onSubmit}
          rounded
          className="btn-block z-depth-1a"
        >
          Sign in
        </MDBBtn>
      )
    }
    return (
      <MDBContainer>
      <br/>
      <br/>
    <MDBRow className="justify-content-center">
      <MDBCol style={{maxWidth:"600px"}} md="12">
        <MDBCard>
          <MDBCardBody className="mx-4">
            <div className="text-center">
              <h3 className="dark-grey-text mb-5">
                <strong>Sign in</strong>
              </h3>
            </div>
            <div className="grey-text">
            <MDBInput
              label="Your email"
              icon="envelope"
              group
              value={this.state.email}
              name="email"
              onChange={this.onChange}
              type="email"
              validate
              error="wrong"
              success="right"
            />
          <MDBInput
              label="Your password"
              icon="lock"
              name="password"
              value={this.state.password}
              onChange={this.onChange}
              group
              type="password"
              validate
            />
        </div>
            <p className="font-small blue-text d-flex justify-content-end pb-3">
              Forgot
              <a href="#!" className="blue-text ml-1">

                Password?
              </a>
            </p>
            {info['messages']}
            <div className="text-center mb-3">
              {btnOrLoad}
            </div>

          </MDBCardBody>

          <MDBModalFooter className="mx-5 pt-3 mb-1">
            <p className="font-small grey-text d-flex justify-content-end">
              Not a member?
              <Link to="/signup" className="blue-text ml-1">

                Sign Up
              </Link>
            </p>
          </MDBModalFooter>
        </MDBCard>
      </MDBCol>
    </MDBRow>
  </MDBContainer>
    );
  }
};


export default Login;
