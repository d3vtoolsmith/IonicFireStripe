## APP CONFIGURATION
1. Create a [Stripe](https://dashboard.stripe.com/register) account to process payments (test mode)
2. Create a [Firebase](https://firebase.google.com/) account to handle basic authentication, and securely take payment requests from the app and forward them to Stripe
3. Run `npm install` to install dependencies
4. Update `environment.ts` file with configuration settings from the [Firebase Console](https://console.firebase.google.com) (under Project Overview - Add Web App) [`firebaseConfig` property]
5. Update `environment.ts` file with Stripe's public key (under [Developers => API Keys](https://dashboard.stripe.com/account/apikeys) - **Publishable key**) [`stripeKey` property]
6. Run the app using `ionic serve --devapp` and test inside the browser or Ionic DevApp on a mobile device, or
7. Run the app on an emulator or actual device using `ionic cordova prepare ios` and then running/deploying the app using XCode (there are other CLI comamnds to do this too).