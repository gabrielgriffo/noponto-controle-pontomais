import { Component, input } from '@angular/core';

@Component({
  selector: 'app-tooltip-content',
  standalone: true,
  templateUrl: './tooltip.html'
})
export class TooltipComponent {
  text = input.required<string>();
  position = input<'top' | 'bottom' | 'left' | 'right'>('top');
  tooltipId = input.required<string>();
  isVisible = input<boolean>(false);
}
