import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AngularFireFunctions } from 'angularfire2/functions';

import {
  StripeService,
  Elements,
  Element as StripeElement,
  ElementOptions,
  Token,
  Error
} from 'ngx-stripe';

import { LoggingService } from '../logging.service';

@Component({
  selector: 'app-pay',
  templateUrl: './pay.page.html',
  styleUrls: ['./pay.page.scss'],
})
export class PayPage implements OnInit {
  // IFS: Stripe Elements variables for collecting card info and tokenizing it
  elements: Elements;
  cardNumber: StripeElement;
  cardExpiration: StripeElement;
  cardCVC: StripeElement;

  token: Token = null;
  // ***IFS
  zipCode: string;  // additional zipcode field

  // IFS: Payment confirmation object returned by Firebase function
  payment: any = null;
  // ***IFS

  cardBrand = '';
  cardValidation: any = {};
  get isCardValid() {
    return this.cardValidation.cardNumber && this.cardValidation.cardNumber.isValid &&
      this.cardValidation.cardExpiry && this.cardValidation.cardExpiry.isValid &&
      this.cardValidation.cardCvc && this.cardValidation.cardCvc.isValid &&
      this.zipCode && this.zipCode.length === 5;
  }

  amount: number;

  paying = false;
  error: Error = null;

  private elementOptions: ElementOptions = {
    style: {
      base: {
        iconColor: '#666EE8',
        color: '#31325F',
        lineHeight: '40px',
        fontWeight: 600,
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSize: '18px',
        '::placeholder': {
          color: '#CFD7E0'
        }
      }
    }
  };

  pay() {
    this.token = null;
    this.payment = null;
    this.error = null;
    this.paying = true;

    // IFS: Get a secure token representation of the card that can be used to make secure payments
    this.stripeService.createToken(this.cardNumber, { address_zip: this.zipCode })
      .subscribe(result => {
        if (result.error) {
          this.error = result.error;
          this.loggingService.writeLog({ title: 'Failed to Create Stripe Credit Card Token', data: this.error });
          return;
        }

        this.token = result.token;

        this.loggingService.writeLog({ title: 'Created Stripe Credit Card Token', data: this.token });

        // IFS: make payment request to the backend (firebase http function)
        const makePaymentFunc = this.firebaseFunctions.httpsCallable('makePayment');
        makePaymentFunc({
          amount: this.amount * 100,  // must be an integer with last 2 digits being cents (78.34 => 7834)
          cardToken: this.token
        }).subscribe(
          res => {
            this.paying = false;
            if (res.error) {
              this.error = res.error;
              this.loggingService.writeLog({ title: `Failed to Make Payment`, data: res });
            } else {
              this.payment = res.data;
              this.loggingService.writeLog({ title: `Successfully Made Payment ($${this.amount})`, data: res.data });
            }
          },
          err => {
            this.error = err;
            this.loggingService.writeLog({ title: 'Failed to Make Payment Call', data: err });
          });
      },
        err => {
          this.error = err;
          this.loggingService.writeLog({ title: 'Failed to Create Stripe Credit Card Token', data: err });
        });
    // ***IFS
  }

  initStripeElements() {
    // IFS: initialize plain HTML <div>s into secure card input controls (iframes) using Stripe Elements library
    this.stripeService.elements().subscribe(
      elements => {
        this.elements = elements;

        // mount placeholders to stripe elements
        if (!this.cardNumber) {
          this.cardNumber = this.elements.create('cardNumber', this.elementOptions);
          this.cardNumber.on('change', e => this.processCardFieldChange(e));
          this.cardNumber.mount('#cardNumber');
        }
        if (!this.cardExpiration) {
          this.cardExpiration = this.elements.create('cardExpiry', this.elementOptions);
          this.cardExpiration.on('change', e => this.processCardFieldChange(e));
          this.cardExpiration.mount('#cardExpiration');
        }
        if (!this.cardCVC) {
          this.cardCVC = this.elements.create('cardCvc', this.elementOptions);
          this.cardCVC.on('change', e => this.processCardFieldChange(e));
          this.cardCVC.mount('#cardCVC');
        }

        // IFS: this enables platform-specific payment methods like apple pay and google pay
        const paymentRequest = this.getPaymentRequest();
        const paymentRequestButton = this.elements.create('paymentRequestButton', <ElementOptions>{ paymentRequest: paymentRequest });
        paymentRequest.canMakePayment().then(result => {
          if (result) {
            paymentRequestButton.mount('#paymentRequestButton');
          }
        });

        this.loggingService.writeLog({ title: 'Initialized Stripe Elements' });
      },
      err => {
        this.loggingService.writeLog({ title: 'Failed to Initialize Stripe Elements', data: err });
      });
    // ***IFS
  }

  processCardFieldChange(event: any) {
    // IFS: this enforces client-side card validation and brand (visa/mastercard/etc) extraction for display purposes
    if (event.elementType === 'cardNumber') {
      this.cardBrand = event.brand;
    }

    this.cardValidation[event.elementType] = {
      isValid: !event.error,
      error: event.error ? event.error.message : ''
    };
    // ***IFS
  }

  private getPaymentRequest() {
    // IFS: platform-provided payment processing (Apple Pay, Google Pay, etc.)
    // NOTE: NOT FULLY IMPLEMENTED OR TESTED (REQUIRES ADDITIONAL CONFIGURATION WITH APPLE/GOOGLE)
    return this.stripeService.paymentRequest({
      total: {
        amount: this.amount * 100,
        label: 'test payment',
        pending: false
      },
      country: 'US',
      currency: 'usd'
    });
    // ***IFS
  }

  constructor(
    route: ActivatedRoute,
    private statusBar: StatusBar,
    private firebaseFunctions: AngularFireFunctions,
    private stripeService: StripeService,
    private loggingService: LoggingService) {

    route.params.subscribe(params => {
      this.amount = params['amount'];
    });
  }

  ionViewWillEnter() {
    this.statusBar.styleDefault();
  }

  ngOnInit() {
    this.initStripeElements();
  }
}
