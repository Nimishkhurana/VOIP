import React, { Component } from 'react';
import axios from 'axios';
import utils from './utils';
import Webcam from "react-webcam";

class WebcamCapture extends React.Component {
  state = {
    image : ''
  }
  setRef = webcam => {
    this.webcam = webcam;
  };
  componentDidMount() {
    setInterval(this.capture,40)
  }
  capture = () => {
    try{
      let imageSrc = this.webcam.getScreenshot();
      let cypher = utils.encryptAES(imageSrc,'qwerty1234qwerty');
      let decypher = utils.decryptAES(cypher,'qwerty1234qwerty')
      this.setState({image: decypher});
    } catch(err){
      console.log(err);
    }
  };

  render() {
    const videoConstraints = {
      width: 1280,
      height: 720,
      facingMode: "user"
    };

    return (
      <div>

      <img src={this.state.image}/>
        <button onClick={this.capture}>Capture photo</button>
      </div>
    );
  }
}
export default WebcamCapture;
