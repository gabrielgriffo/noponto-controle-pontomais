import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat',
  standalone: true,
  pure: false
})
export class TimeFormatPipe implements PipeTransform {
  transform(time: { hours: number; minutes: number }, format: 'duration' | 'clock' = 'duration'): string {
    if (!time) {
      return '';
    }

    if (format === 'clock') {
      // Formato HH:MM para horários (ex: 18:54)
      const h = time.hours.toString().padStart(2, '0');
      const m = time.minutes.toString().padStart(2, '0');
      return `${h}:${m}`;
    } else {
      // Formato Xh Xm para durações (ex: 7h 50m ou 07h 50m)
      const h = time.hours.toString().padStart(2, '0');
      const m = time.minutes.toString().padStart(2, '0');
      return `${h}h ${m}m`;
    }
  }
}
