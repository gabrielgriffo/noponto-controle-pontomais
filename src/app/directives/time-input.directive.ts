import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appTimeInput]',
  standalone: true
})
export class TimeInputDirective {

  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = this.el.nativeElement;
    let value = input.value.replace(/[^0-9]/g, '');

    // Se digitou um único dígito >= 3 nas horas, adiciona 0 antes
    if (value.length === 1 && parseInt(value) >= 3) {
      value = '0' + value;
    }

    // Valida se as horas são < 24
    if (value.length >= 2) {
      const hours = parseInt(value.slice(0, 2));
      if (hours >= 24) {
        value = value.slice(0, -1); // Remove o último dígito digitado
      }
    }

    // Se digitou um único dígito >= 6 nos minutos, adiciona 0 antes
    if (value.length === 3 && parseInt(value[2]) >= 6) {
      value = value.slice(0, 2) + '0' + value[2];
    }

    if (value.length === 0) {
      input.value = '';
    } else if (value.length <= 2) {
      input.value = value;
    } else {
      input.value = value.slice(0, 2) + ':' + value.slice(2, 4);
    }
  }
}
