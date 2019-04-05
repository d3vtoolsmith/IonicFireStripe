// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "AIzaSyCsElQgTLD1VbPcynH99XiI8C6O0ubCgMQ",
    authDomain: "ionicpayments1.firebaseapp.com",
    databaseURL: "https://ionicpayments1.firebaseio.com",
    projectId: "ionicpayments1",
    storageBucket: "ionicpayments1.appspot.com",
    messagingSenderId: "335949177"
  },
  stripeKey: 'pk_test_PIApOrlZNvkgeT4WqyavZRTg00Ms798daM'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
