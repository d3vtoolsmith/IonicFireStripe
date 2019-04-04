import { Component, OnInit } from '@angular/core';

import { StatusBar } from '@ionic-native/status-bar/ngx';

import { LoggingService, AppLog } from '../logging.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  logs: AppLog[];

  constructor(
    private statusBar: StatusBar,
    private loggingService: LoggingService) {

    this.logs = this.loggingService.logs;
  }

  ionViewWillEnter() {
    this.statusBar.styleDefault();
  }

  ngOnInit() {
  }
}
