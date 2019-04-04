'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const {
	Logging
} = require('@google-cloud/logging');
const logging = new Logging({
	projectId: 'ionicexperiments'
});

// configure stripe sdk with firebase function configuration
// (SEE ALL CONFIGURATION: firebase functions:config:get)
// (REMOVE CONFIG ENTRY: firebase functions:config:unset key1)
// (CLONE CONFIG ENTRIES: firebase functions:config:clone --from <fromProject>)

// TO CONFIGURE: firebase functions:config:set stripe.token="<STRIPE_SECRET_TOKEN>"
const stripe = require('stripe')(functions.config().stripe.token);
// TO CONFIGURE: firebase functions:config:set stripe.currency="USD"
const currency = functions.config().stripe.currency;


//=========================================== FUNCTIONS ===========================================
// automatically create new stripe customer whenever new user is added to firebase authentication
// (auth database trigger)
exports.createStripeCustomer = functions.auth.user().onCreate((user) => {
	// create stripe customer for the user
	return stripe.customers.create({
		description: user.uid,
		email: user.email
	}).then(customer => {
		// save newly added stripe customer to firestore
		return admin.firestore().collection('stripe_customers').doc(user.uid).set({
			customerId: customer.id,
			customerDetails: customer
		});
	}, error => {
		return reportError(
			`Failed to create Stripe Customer for the newly added user (${user.uid}).`, {
				error: error
			});
	});
});

// make payment request for the current user using the specified payment method (token)
// (https api)
exports.makePayment = functions.https.onCall((data, context) => {
	// make sure request is authenticated
	if (!context.auth) {
		throw new functions.https.HttpsError('failed-precondition', 'Must be authenticated to call this function.');
	}

	let customerId;
	let payment;

	return admin.firestore().collection('stripe_customers').doc(context.auth.uid).get()
		// find stripe customer id for the current user
		.then(doc => {
			if (!doc.exists) {
				throw new functions.https.HttpsError('invalid-argument', `Cannot find Stripe Customer for the current user (${context.auth.id}).`);
			}

			// remember customer id
			customerId = doc.data().customerId;

			return doc.data().customerId;
		})
		// find stripe customer for the current user
		.then(customerId => {
			// update payment source for the stripe customer for later use
			return stripe.customers.update(customerId, { source: data.cardToken.id });
		})
		// update stripe customer record inside firestore with the updated stripe customer
		.then(customer => {
			return admin.firestore().collection('stripe_customers').doc(context.auth.uid)
				.update({ customerDetails: customer });
		})
		// make a stripe charge to the customer
		.then(updateResult => {
			// const idempotencyKey = context.params.id;
			const charge = {
				amount: data.amount,
				currency: currency,
				customer: customerId,
				capture: true, // immediately settle the charge (not pre-auth)
				description: 'test charge'
			};
			return stripe.charges.create(charge);
		})
		// save successful payment along with the stripe charge object in firestore
		.then(charge => {
			payment = {
				createdDate: Date.now(),
				userId: context.auth.uid,
				amount: data.amount / 100.0, // save actual amount (3922 => 39.22)
				customerId: customerId,
				charge: charge
			};
			return admin.firestore().collection('payments').doc().set(payment);
		})
		// return successful result
		.then(updateResult => {
			return {
				error: null,
				data: payment
			}
		})
		// return error result
		.catch(err => {
			return {
				error: err,
				data: null
			};
		});
});



//=========================================== HELPERS ===========================================
// google logging helper
function reportError(err, context = {}) {
	const logName = 'errors';
	const log = logging.log(logName);

	// https://cloud.google.com/logging/docs/api/ref_v2beta1/rest/v2beta1/MonitoredResource
	const metadata = {
		resource: {
			type: 'cloud_function',
			labels: {
				function_name: process.env.FUNCTION_NAME
			},
		},
	};

	// https://cloud.google.com/error-reporting/reference/rest/v1beta1/ErrorEvent
	const errorEvent = {
		message: err.stack,
		serviceContext: {
			service: process.env.FUNCTION_NAME,
			resourceType: 'cloud_function',
		},
		context: context,
	};

	// Write the error log entry
	return new Promise((resolve, reject) => {
		log.write(log.entry(metadata, errorEvent), (error) => {
			if (error) {
				return reject(error);
			}
			return resolve();
		});
	});
}