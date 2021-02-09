import { Component, OnInit, Input, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { randomNumber } from 'src/app/common/Utils';

@Component({
  selector: 'app-joystick',
  templateUrl: './joystick.component.html',
  styleUrls: ['./joystick.component.scss']
})
export class JoystickComponent implements OnInit, AfterViewInit {
  @Input("throttleControl") throttleControl:boolean = false;

  @Output() change = new EventEmitter<JoysticChange>();
  xInterval;
  yInterval;

  topId = "top-" + randomNumber();
  bottomId = "bottom-" + randomNumber();
  leftId = "left-" + randomNumber();
  rightId = "right-" + randomNumber();

  isTopKeyDisabled = false;
  isBottomKeyDisabled = false;
  isLeftKeyDisabled = false;
  isRightKeyDisabled = false;

  public x = 1500;
  public y = 1500;

  private sensitivity = 500;

  constructor() {
    
  }

  ngOnInit() {
    if (this.throttleControl) {
      this.x = 1000;
    }
  }

  public ngAfterViewInit() {
  }

  public topKeyDown(){
    this.isBottomKeyDisabled = true;
    if (this.x < 2000) {
      this.x += 100;
      this.emmitChage();
    }
    if (!this.throttleControl){
      this.xInterval = setInterval(() => {
        if (this.x < 2000) {
          this.x += 50;
          this.emmitChage();
        }
      }, this.sensitivity);
    }
  }

  public topKeyUp() {
    this.isBottomKeyDisabled = false;
    if (!this.throttleControl){
      clearInterval(this.xInterval);
      this.x = 1500;
      this.emmitChage();
    }
  }

  public bottomKeyDown(){
    this.isTopKeyDisabled = true;
    if (this.x > 1000) {
      this.x -= 100;
      this.emmitChage();
    }
    if (!this.throttleControl) {
      this.xInterval = setInterval(() => {
        if (this.x > 1000) {
          this.x -= 50;
          this.emmitChage();
        }
      }, this.sensitivity);
    }
  }

  public bottomKeyUp() {
    this.isTopKeyDisabled = false;
    if (!this.throttleControl){
      clearInterval(this.xInterval);
      this.x = 1500;
      this.emmitChage();
    }
  }


  public rightKeyDown(){
    this.isLeftKeyDisabled = true;
    if (this.y < 2000) {
      this.y += 100;
      this.emmitChage();
    }
    this.yInterval = setInterval(() => {
      if (this.y < 2000) {
        this.y += 50;
        this.emmitChage();
      }
    }, this.sensitivity);
  }

  public rightKeyUp() {
    this.isLeftKeyDisabled = false;
    clearInterval(this.yInterval);
    this.y = 1500;
    this.emmitChage();
  }

  public leftKeyDown(){
    this.isRightKeyDisabled = true;
    if (this.y > 1000) {
      this.y -= 100;
      this.emmitChage();
    }
    this.yInterval = setInterval(() => {
      if (this.y > 1000) {
        this.y -= 50;
        this.emmitChage();
      }
    }, this.sensitivity);
  }

  public leftKeyUp() {
    this.isRightKeyDisabled = false;
    clearInterval(this.yInterval);
    this.y = 1500;
    this.emmitChage();
  }

  public emmitChage()
  {
    this.change.emit({
      x: this.x,
      y: this.y
    });
  }

}
export class JoysticChange{
  public x: number;
  public y: number;
}