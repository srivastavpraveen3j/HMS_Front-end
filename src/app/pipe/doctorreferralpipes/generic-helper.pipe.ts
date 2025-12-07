import { Pipe, PipeTransform } from '@angular/core';
import * as helperFns from '../../viewsdoctorreferral/helperFunctions/functions';

@Pipe({
  name: 'genericHelper',
})
export class GenericHelperPipe implements PipeTransform {
  transform(value: any, functionName: string, ...args: any[]): any {
    const fn = (helperFns as any)[functionName];
    if (typeof fn === 'function') {
      return fn(value, ...args);
    } else {
      console.warn(`Function "${functionName}" not found in helper functions.`);
      return value;
    }
  }
}
