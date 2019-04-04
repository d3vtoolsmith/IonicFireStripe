import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private appLogs: AppLog[] = [];

  get logs() {
    return this.appLogs;
  }

  writeLog(log: AppLog) {
    console.log(log.title, log.message, log.data);
    this.appLogs.unshift(log);
  }

  constructor() { }
}

export interface AppLog {
  title: string;
  message?: string;
  data?: any;
}
