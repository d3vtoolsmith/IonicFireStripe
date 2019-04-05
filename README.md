
# IonicFireStripe

Implementation of in-app payments using Stripe and Firebase inside an Ionic 4 app.

# Payment Processing Architecture



# Overview
## PaymentExperimentApp 

`PaymentExperimentApp` folder contains the [Ionic 4](https://ionicframework.com/getting-started#cli) application that uses Stripe JS SDK ([ngx-stripe](https://github.com/richnologies/ngx-stripe)) and Firebase JS SDK ([angularfire2](https://github.com/angular/angularfire2)) to take payments from the user. 

**Specifically, the app does the following:**

 1. Uses [Firebase Authentication](https://firebase.google.com/docs/auth/web/anonymous-auth) to log the user in anonymously (for simplicity), so that payments done by the user can be associated with their anonymous Firebase account

```js
// inside **app.component.ts**
this.firebaseAuth.auth.signInAnonymously()
```

 2. Uses [Stripe Elements](https://stripe.com/docs/stripe-js/elements/quickstart) to initialize an HTML form to securely collect credit card information from the user and tokenize it before taking payments

```js
// inside **pay.page.ts**
this.stripeService.elements()
this.elements.create(...)
element1.mount(...)
```

 3. Uses tokenized, secure version of the credit card to charge the user through secure [Firebase Cloud Function](https://firebase.google.com/docs/functions/callable)-based backend (see PaymentExperimentBackend for details)

```js
// inside **pay.page.ts**
this.stripeService.createToken(this.cardNumberElement, { address_zip: this.zipCode })
...
this.firebaseFunctions.httpsCallable('makePayment')
```

 4. Uses basic [Firebase Firestore](https://firebase.google.com/docs/firestore/quickstart) database to retrieve user's payments (saved by the backend upon successful payment)

```js
// inside **history.page.ts**
this.stripeService.createToken(this.cardNumberElement, { address_zip: this.zipCode })
```


Using Stripe Elements and Firebase Cloud Function backend allows the app to avoid having to comply with the majority of the [PCI Data Security Standards](https://www.pcisecuritystandards.org/documents/PCI%20SSC%20Quick%20Reference%20Guide.pdf), offloading that onto the payment processor (Stripe).

## PaymentExperimentBackend

`PaymentExperimentBackend` folder contains the [Firebase Cloud Functions](https://firebase.google.com/docs/functions/callable) used by the app to process user payments. 
To protect both, the user of the app as well as the app company taking payments from the user, all payment processors require that the actual charge to the user is done from a secure backend and cannot be made directly from within the app (the source code of which is inherently public).

**Specifically, the backend does the following:**

 1. Uses an Firebase Authentication's `user().onCreate` [trigger](https://firebase.google.com/docs/functions/auth-events) to automatically add a newly signed in user as a Customer in Stripe, so that all payment methods (credit cards) and future payments can be associated with the same customer/user. This function is called `createStripeCustomer`. (Note that Stripe Customer creation could also occur at a later point, for example, when the first payment is made.)

```js
exports.createStripeCustomer = functions.auth.user().onCreate((user) => {
...
});
```

 2. Defines an Firebase `https.onCall` [function](https://firebase.google.com/docs/functions/callable), exposed as an HTTPS endpoint (API), that securely processes payment requests coming from the Ionic app by forwarding them to Stripe, and then saves them inside the Firestore database so the user can see their past payments. This function is called `makePayment`.

```js
exports.makePayment = functions.https.onCall((data, context) => {
...
});
```

# Configure, Deploy, and Run

## Create Stripe and Firebase Accounts

1. Create a [Stripe](https://dashboard.stripe.com/register) account to process payments (test mode)

	- Ionic App will use Stripe's `publishable key` to securely collect and tokenize sensitive credit card information.
	- Firebase backend will use Stripe's `secret key` to securely forward payment requests to Stripe.

2. Create a [Firebase](https://firebase.google.com/) account to handle basic authentication, and securely take payment requests from the app and forward them to Stripe

	- Create a new Firebase project.
	- Change its plan to `BLAZE` (pay-as-you-go) to be able to make external API calls (have to call Stripe APIs).
	- Enable `Anonymous Authentication` (or more) on the project, to be able to associate payments we a user account.
	- Create a test `Firestore Database` to hold mappings between Firebase user and Stripe customer accounts, and to maintain payment history for each user.

## Configure Ionic App (PaymentExperimentApp)

3. Run `npm install` to install dependencies

4. Update `environment.ts` file with configuration settings from the [Firebase Console](https://console.firebase.google.com) (under Project Overview - Add Web App) [`firebaseConfig` property]

```js
export const environment = {
  ...
  firebaseConfig: {
     apiKey: "******************************",
     authDomain: "******************************",
     databaseURL: "******************************",
     projectId: "****************",
     storageBucket: "******************************",
     messagingSenderId: "*********"
  },
  ...
};
```

5. Update `environment.ts` file with Stripe's public key (under [Developers => API Keys](https://dashboard.stripe.com/account/apikeys) - **Publishable key**) [`stripeKey` property]

```js
export const environment = {
  ...
  stripeKey: '******************************',
  ...
};
```


## Configure & Deploy Firebase Functions Backend (PaymentExperimentBackend)

6. Open the terminal inside the `functions` subfolder and install NPM dependencies:

```
cd functions
npm install
```

7. From the same terminal, log into Firebase by running:
```
firebase login
```
NOTE: Use `firebase logout` command if you need to switch accounts.

8. Point Firebase CLI to the Firebase project you've created for this project by running:
```
firebase use YOUR_FIREBASE_PROJECT_ID
```

9. Save sensitive Stripe settings into Firebase Function configuration so they are not checked into source control by running:
```
firebase functions:config:set stripe.token="****STRIPE_SECRET_TOKEN****"
firebase functions:config:set stripe.currency="USD"
``` 
NOTE: Grab your `STRIPE_SECRET_TOKEN` from your Stripe console, under [**Developers => API Keys**](https://dashboard.stripe.com/account/apikeys)

10. Deploy the two Firebase Functions  (`createStripeCustomer` and `makePayment`) - to your Firebase project by running:
```
firebase deploy
```

## Run Ionic App 

11. Run the app using `ionic serve --devapp` and test inside the browser or Ionic DevApp on a mobile device, or

12. Run the app on an emulator or actual device using `ionic cordova prepare ios` and then running/deploying the app using XCode (there are other CLI commands to do this too).

13. Once you have the app running, try this:

	- Make a few payments using various test [credit cards provided by Stripe](https://stripe.com/docs/testing) by clicking the `Pay` button:

		- `4242 4242 4242 4242` (Visa)
		- `5555 5555 5555 4444` (Mastercard)
		- `4000 0000 0000 0069` (Visa - expired card)
		- NOTE: Use any expiry and CVC code

	- See your payment history under the `History` page.
	- See detailed payment processing logs under `Profile` page.
	- Check your Firebase Firestore and Function Logs to see how your payment requests are processed and stored on the backend.

> **NOTE: Search for `// IFS:` (IonicFireStripe) inside the Ionic app to quickly find the most important bits of code that make payments work.**

## Missing Features

 - [ ] Platform-specific payment methods (Apple Pay/Google Pay) have been partially implemented, but have not been verified as Apple/Google require additional app store configuration for their payment methods to work.

 - [ ] Fetching of existing payment methods (credit cards) for the current user is not implemented.
