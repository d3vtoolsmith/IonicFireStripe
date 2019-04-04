# Configuration & Deployment

## Create Stripe and Firebase Accounts

1. CREATE STRIPE ACCOUNT (TEST MODE) - WILL NEED STRIPE SECRET KEY TO PROCESS PAYMENTS

2. CREATE FIREBASE PROJECT:
	- CHANGE ITS PLAN TO "BLAZE (PAY AS YOU GO)" TO MAKE EXTERNAL API CALLS (TO STRIPE)
	- ENABLE AT LEAST ANONYMOUSE AUTHENTICATION
	- CREATE FIRESTORE DATABASE TO HOLD STRIPE CUSTOMER PROFILES AND PAYMENT HISTORY FOR USERS

## Configure & Deploy Firebase Functions

1. INSTALL DEPENDENCIES: npm install

2. LOG INTO FIREBASE: firebase login

NOTE: use "firebase logout" if need to switch account

3. SWITCH TO CORRECT FIREBASE PROJECT: firebase use ionicpayments1

4. SET FIREBASE FUNCTION CONFIGURATIONS (STRIPE KEY + CURRENCY)

```
firebase functions:config:set stripe.token="<STRIPE_SECRET_TOKEN>"
```

NOTE: get token under API Keys inside [Stripe console](https://dashboard.stripe.com/account/apikeys)

```
firebase functions:config:set stripe.currency="USD"
```

5. DEPLOY THE 2 FUNCTIONS BELOW TO THE FIREBASE PROJECT: 
```
firebase deploy
```


## Other Useful Firebase Function Configuration Commands
- SEE ALL CONFIGURATION: `firebase functions:config:get`
- REMOVE CONFIG ENTRY: `firebase functions:config:unset key1`
- CLONE CONFIG ENTRIES: `firebase functions:config:clone --from <fromProject>`