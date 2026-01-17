import { Directive, HostListener, ElementRef } from '@angular/core';
import { TimeUtilsService } from '../services/time-utils.service';

@Directive({
  selector: '[appTimeInput]',
  standalone: true
})
export class TimeInputDirective {

  constructor(
    private el: ElementRef<HTMLInputElement>,
    private timeUtils: TimeUtilsService
  ) {}

  @HostListener('input')
  onInput(): void {
    const input = this.el.nativeElement;
    input.value = this.timeUtils.formatTimeInput(input.value);
  }
}
