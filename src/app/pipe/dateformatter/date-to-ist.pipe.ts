import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateToIST',
})
export class DateToISTPipe implements PipeTransform {
  transform(input: string | Date): string {
    if (!input) return '';

    // Case 1: only time string like "15:30" or "9:05"
    if (typeof input === 'string' && /^[0-9]{1,2}:[0-9]{2}$/.test(input)) {
      const [hour, minute] = input.split(':').map(Number);
      const date = new Date();
      date.setHours(hour, minute, 0, 0);

      return date.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }); // 12‑hour with AM/PM [web:19]
    }

    // Case 2: full date/datetime string or Date object
    const d = input instanceof Date ? input : new Date(input);
    if (isNaN(d.getTime())) return '';

    return d.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }); // 12‑hour with AM/PM [web:19]
  }
}
