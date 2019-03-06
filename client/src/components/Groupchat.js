import React, { Component, Fragment } from 'react';
import { MDBListGroup, MDBListGroupItem, MDBCol,MDBCardText, MDBFormInline, MDBIcon, MDBBtn, MDBCard, MDBCardBody,MDBCardFooter, MDBCardImage, MDBCardTitle, MBDRow, MBDContainer } from 'mdbreact';
import utils from './utils'
class Groupchat extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      room : 'No Room Joined',
      message: ''
    }
    this.messages = [];
    this.onChangeMess = this.onChangeMess.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.onChange = this.onChange.bind(this);
    this.join = this.join.bind(this);
  }
  onChange = (e) => {
    this.setState({
      room: e.target.value
    })
  }
  sendMessage() {
    this.props.socket.emit(this.state.room,{message:this.state.message,userName:this.props.user.name});
    this.setState({
      message:''
    })
  }
  onChangeMess = (e) => {
    this.setState({
      message: e.target.value
    })
  }
  join() {
    this.props.socket.on(this.state.room,(mes)=>{
      this.messages.push(mes);
    })
    this.props.socket.emit(this.state.room,{message: 'hi i am '+this.props.user.name});
  }
  render() {
    var messages = [];
    for(var mes of this.messages) {
      messages.push((
        <div key={utils.randomString(32)}>
        <h1>{mes.name}</h1>
        <p>{mes.messages}</p>
        </div>
      ))
    }
    if(!this.props.user) {
      return (
        <div>You need to signin</div>
      )
    } else {
      return (
        <div className="container">
          <MDBFormInline className="md-form">
            <MDBIcon icon="search" />
              <input onChange={this.onChange} className="form-control form-control-sm ml-3 w-75" type="text" placeholder="Type Room name" aria-label="Search" /><MDBBtn style={{borderRadius:"50%"}} onClick={this.join} color="primary">Join Room</MDBBtn>
            </MDBFormInline>
            <MDBCol>
            <MDBCard>
              <MDBCardBody>
                {messages}
              </MDBCardBody>
              <MDBCardFooter>
                <input onChange={this.onChangeMess} className="form-control form-control-sm ml-3 w-75" type="text" placeholder="Message" aria-label="Search" /><MDBBtn style={{borderRadius:"5%"}} onClick={this.sendMessage} color="success">send Message</MDBBtn>
              </MDBCardFooter>
            </MDBCard>
          </MDBCol>
        </div>


      )
    }
  }
}


export default Groupchat;
