import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'indianCurrency'
})
export class IndianCurrencyPipe implements PipeTransform {

    transform(value: number | string): string {
    if (value == null) return '₹0';
    const num = Number(value);
    if (isNaN(num)) return '₹0';

    const x = num.toFixed(2).split('.');
    let integerPart = x[0];
    const decimalPart = x[1]; 

    // Add commas in Indian number format
    let lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);

    if (otherNumbers !== '') {
      lastThree = ',' + lastThree;
    }

    const formatted =
      otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

    return `₹${formatted}.${decimalPart}`;
  }
}
