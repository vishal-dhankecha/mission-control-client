import { JoysticChange as JoystickChange } from './components/joystic/joystick.component';
import { WSRequestModel } from './models/ws-request-model';
import { WSResponseModel } from './models/ws-response-model';
import { HttpResponseModel } from './models/http-response-model';
import { ServerStatusModel, ServerStatusEnum } from './models/server-status-model';
import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONSTANTS } from './common/ApiConstants';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CamWebSocket } from './common/CamWebSocket';
import { KeyControls } from './common/KeyControlles';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('mapRef', {static: true }) mapElement: ElementRef;
  public serverStatus: ServerStatusModel = new ServerStatusModel();
  public get isConnected():boolean {
    return !!this.serverStatus &&
      this.serverStatus.status == ServerStatusEnum.ONLINE &&
      this.serverStatus.ip != "";
  }
  public connecting = false;
  
  
  public webSocketConnection;
  public wsResponse = new WSResponseModel();
  public wsRequest = new WSRequestModel();

  public camWebSocketManager: CamWebSocket;
  public remoteVideo:Element;

  public keyControls = new KeyControls(this.wsRequest);

  public viewVariables = new ViewVariables();
  public isDCSignal = false;

  public get time(): string
  {
    if(this.wsResponse){
      const date = new Date(this.wsResponse.timeStamp);
      return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    }
  }

  public get isVideoConnected() {
    return this.camWebSocketManager && this.camWebSocketManager.isVideoConnected;
  }

  constructor(
    private httpClient: HttpClient,
    private sanitization: DomSanitizer
  )
  {
    //
  }
  public ngOnInit()
  {
    // this.serverStatus.status = ServerStatusEnum.ONLINE;
    // this.serverStatus.ip= "localhost";
    // this.serverStatus.port = "8999";
    // this.connectWebSocketServer();
    this.getServerStatus();
    // this.webrtc();
    this.keyControls.initListeners();
    this.keyControls.updateControls.subscribe(this.sendSignal.bind(this));
  }

  public ngOnDestroy()
  {
    this.camWebSocketManager.handleLeave();
  }
  public rightJoystickChange(event: JoystickChange)
  {
    this.wsRequest.rt = event.x;
    this.wsRequest.ry = event.y;
    this.sendDCSignal();
  }

  public leftJoystickChange(event: JoystickChange)
  {
    this.wsRequest.rp = event.x;
    this.wsRequest.rr = event.y;
    this.sendDCSignal();
  }

  public arm() {
    this.wsRequest.r1 = this.wsRequest.r1 >= 1500 ? 1000 : 1500;
    this.sendDCSignal();
  }
  public phold() {
    if (this.wsRequest.r1 == 1500 && this.wsRequest.r2 == 1000) {
      this.wsRequest.r2 = 1500;
    } else if(this.wsRequest.r1 == 1500 && this.wsRequest.r2 == 1500) {
      this.wsRequest.r2 = 1000;
    }
    this.sendDCSignal();
  }
  public radioChang(event)
  {
    console.log(event);
  }
  public ngAfterViewInit()
  {
    this.remoteVideo = document.querySelector('#remoteVideo');
    this.remoteVideo.setAttribute("height", document.body.clientHeight + "px");
    this.remoteVideo.setAttribute("width", document.body.clientWidth + "px");
    this.camWebSocketManager = new CamWebSocket(this.remoteVideo); 
    this.camWebSocketManager.createWebSocketConnection();
    this.keyControls.updateDCControls.subscribe(() => {
      this.camWebSocketManager.dcSend("Keycode");
    });
    // this.renderMap();
  }
  public getVideoPosition(): number {
    const videoHeight = document.getElementById("remoteVideo").clientHeight;
    const containerHeight = document.getElementsByClassName("video-container")[0].clientHeight;
    return Math.round((containerHeight - videoHeight) / 2);
  }
  public getServerStatus()
  {
    const processResponse = (res: HttpResponseModel) =>
    {
      if(!!res && res.statusCode == 0)
      {
        this.serverStatus = res.responseObject[0];
      }
      console.log(this.serverStatus);
      this.connecting = false;
    }
    
    this.serverStatus.status = ServerStatusEnum.ONLINE;
    this.serverStatus.ip = API_CONSTANTS.STATUS_SERVER_END_POINT;
    // this.serverStatus.port = ";
    this.connectWebSocketServer();
   
    // this.connecting = true;    
    // this.httpClient.get(API_CONSTANTS.GET_SERVER_STATUS)
    //   .toPromise()
    //   .then(processResponse)
    //   .then(this.connectWebSocketServer.bind(this));
  }

  public connectWebSocketServer()
  {
    try
    {
      this.webSocketConnection = new WebSocket("ws://"+ this.serverStatus.ip);

      this.webSocketConnection.onopen = function () {
      // this.webSocketConnetion.send('Ping'); // Send the message 'Ping' to the server
      };

      this.webSocketConnection.onerror = (error) => {
        console.log('WebSocket Error ');
        console.log(error);
      };

      // Log messages from the server
      this.webSocketConnection.onmessage = (e) => {
        try{
          this.wsResponse = JSON.parse(e.data)
          this.setViewVariables();
          // console.log(this.wsResponse);
        } catch(e)
        {
          console.error(e.data);
        }
      };
    }
    catch(e) {
      console.error(e)
    }
  }
  private setViewVariables() {
    if (this.wsResponse.arduinoResponseModel.te2 < 50) {
      this.viewVariables.satellite = this.wsResponse.arduinoResponseModel.te2;
    }
    this.viewVariables.speed = this.wsResponse.arduinoResponseModel.spe;
    this.viewVariables.height = this.wsResponse.arduinoResponseModel.al;
  }

  public enableVideo()
  {
    if(this.camWebSocketManager.isVideoConnected) {
      this.camWebSocketManager.send({ 
        type: "leave" 
     }); 
      this.camWebSocketManager.handleLeave();
    } else {
      try {
        // this.camWebSocketManager.createWebSocketConnection()
        // .then(() => {
          this.wsRequest.command = "sendOffer";
          this.wsRequest.commandPayload = "B";
          this.sendSignal();
          this.wsRequest.command = null;
          this.wsRequest.commandPayload = null;
        // });
      }
      catch(e)
      {
        console.log(e);
      }
    }
  }

  public setServerStatus(){
    this.serverStatus.port = "8999";
    this.httpClient.post(API_CONSTANTS.GET_SERVER_STATUS, this.serverStatus)
      .toPromise()
      .then((res)=>{
        console.log(res);
      });
  }

  public getBluetoothStatus():string {
    switch(this.wsResponse.bluetoothConnectionStatus)
    {
      case "Bluetooth: connecting..":
        return "bluetooth_searching";
      case "Bluetooth: connected":
        return "bluetooth_connected";
      default:
        return "bluetooth_disabled";
    }
  }

  public getBatteryVoltage(): string {
    if (this.isConnected && !!this.wsResponse && !!this.wsResponse.arduinoResponseModel && !!this.wsResponse.arduinoResponseModel.voltage)
    {
      return this.wsResponse.arduinoResponseModel.voltage + "V";
    }
    return ""
  }
  public sendSignal() {
    this.webSocketConnection.send(JSON.stringify(this.wsRequest));
  }
  public sendDCSignal() {
    if(this.isDCSignal) {
      this.camWebSocketManager.dcSend(JSON.stringify(this.wsRequest));
    } else {
      this.webSocketConnection.send(JSON.stringify(this.wsRequest));
    }
  }
  public renderMap() {
    

    window['initMap'] = () => {
      this.loadMap();     
    }
    if(!window.document.getElementById('google-map-script')) {
      var s = window.document.createElement("script");
      s.id = "google-map-script";
      s.type = "text/javascript";
      s.src = API_CONSTANTS.GOOGLE_MAP_API;
  
      window.document.body.appendChild(s);
    } else {
      this.loadMap();
    }
  }

  public loadMap = () => {
    var map = new window['google'].maps.Map(this.mapElement.nativeElement, {
      center: {lat: 24.5373, lng: 81.3042},
      zoom: 8
    });
  
    var marker = new window['google'].maps.Marker({
      position: {lat: 24.5373, lng: 81.3042},
      map: map,
      title: 'Hello World!',
      draggable: true,
      animation: window['google'].maps.Animation.DROP,
    });
  
    var contentString = '<div id="content">'+
    '<div id="siteNotice">'+
    '</div>'+
    '<h3 id="thirdHeading" class="thirdHeading">W3path.com</h3>'+
    '<div id="bodyContent">'+
    '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>'+
    '</div>'+
    '</div>';
  
    var infoWindow = new window['google'].maps.InfoWindow({
      content: contentString
    });
  
      marker.addListener('click', function() {
        infoWindow.open(map, marker);
      });
  
  }
}

class ViewVariables {
  satellite = 0;
  speed = 0;
  height = 0;
}