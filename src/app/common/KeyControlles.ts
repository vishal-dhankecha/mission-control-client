import { WSRequestModel } from './../models/ws-request-model';
import { EventEmitter } from '@angular/core';
export class KeyControls{
    public wsRequest = new WSRequestModel();
    public updateControls = new EventEmitter<any>();
    public updateDCControls = new EventEmitter<any>();

    private keyLock = false;
    private controlLimit = 200;
    // private controlTimer = 500;
   
    constructor(inWsRequestModel: WSRequestModel ) {
        this.wsRequest = inWsRequestModel;
    }
    initListeners() {
        document.body.addEventListener("keydown",(e) => {
            this.handelKeyDownEvents(e);
            console.log(e);
        }); 
        document.body.addEventListener("keyup",(e) => {
            this.handelKeyEvents(e);
        }); 
    }

    handelKeyDownEvents(e: KeyboardEvent): any {
      if(!this.keyLock)
      {
        this.keyLock = true;
        this.movementControls(e, false);    
        this.updateControls.emit();        
      }
    }
    handelKeyEvents(e: KeyboardEvent): any {
        switch(e.keyCode) {
          case 65: {
            this.wsRequest.r1 = this.wsRequest.r1 >= 1500 ? 1000 : 1500;
            break;
          }
          case 80: {
            if (this.wsRequest.r1 == 1500 && this.wsRequest.r2 == 1000) {
              this.wsRequest.r2 = 1500;
            } else if(this.wsRequest.r1 == 1500 && this.wsRequest.r2 == 1500) {
              this.wsRequest.r2 = 1000;
            }
            break;
          }
          case 107: {
            if (this.wsRequest.rt < 2000) {
              this.wsRequest.rt += 25;
            }
            break;
          }
          case 109: {
            if (this.wsRequest.rt > 1000) {
              this.wsRequest.rt -= 25;
            }
            break;
          }
          case 71: {
            this.updateDCControls.emit("KeyControls")
            break;
          }
        }
        this.movementControls(e, true);    
        this.updateControls.emit();
        this.keyLock = false;
    }
    
    private movementControls(e:KeyboardEvent, keyUp: boolean = true) {
        switch(e.keyCode) {
            case 104: {
              //pitch Up
              this.wsRequest.rp += keyUp ?  this.controlLimit : (-this.controlLimit);
              break;
            }
            case 98: {
              //pitch down
              this.wsRequest.rp -= keyUp ?  this.controlLimit : (-this.controlLimit)
              break;
            }
            case 100: {
              //roll left
              this.wsRequest.rr += keyUp ?  this.controlLimit : (-this.controlLimit)
              break;
            }
            case 102: {
              //roll right
              this.wsRequest.rr -= keyUp ?  this.controlLimit : (-this.controlLimit)
              break;
            }
            case 37: {
              //yaw left
              this.wsRequest.ry += keyUp ?  this.controlLimit : (-this.controlLimit)
              break;
            }
            case 39: {
              //yaw right
              this.wsRequest.ry -= keyUp ?  this.controlLimit : (-this.controlLimit)
              break;
            }
            
        }
    }
}