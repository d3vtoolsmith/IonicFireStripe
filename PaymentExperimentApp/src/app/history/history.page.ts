import { Component, OnInit } from '@angular/core';

import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';

import { Observable } from 'rxjs';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {
  payments: Observable<any[]>;

  constructor(
    private statusBar: StatusBar,
    firebaseAuth: AngularFireAuth,
    firestore: AngularFirestore) {

    // IFS: fetch payment history from the firestore for the currently logged in user (anonymously)
    this.payments = firestore.collection<any>('payments',
      ref => ref.where('userId', '==', firebaseAuth.auth.currentUser.uid))
      // .orderBy('createdDate', 'desc')
      .valueChanges();
    // ***IFS
  }

  ionViewWillEnter() {
    this.statusBar.styleDefault();
  }

  ngOnInit() {
  }
}
