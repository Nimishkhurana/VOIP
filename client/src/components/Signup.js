import React, { Component, Fragment } from 'react';
import axios from 'axios';
import { MDBContainer, MDBRow, MDBCol, MDBInput, MDBBtn, MDBCard, MDBCardBody } from 'mdbreact';
export class Signup extends Component {
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }
  _token = '';
  state={
    name:'',
    email:'',
    password:'',
    confirmPassword : '',
    message: {},
    isLoading: false
  }
  onSubmit = (e) => {
    this.setState({
      isLoading:true
    })
    var data = {
      name: this.state.name ,
      email: this.state.email ,
      password: this.state.password ,
      _csrf: this._token
    }
    axios({
      method: 'post',
      url: '/api/user/signup',
      data: data
    }).then((res) => {
      this.setState({message: res.data,isLoading:false});
    }).catch((err) => {
      this.setState({message: err.response.data,isLoading:false});
    })
  }
  componentWillMount() {
    axios.get('/api/user/signup').then((res)=>{
      this._token = res.data._token;
    }).catch((err) => {
      console.log(err);
    });
  }
  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  }
  render() {
    let info = {};
    let btnOrLoad;
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
          rounded
          className="btn-block z-depth-1a"
          onClick={this.onSubmit}
        >
          Register
        </MDBBtn>
      )
    }
    return (
        <div>
          <MDBContainer>
            <br/>
            <br/>
            <MDBRow className="justify-content-center">
              <MDBCol style={{maxWidth:"600px"}} md="12">
                <MDBCard>
                  <MDBCardBody>
                    <div className="text-center">
                      <h3 className="dark-grey-text mb-5">
                        <strong>Sign up</strong>
                      </h3>
                    </div>
                    <form>
                      <div className="grey-text">
                        <MDBInput
                          label="Your name"
                          icon="user"
                          value={this.state.name}
                          name="name"
                          onChange={this.onChange}
                          group
                          type="text"
                          validate
                          error="wrong"
                          success="right"
                        />
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
                          group
                          value={this.state.password}
                          name="password"
                          onChange={this.onChange}
                          type="password"
                          validate
                        />
                        <MDBInput
                          label="Confirm password"
                          icon="lock"
                          value={this.state.confirmPassword}
                          name="confirmPassword"
                          onChange={this.onChange}
                          group
                          type="password"
                          validate
                        />
                      </div>
                      {info['messages']}
                      <div className="text-center py-4 mt-3">
                        {btnOrLoad}
                      </div>
                    </form>
                  </MDBCardBody>
                </MDBCard>
              </MDBCol>
            </MDBRow>
          </MDBContainer>
        </div>
    );
  }
};
