import { Directive } from '@angular/core';
import { ValidatorFn, AbstractControl, FormControl } from '@angular/forms';

import * as Payment from 'payment';

@Directive({
  selector: '[appCreditCardValidation]'
})
export class CreditCardValidationDirective {

  constructor() { }

}

export class CreditCardValidator {
  static validateCardNumber(control: FormControl): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } => {
    let isValid = Payment.fns.validateCardNumber(control.value);
    return isValid ? { 'validateCardNumber': { value: control.value } } : null;
  };
}
}
