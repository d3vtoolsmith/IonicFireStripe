import { Component } from '@angular/core';

import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  amount = '0';
  hasFraction = false;

  digits = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', '<']
  ];

  users: any;
  user: any;
  customers: any;

  enterDigit(digit: string) {
    const length = this.amount.length;

    if (digit === '.') {
      this.amount += '.00';
    } else if (digit === '<') {
      if (this.amount.includes('.')) {
        this.amount = this.amount.substr(0, length - 3);
      } else if (length === 1) {
        this.amount = '0';
      } else {
        this.amount = this.amount.substr(0, length - 1);
      }
    } else {
      if (this.amount === '0') {
        this.amount = digit;
      } else {
        if (this.amount.includes('.')) {
          if (this.amount[this.amount.length - 2] === '0') {
            this.amount = this.amount.substr(0, length - 2) + digit + '0';
          } else if (this.amount[this.amount.length - 1] === '0') {
            this.amount = this.amount.substr(0, length - 1) + digit;
          } else {
            // ignore
          }
        } else {
          this.amount += digit;
        }
      }
    }

    this.hasFraction = this.amount.includes('.');
  }

  ionViewWillEnter() {
    this.statusBar.styleBlackOpaque();
  }

  constructor(private statusBar: StatusBar) {
  }
}
