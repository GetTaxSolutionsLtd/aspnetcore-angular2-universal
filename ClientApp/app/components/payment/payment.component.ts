import { Component, OnInit, AfterContentInit, Input, Output, EventEmitter, AfterViewChecked, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { CreditCardValidator } from '../../directives/credit-card-validation.directive';
//import * as paypal from 'paypal-checkout/dist/checkout.lib.js';

//import * as Payment from 'payment';
import { isPlatformBrowser } from '@angular/common';

// Set up a url on your server to create the payment
var CREATE_URL = 'api/payment-id';

// Set up a url on your server to execute the payment
const EXECUTE_URL = 'api/execute-payment';
declare let paypal: any;
//declare let $: any;

export class CompletePaymentResult {
  Success?: any;
  Error?: any;
}

export class ServiceDetails {
  ServiceId: string;
  ServiceTypeId: string;
  UserId: string;
}

export class CardDetails {
  Number: string;
  Expiry: string;
  Cvc: string;
  Name: string;
}

export class PaymentModel {
  ServiceId: string;
  ServiceTypeId: string;
  UserId: string;
  AgreeTc: boolean;
  Card?: CardDetails;
}


@Component({
  selector: 'payment',
  templateUrl: './payment.component.html',
  //styleUrls: ['./payment.component.scss']
  //styles: [`
  //  .tandc-modal {
  //    background-color: red;
  //  }

  //  .tandc-modal .modal-content {
  //    background-color: red;;
  //  }
  //`]
})
export class PaymentComponent implements OnInit, AfterContentInit, AfterViewChecked {

  @Input() paymentDetails: PaymentDetails

  @Input() serviceDetails: ServiceDetails

  @Input()
  paypalSettings: {
    env: string,
    client: string
  } = { env: 'sandbox', client:'' };

  @Input() 
  cardPlaceholders: any = {
    name: 'Your Full Name',
    number: 'xxxx xxxx xxxx xxxx',
    expiry: 'MM/YYYY',
    cvc: 'xxx'
  };

  @Input() 
  cardMessages: any = {
    validDate: 'valid\nthru',
    monthYear: 'MM/YYYY',
  };

  @Input() 
  cardOptions: any = {
    debug: false,
    formatting: true
  };

  @ViewChild('ppButton') ppButton: ElementRef;

  @Output() complete = new EventEmitter<CompletePaymentResult>();

  private isPrivateButtonRendered: boolean = false;
  private closeResult: string;

  private card: FormGroup = this.fb.group({
    number: new FormControl('', CreditCardValidator.validateCardNumber),
    expiry: new FormControl(),
    cvc: new FormControl(),
    name: new FormControl('', Validators.compose([Validators.required, Validators.minLength(2)])),
    agreeTc: new FormControl(false)
  });

  constructor(
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object) { }

  getCardType() {
    //var cardType = Payment.fns.cardType(this.card.controls.number.value);
    return 'card number';
  }

  showTcAgreement(tAndCContent) {
    console.log('Show T&C');
  }

  completePayment(model: any) {
    this.complete.emit({ Success: { serviceDetails: this.serviceDetails, paymentDetails: this.paymentDetails } });
  }

  getPayment(card: CardDetails = null): any { //, model
    var self = this;

    //Map form values to model
    let paymentModel: PaymentModel = { 
      ServiceId: self.serviceDetails.ServiceId,
      ServiceTypeId: self.serviceDetails.ServiceTypeId,
      UserId: self.serviceDetails.UserId,
      AgreeTc: self.card.controls.agreeTc.value,
      Card: card
    }

    if (!self.card.controls.agreeTc) {
        return false;
    }

    //$loading.start('loading');
    // Set up a url on your server to create the payment

    // Make a call to your server to set up the payment
    return window['paypal'].request.post(CREATE_URL, null, { method: 'POST', json: paymentModel, headers: { 'Content-Type': 'application/json' } })
      .then(function (res) {
        //$loading.finish('loading');
        if (card) {
          self.completePayment.call(self, res);
        }
        return res.PrimaryData.Id;
      }, function (err) {
        self.complete.emit({ Error: { Exception: err } });
      }).finally(function () {
        //$loading.finish('loading');
        //model.processingRequest = false;
      });
  };

  executePayment(paymentId: any, payerId: any): any {
    let self = this;
    // Set up the data you need to pass to your server
    var payData = {
      Id: 'paypal',
      PaymentId: paymentId,
      PayerId: payerId,
      ServiceId: self.serviceDetails.ServiceId,
      //Type: model.service.Type,
      ServiceTypeId: self.serviceDetails.ServiceTypeId,
      AgreeTc: self.card.controls.agreeTc.value,
      UserId: self.serviceDetails.UserId
    };

    // Make a call to your server to execute the payment
    return window['paypal'].request.post(EXECUTE_URL, null, { method: 'POST', json: payData, headers: { 'Content-Type': 'application/json' } })
      .then(function (res) {
        self.completePayment(res);
      }, function (err) {
        self.complete.emit({ Error: { Exception: err } });
      }).finally(function () {
        //$loading.finish('loading');
        //model.processingRequest = false;;
      });
  }

  //Click Pay with card
  payWithCard(): void {
    const self = this;

    let card: CardDetails = {
      Cvc: self.card.controls.cvc.value,
      Expiry: self.card.controls.expiry.value,
      Number: self.card.controls.number.value,
      Name: self.card.controls.name.value
    }

    self.getPayment(card);
  };

  initPaypalButton(): void {
    let self = this;
    console.log('init paypal button');
    let paypalBtn = {
      client: {},
      style: {
        size: 'responsive',
        label: 'buynow',
        fundingicons: true, // optional
        branding: true // optional
      },
      // Show the buyer a 'Pay Now' button in the checkout flow
      commit: true,

      //invoke payment/authorize server side
      // payment() is called when the button is clicked
      payment: function () {
        // Make a call to your server to set up the payment
        return self.getPayment.call(self);

      },

      // onAuthorize() is called when the buyer approves the payment
      onAuthorize: function (data, actions) {
        //$loading.start('loading')
        self.executePayment(data.paymentID, data.payerID); 
      }

    };

    //Server transfer have to be fixed in Angular 5!!! TODO
    paypalBtn['env'] = 'sandbox';
    paypalBtn.client[paypalBtn['env']] = 'AYI8yMGue8-Q1kTG73MABbcLK6BX_nEAy2hltFIu1_Fcs9AmxbIB9_mCbrZfs0q0sUUI_3vyreeKOUPq';

    //if (!$('#paypal-button-container').html()) {
    //  paypal.Button.render(paypalBtn, '#paypal-button-container');
    //}
    if (!this.isPrivateButtonRendered && isPlatformBrowser(this.platformId)) {
      if (!self.ppButton.nativeElement) console.log('self.ppButton.nativeElement is null');
      if (!window['paypal'] || !window['paypal'].Button) console.log('!paypal || !paypal.Button is null');
      console.log('Paypal execute button rendering');
      window['paypal'].Button.render(paypalBtn, self.ppButton.nativeElement); //this.ppButton.nativeElement;
    }
    this.isPrivateButtonRendered  = true;
  }

  //Open T&C Modal window

  open(content) {
    //this.modalService.open(content).result.then((result) => {
    //  this.closeResult = `Closed with: ${result}`;
    //}, (reason) => {
    //  this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    //});
  }

  ngOnInit() {
    //console.log("==========================");
    //console.log(this.paymentDetails);
    //console.log(this.paypalSettings);
    //console.log("==========================");
  }

  ngAfterContentInit() {
    //this.complete.emit({ Success: {a:10} });
    let self = this;
    if (window) {
      self.initPaypalButton.call(self);
    }
  }

  ngAfterViewChecked() {
    
  }



}
