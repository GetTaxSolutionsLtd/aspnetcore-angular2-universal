import { Component, OnInit } from '@angular/core';
import { ServiceDetails } from '../payment/payment.component';

@Component({
  selector: 'test-component',
  templateUrl: './test-component.component.html',
  styleUrls: ['./test-component.component.scss']
})
export class TestComponentComponent implements OnInit {

  constructor() { }

  private paypalSettings = { env: 'sandbox', client: 'AYI8yMGue8-Q1kTG73MABbcLK6BX_nEAy2hltFIu1_Fcs9AmxbIB9_mCbrZfs0q0sUUI_3vyreeKOUPq' };
  private paymentDetails: PaymentDetails = {
    total: {
      amount: {
        currency: 'AUD',
        value: '50'
      },
      label: ''
    }
  };
  private serviceDetails: ServiceDetails = {
    UserId:"8039F523-4E27-45A9-9494-6750D7C4527E",
    ServiceId:"0c8d7fd1-446d-456d-9057-007a9a3e71f3",
    ServiceTypeId:"92A9F8F3-872F-43C1-B96E-0F349E15C9BF"
  }
   
  ngOnInit() {
  }

}
