import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AngularFireAuth } from 'angularfire2/auth';

import { LoggingService } from './logging.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private firebaseAuth: AngularFireAuth,
    private loggingService: LoggingService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleBlackOpaque();
      this.splashScreen.hide();

      // IFS: login anonymously using firebase to keep history of payments under the same user
      this.firebaseAuth.auth.signInAnonymously()
        .then(user => {
          this.loggingService.writeLog({ title: 'Signed In Anonymously', data: user });
        }).catch(err => {
          this.loggingService.writeLog({ title: 'Failed to Sign In Anonymously', data: err });
        });
      // ***IFS
    });
  }
}
