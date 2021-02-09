import { API_CONSTANTS } from './ApiConstants';

export class CamWebSocket
{

    public isVideoConnected = false;
    public dataChannel;
    private webSocketCon;
    private remoteVideo: HTMLVideoElement;
    private yourConn; 
    private stream;
    private connectedUser;


    constructor(inRemoteVideoPlayer)
    {
        this.remoteVideo = inRemoteVideoPlayer;
    }

    public createWebSocketConnection()
    {
        this.webSocketCon = new WebSocket(API_CONSTANTS.WEB_SOCKET_URL);
        
        //when we got a message from a signaling server 
        this.webSocketCon.onmessage = (msg) => { 
            console.log("Got message", msg.data);
            let data;
            try{
                data = JSON.parse(msg.data); 
                switch(data.type) { 
                    case "login": 
                        this.handleLogin(data.success); 
                        break; 
                    //when somebody wants to call us 
                    case "offer": 
                        this.handleOffer(data.offer, data.name); 
                        break; 
                    case "answer": 
                        this.handleAnswer(data.answer); 
                        break; 
                    //when a remote peer sends an ice candidate to us 
                    case "candidate": 
                        this.handleCandidate(data.candidate); 
                        break; 
                    case "leave": 
                        this.handleLeave(); 
                        break; 
                    default: 
                        break; 
                }
            }
            catch(e){
                console.log(e);
            }
        };
        
        this.webSocketCon.onerror = function (err) { 
            console.log("Got error", err); 
        };

        return new Promise((resolve, reject) => {
            this.webSocketCon.onopen = () => { 
                console.log("Connected to the signaling server"); 
                setTimeout(()=>{
                    this.send({ 
                        type: "login", 
                        name: "B" 
                     });
                     resolve();
                })
            };

        })
    }

    public handleLogin(success){
        if (success === false) { 
            alert("Ooops...try a different username"); 
        } else { 
            this.createPeer();
        }
    }

    public handleOffer(offer, name) { 
        this.connectedUser = name; 
        this.yourConn.setRemoteDescription(new RTCSessionDescription(offer));
         
        //create an answer to an offer 
        this.yourConn.createAnswer((answer) => { 
           this.yourConn.setLocalDescription(answer); 
             
           this.send({ 
              type: "answer", 
              answer: answer 
           }); 
             
        }, (error)=> { 
           alert("Error when creating an answer"); 
        }); 
    };

    //when we got an answer from a remote user
    public handleAnswer(answer) { 
        this.yourConn.setRemoteDescription(new RTCSessionDescription(answer)); 
    }
    
    //when we got an ice candidate from a remote user 
    public handleCandidate(candidate) { 
        this.yourConn.addIceCandidate(new RTCIceCandidate(candidate)); 
    }

    public handleLeave() { 
        // this.connectedUser = null;
        this.remoteVideo.src = null;
        this.isVideoConnected = false;
         
        // this.yourConn.close(); 
        // this.yourConn.onicecandidate = null; 
        // this.yourConn.onaddstream = null; 
    }

    public createPeer(){
        const configuration = { 
            "iceServers": [{ "urls": API_CONSTANTS.ICE_SERVER_URL }]
        }; 
			
        this.yourConn = new webkitRTCPeerConnection(configuration); 

		// Establish your peer connection using your signaling channel here
        
        //when a remote user adds stream to the peer connection, we display it 
        this.yourConn.onaddstream = (e) => { 
            this.remoteVideo.srcObject = e.stream;
            this.remoteVideo.setAttribute("style", "transform: rotate(90deg)"); //translateX(-164px)
            this.remoteVideo.setAttribute("width", "auto"); //translateX(-164px)
            this.remoteVideo.setAttribute("height", "auto"); //translateX(-164px)
            this.isVideoConnected = true;
            console.log("Stream added");
           
        };
        
        // Setup ice handling 
        this.yourConn.onicecandidate = (event) => { 
            if (event.candidate) { 
                this.send({ 
                    type: "candidate", 
                    candidate: event.candidate 
                }); 
            } 
        };  
        this.yourConn.ondatachannel = (event) => {
            console.log("ondatachannel");
            this.dataChannel = this.yourConn.createDataChannel('sendDataChannel', {});
            this.dataChannel = event.channel;
        ﻿  this.dataChannel.onopen = (event) => {
              this.dataChannel.send('Hi back!');
              console.log("DC open");
            }
            this.dataChannel.onmessage = function(event) {
              console.log(event.data);
            }
          }
    }

    public send(message){
        if (this.connectedUser) { 
            message.name = this.connectedUser; 
        }
        console.log(JSON.stringify(message));
        this.webSocketCon.send(JSON.stringify(message)); 
    }

    public dcSend(message) {
        this.dataChannel.send(message);
    }
}