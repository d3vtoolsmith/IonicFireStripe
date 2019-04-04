import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// IFS: Firebase dependencies
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireFunctionsModule, FunctionsRegionToken } from 'angularfire2/functions';
import { AngularFirestoreModule } from 'angularfire2/firestore';
// ***IFS

// IFS: Stripe dependencies
import { NgxStripeModule } from 'ngx-stripe';
// ***IFS

import { environment } from '../environments/environment';

import { LoggingService } from './logging.service';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,

    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFireFunctionsModule,
    AngularFirestoreModule,

    NgxStripeModule.forRoot(environment.stripeKey)],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },

    // IFS: explicitely tell firebase functions to use us-central1 region
    { provide: FunctionsRegionToken, useValue: 'us-central1' },
    // ***IFS

    LoggingService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
