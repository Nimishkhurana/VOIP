import React, { Component } from 'react';
import { MDBCol,MDBRow,MDBContainer,MBDIcon,MDBAnimation, MDBModal, MDBModalBody, MDBModalHeader, MDBModalFooter,MDBCard,MDBCardBody,MDBCardImage ,MDBCardText, MDBCardTitle, MDBBtn, MDBFormInline, MDBIcon } from "mdbreact";
import axios from 'axios';
import Webcam from 'react-webcam'
import JSEncrypt from 'jsencrypt';
import crypto from 'crypto';
import utils from './utils'

let intervalId = 0;

class User extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user : props.user,
      results: [],
      friend: {},
      videoCall: false,
      isLoading: true,
      sendVideo: false,
      notifications: [],
      image:'/defaultPic.png',
      promptForAudio: false,
      modal: false,
      modal2: false,
      modal3: false,
      call:{},
      play:false,
      inCall:{}
    }
    this.privateKey = '';
    this.publicKey = '';
    this.otherSecret = '';
    this.otherPublicKey = '';
    this.roomValue = '';
    this.secret = '';
    this.url = "/ringtone.mp3";
    this.audio = new Audio(this.url);
    this.audio.loop = true;
    this.sendRequest = this.sendRequest.bind(this);
    this.call = this.call.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.acceptRequest = this.acceptRequest.bind(this);
    this.viewprofile = this.viewprofile.bind(this);
    this.play = this.play.bind(this);
    this.sendAudio = this.sendAudio.bind(this);
    this.test = this.test.bind(this)
    this.sendSecret = this.sendSecret.bind(this)
    this.pause = this.pause.bind(this);
    this.cutCall = this.cutCall.bind(this);
    this.cutCallSocket = this.cutCallSocket.bind(this);
    this.inComeCall = this.inComeCall.bind(this);
    this.getNotification = this.getNotification.bind(this);
  }
  setRef = webcam => {
    this.webcam = webcam;
  };
  togglePrompt() {
    console.log('yo');
    this.setState({
      promptForAudio:!this.state.promptForAudio
    })
  }
  openPrompt() {
    this.setState({
      promptForAudio:true
    })
  }
  closePrompt() {
    this.setState({
      promptForAudio:false
    })
  }
  test(){
    console.log("my private = ",this.privateKey);
    console.log("my public = ",this.publicKey);
    console.log("otherSecret = "+this.otherSecret);
    console.log("otherPublic = " + this.otherPublicKey);
    console.log("room = " + this.roomValue);
    console.log("secret = " +this.secret);
  }
  sendSecret(id){
    let cypher = utils.encrypt(this.secret,this.otherPublicKey);
    axios({
      method: 'post',
      url: '/api/secret',
      data: {
        id: id,
        key: this.publicKey,
        cypher: cypher
      }
    }).then((res) => {
      console.log('/api/secret');
      this.test();
    }).catch((err) => {
      console.log(err.response);
    })
  }
  play() {
    if(this.state.play === true) {
      console.log("playing");
      this.audio.currentTime = 0.0;
      this.audio.play();
    }
  }
  pause() {
    if(this.state.play === false) {
      console.log("pausing");
      this.audio.currentTime = 0.0;
      this.audio.pause();
    }
  }
  cutCall(id) {
    console.log("cut");
    this.setState({
      inCall: {},
      modal3: false,
      modal2: false,
      play: false
    });
    clearInterval(intervalId);
    axios.get('/api/endcall?id='+id).then((res)=>{console.log(res); this.pause();}).catch((err)=>{console.log(err.response); this.pause();});
  }
  cutCallSocket() {
    console.log("cut");
    this.setState({
      inCall: {},
      modal3: false,
      modal2: false,
      play: false
    });
    clearInterval(intervalId)
    this.pause();
  }
  inComeCall(data){
    this.otherPublicKey = data.pubKey;
    this.roomValue = data.room;
    this.setState({
      inCall: data.from,
      modal3: true,
      play:true,
      videoCall:data.isVideo
    });
    this.play();
  }
  stopUpdate() {
    clearInterval(this.update);
  }
  componentWillUnmount() {
    this.stopUpdate();
  }
  getNotification() {
    axios.get('/api/notification').then((result) => {
      this.setState({
        notifications: result.data.user
      })
    }).catch((err) => {
      console.log(err);
    })
  }
  call(item,videoCall = false) {
    this.setState({
      call:item,
      modal2: !this.state.modal2,
      videoCall: videoCall
    });
    let obj = {
      id: item._id,
      roomValue: this.roomValue,
      key: this.publicKey,
      isVideo: videoCall
    };
    axios({
      method: 'post',
      url: '/api/call',
      data: obj
    }).then((res) => {
      console.log(res);
    }).catch((err) => {
      console.log(err.response);
    })
  }
  viewprofile(id) {
    axios.get('/api/viewprofile?id='+id).then((result) => {
      this.setState({
        friend:result.data
      })
      console.log(this.state.friend);
      this.toggle();
    }).catch((err) => {
      console.log(err);
    })
  }
  updateUser() {
    axios.get('/api/isonline').then((result)=>{
      let user = this.state.user;
      user.friends = result.data.user.friends;
      this.setState({
        user:user
      })
    }).catch((err) => {
      console.log(err);
    })
  }
  sendRequest(id) {
    axios.get("/api/sendRequest?id="+id).then((result) => {
      let friend = this.state.friend;
      friend.canSendReq = false;
      this.setState({
        friend:friend
      })
    }).catch((err)=> {
      console.log(err.response);
    })
  }
  acceptRequest(id,name,pic,_id) {
    let newFriend = {
      _id :_id,
      name: name,
      profilePic:pic
    }
    axios.get("/api/accept?id="+id).then((result) => {
      this.getNotification();
      let user = this.state.user;
      user.friends.push(newFriend);
      this.setState({
        user:user
      })
    }).catch((err)=> {
      console.log(err.response);
    })
  }
  componentDidMount() {
    this.getNotification();
    this.crypt = new JSEncrypt({default_key_size: 512});
    this.privateKey = this.crypt.getPrivateKey();
    this.publicKey = this.crypt.getPublicKey();
    this.secret = utils.randomString();
    this.roomValue = utils.randomString(32);
    this.setState({
      isLoading:false
    })
    this.props.socket.on('calling', (data) => {this.inComeCall(data); });
    this.props.socket.on('getCypher', (data) => {
      console.log(data);
      this.otherPublicKey = data.key;
      this.otherSecret = utils.decrypt(data.cypher,this.privateKey);
      let cypher = utils.encrypt(this.secret,this.otherPublicKey);
      let obj =  {
        id: data.id,
        cypher: cypher
      }
      axios({
        method: 'post',
        url: '/api/exchange',
        data: obj
      }).then((res) => {
        this.openPrompt();
      }).catch((err) => {
        console.log(err.response);
      });
    });
    let socket = this.props.socket;
    socket.on('cypherShare', (data) => {
      this.otherSecret = utils.decrypt(data.cypher,this.privateKey);
      this.openPrompt();
    });
    this.props.socket.on('end', (msg) => {this.cutCallSocket()});
  }
  sendAudio() {
    let socket = this.props.socket
    this.setState({
      play:false
    })
    this.audio.currentTime = 0.0;
    this.audio.pause();
    this.closePrompt();
    let room = this.roomValue;
    let secret = this.otherSecret;
    if(this.state.videoCall) {
      let id = setInterval(()=>{
        try{
          let imageSrc = this.webcam.getScreenshot();
          let cypher = utils.encryptAES(imageSrc,this.otherSecret);
          socket.emit(room,{st:cypher});
        } catch(err) {
          console.log(err);
          clearInterval(id)
        }
      },200);
      socket.on(room,(stream)=>{
        try {
          let photo = utils.decryptAES(stream.st,this.secret);
          this.setState({image: photo});
        } catch(err) {
          console.log(err);
        }
      })
    } else {
      navigator.mediaDevices.getUserMedia({audio:{
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
      }}).then(function(stream) {
          let mediaRecorder = new MediaRecorder(stream);
          mediaRecorder.start();
          mediaRecorder.addEventListener('dataavailable',(event) => {
            utils.blobToBase64(event.data,(base64String)=>{
              let st = utils.encryptAES(base64String,secret);
              socket.emit(room,{st:st});
            })
          })
          mediaRecorder.addEventListener('stop',(event) => {
            mediaRecorder.start();
          })
          intervalId = setInterval(()=>{
            mediaRecorder.stop()
          },1000);
          console.log("=================================");
          console.log(intervalId);
        })
        .catch(function(err) {
          console.log(err);
        });
        socket.on(this.roomValue,(stream)=>{
          console.log(stream.st);
          try {
            let b64st = utils.decryptAES(stream.st,this.secret);
            let blob = utils.b64toBlob(b64st);
            const audioUrl = URL.createObjectURL(blob);
            const audio = new Audio(audioUrl);
            audio.play();
          } catch(err) {
            console.log(err);
          }
        })
    }
  }
  onChange = (e) => {
    if(e.target.value.length >= 3) {
      axios.get('/api/search?name='+e.target.value).then((result) => {
        this.setState({ results: result.data.users });
      }).catch((err) => {
        this.setState({ results: [{_id:0, email:'',profilePic:'/record.png',name:'No Record Found'}] });
      })
    } else {
      this.setState({ results: [] });
    }
  }
  toggle = () => {
    this.setState({
      modal: !this.state.modal
    });
  }
  toggle2 = () => {
    this.setState({
      modal2: !this.state.modal2
    });
  }
  render() {
    const videoConstraints = {
      width: 200,
      height: 200,
      facingMode: "user"
    };
    console.log(this.roomValue);
    let modal;
    if(Object.keys(this.state.friend).length > 0) {
      let button;
      if(this.state.friend.isFriend){
        button = (
          <MDBBtn color="success">call</MDBBtn>
        )
      } else {
        if(this.state.friend.canSendReq) {
          button = (
            <MDBBtn onClick={() => {this.sendRequest(this.state.friend.user._id)}} color="secondary">Send Request</MDBBtn>
          )
        } else {
          button = (
            <MDBBtn disabled color="dark">Send Request</MDBBtn>
          )
        }
      }
      modal = (
        <MDBModal isOpen={this.state.modal} toggle={this.toggle} centered>
          <MDBModalHeader toggle={this.toggle}>{this.state.friend.user.name}</MDBModalHeader>
          <MDBModalBody >
            <MDBCardImage className="justify-content-center"  className="img-fluid" src={this.state.friend.user.profilePic} waves />
          </MDBModalBody>
          <MDBModalFooter>
            {button}
          </MDBModalFooter>
        </MDBModal>
      )
    } else {
      modal = (
        <div></div>
      )
    }
    let search = [];
    for(let item of this.state.results) {
      search.push((
          <MDBCardBody key={item._id}>
            <img style={{maxWidth:"50px"}} src={item.profilePic}/>{item.name}
            <MDBBtn style={{borderRadius:"50px"}} className="btn-sm float-right" color="danger" href={"mailto:"+item.email}>{item.email}</MDBBtn>
            <MDBBtn style={{borderRadius:"50px"}} className="btn-sm float-right" color="primary" onClick={() => {this.viewprofile(item._id)}}>View Profile</MDBBtn>
          </MDBCardBody>
      ))
    }
    let notification = [];
    for(let item of this.state.notifications) {
      notification.push((
        <MDBCardBody key={item._id}>
          <img style={{maxWidth:"50px"}} src={item.from.profilePic}/>{item.from.name}
          <MDBBtn style={{borderRadius:"50px"}} className="btn-sm float-right" color="primary" onClick={() => {this.acceptRequest(item._id,item.from.name,item.from.profilePic,item.from._id)}}>Accept Request</MDBBtn>
        </MDBCardBody>
      ))
    }
    if(Object.keys(this.state.user).length > 0 && this.state.isLoading === false) {
      let friends = [];
      for(let item of this.state.user.friends) {
        if(item.isOnline){
          friends.push((
            <MDBCardBody key={item._id}>
              <img style={{maxWidth:"50px"}} src={item.profilePic}/>{item.name}
              <span style={{color:'green'}}> online</span>
              <MDBBtn className="btn-sm float-right" color="success" onClick={() => {this.call(item,false)}}>Call</MDBBtn>
              <MDBBtn className="btn-sm float-right" color="success" onClick={() => {this.call(item,true)}}>Video Call</MDBBtn>
            </MDBCardBody>
          ))
        } else {
          friends.push((
            <MDBCardBody key={item._id}>
              <img style={{maxWidth:"50px"}} src={item.profilePic}/>{item.name}
              <span style={{color:'red'}}> offline</span>
              <MDBBtn className="btn-sm float-right" color="success" onClick={() => {this.call(item,false)}}>Call</MDBBtn>
              <MDBBtn className="btn-sm float-right" color="success" onClick={() => {this.call(item,true)}}>Video Call</MDBBtn>
            </MDBCardBody>
          ))
        }
      }
      let imageOrCall = '';
      if(this.state.videoCall === true) {
        console.log('true');
        imageOrCall = (
          <div>

            <img src={this.state.image}/>
              <Webcam
              audio={false}
              height={350}
              ref={this.setRef}
              screenshotFormat="image/jpeg"
              width={350}
              videoConstraints={videoConstraints}
            />
          </div>
        )
      } else {
        console.log('false');
        imageOrCall = (
          <MDBCardImage className="justify-content-center"  className="img-fluid" src='/defaultPic.png' waves />
        )
      }
      let modalCall;
      if(Object.keys(this.state.call).length > 0) {
        let imageOrCall2 = (<MDBCardImage className="justify-content-center"  className="img-fluid" src='/defaultPic.png' waves />);
        if(this.state.videoCall === true) {
          console.log('true');
          imageOrCall2 = (
            <div>
              <Webcam
            audio={false}
            height={350}
            ref={this.setRef}
            screenshotFormat="image/jpeg"
            width={350}
            videoConstraints={videoConstraints}
            />
              <img alt='/defaultPic.png' src={this.state.image}/>
            </div>
          )
        }
        modalCall = (
          <MDBContainer>
            <MDBModal  isOpen={this.state.modal2} toggle={()=>{this.cutCall(this.state.call._id)}} side position="bottom-right">
              <MDBAnimation className="slow" type="flash"  infinite>
                <MDBModalHeader style={{color:"green"}} toggle={this.toggle2}>Calling... {this.state.call.name}</MDBModalHeader>
              </MDBAnimation>
              <MDBModalBody>
                {imageOrCall2}
                <MDBAnimation type="tada" infinite>
                <MDBBtn size="block" style={{borderRadius:"5%"}} onClick={()=>{this.cutCall(this.state.call._id)}} color="danger" >
                    <i className="fa fa-lg fa-phone-slash"/>
                  </MDBBtn>
                    </MDBAnimation>
              </MDBModalBody>
            </MDBModal>
          </MDBContainer>
        )
      }
      let modalCallIn;
      if(Object.keys(this.state.inCall).length > 0) {
        modalCallIn = (
          <MDBContainer>
            <MDBModal  isOpen={this.state.modal3} toggle={()=>{this.setState({modal3:!this.state.modal3}); this.stop();}} side position="bottom-right">
              <MDBAnimation className="slow" type="flash"  infinite>
                <MDBModalHeader style={{color:"green"}} toggle={this.toggle3}>Incomming Call... {this.state.inCall.name}</MDBModalHeader>
              </MDBAnimation>
              <MDBModalBody>
                {imageOrCall}
                <MDBAnimation type="tada" infinite>
                <MDBBtn size="block" style={{borderRadius:"5%"}} onClick={()=>{this.cutCall(this.state.inCall._id)}} color="danger" >
                    <i className="fa fa-lg fa-phone-slash"/>
                  </MDBBtn>
                    </MDBAnimation>
              </MDBModalBody>
              <MDBModalFooter>
                <MDBCardBody >
                  <MDBAnimation className="slow" type="bounce" infinite>
                    <MDBBtn className="float-left" style={{borderRadius:"30%"}} onClick={()=>{this.sendSecret(this.state.inCall._id)}} color="success" >
                      <i className="fa fa-lg fa-phone-volume"/>
                    </MDBBtn>
                  </MDBAnimation>
                  <MDBBtn className="float-right" style={{borderRadius:"30%"}} onClick={()=>{this.cutCall(this.state.inCall._id)}} color="primary" >
                    <i className="fa fa-lg fa-microphone-alt-slash"/>
                  </MDBBtn>
                </MDBCardBody>
              </MDBModalFooter>
            </MDBModal>
          </MDBContainer>
        )
      }
      return (
          <div className="container">
            <br/>
            <MDBCardTitle className="text-center">
              Welcome {this.state.user.name}
            </MDBCardTitle>
            <MDBRow className="justify-content-center">
            <MDBCol md="12">
              <MDBFormInline onSubmit={(e)=>{ e.preventDefault(); }} className="md-form">
                <MDBIcon icon="search" />
                <input onChange={this.onChange} name="name" className="form-control form-control-sm ml-3 w-75" type="text" placeholder="Find Friend" aria-label="Search" />
              </MDBFormInline>
              <MDBCard>
                {search}
              </MDBCard>
            </MDBCol>
              <MDBCol md="6">
                <MDBCardTitle>Notifications</MDBCardTitle>
                <MDBCard>
                  {notification}
                </MDBCard>
              </MDBCol>
              <br/>
              <MDBCol md="6">
                <MDBCardTitle>Friends</MDBCardTitle>
                <MDBCard>
                  {friends}
                </MDBCard>
              </MDBCol>

            </MDBRow>
            {modal}
            {modalCall}
            {modalCallIn}
            <MDBBtn onClick={this.test}>
              test
            </MDBBtn>
            <MDBContainer>
              <MDBModal isOpen={this.state.promptForAudio} toggle={this.togglePrompt}>
                <MDBModalHeader toggle={this.togglePrompt}>Confirm!</MDBModalHeader>
                <MDBModalBody>
                  <p>press Ok To Start Call</p>
                </MDBModalBody>
                <MDBModalFooter>
                  <MDBBtn onClick={this.sendAudio} color="primary">Ok</MDBBtn>
                </MDBModalFooter>
              </MDBModal>
            </MDBContainer>
          </div>
      );
    } else {
      return (
        <div className="d-flex justify-content-center">
          <br/>
          <p className="text-monospace">Generating Rsa Keys</p>
          <div className="spinner-border text-info" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )
    }

  }
}

export default User;
