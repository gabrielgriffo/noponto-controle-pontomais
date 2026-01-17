import {
  Directive,
  input,
  HostListener,
  ElementRef,
  Renderer2,
  OnDestroy,
  inject,
  ComponentRef,
  effect,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  Overlay,
  OverlayRef,
  OverlayPositionBuilder,
  ConnectedPosition
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { TooltipComponent } from '../components/tooltip/tooltip';

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective implements OnDestroy {
  appTooltip = input<string>('');
  tooltipPosition = input<'top' | 'bottom' | 'left' | 'right'>('top');

  private elementRef = inject(ElementRef);
  private renderer = inject(Renderer2);
  private overlay = inject(Overlay);
  private overlayPositionBuilder = inject(OverlayPositionBuilder);
  private platformId = inject(PLATFORM_ID);

  private overlayRef: OverlayRef | null = null;
  private tooltipRef: ComponentRef<TooltipComponent> | null = null;
  private showTimeout: ReturnType<typeof setTimeout> | null = null;
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;
  private tooltipId = `tooltip-${Math.random().toString(36).substring(2, 11)}`;

  constructor() {
    // Acessibilidade: vincula tooltip ao elemento via ARIA
    effect(() => {
      if (this.appTooltip()) {
        this.renderer.setAttribute(
          this.elementRef.nativeElement,
          'aria-describedby',
          this.tooltipId
        );
      } else {
        this.renderer.removeAttribute(
          this.elementRef.nativeElement,
          'aria-describedby'
        );
      }
    });

    // Atualiza conteúdo dinamicamente se mudar com tooltip aberto
    effect(() => {
      const text = this.appTooltip();
      if (this.tooltipRef && text) {
        this.tooltipRef.setInput('text', text);
      }
    });

    // Atualiza posição dinamicamente se mudar com tooltip aberto
    effect(() => {
      const position = this.tooltipPosition();
      if (this.tooltipRef) {
        this.tooltipRef.setInput('position', position);
      }
    });
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.scheduleShow();
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.cancelShow();
    this.hide();
  }

  // Suporte a navegação por teclado (Tab)
  @HostListener('focusin')
  onFocusIn(): void {
    this.scheduleShow();
  }

  @HostListener('focusout')
  onFocusOut(): void {
    this.cancelShow();
    this.hide();
  }

  private scheduleShow(): void {
    if (!this.appTooltip()) return;

    this.showTimeout = setTimeout(() => {
      this.show();
    }, 100);
  }

  private cancelShow(): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
  }

  private show(): void {
    // SSR: evita execução no servidor
    if (!isPlatformBrowser(this.platformId)) return;

    // Previne race condition ao reabrir antes do hide completar
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }

    if (this.overlayRef && this.tooltipRef) {
      this.tooltipRef.setInput('isVisible', true);
      return;
    }

    const positions = this.getConnectedPositions();

    const positionStrategy = this.overlayPositionBuilder
      .flexibleConnectedTo(this.elementRef)
      .withPositions(positions)
      .withViewportMargin(2)
      .withPush(true); // CDK ajusta posição se colidir com bordas

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition()
    });

    // Calcula a posição da seta quando o tooltip for reposicionado
    positionStrategy.positionChanges.subscribe(() => {
      if (this.tooltipRef && this.overlayRef) {
        // Calcula posições em tempo real para lidar com mudanças de layout
        const elementRect = this.elementRef.nativeElement.getBoundingClientRect();
        const overlayElement = this.overlayRef.overlayElement;

        if (overlayElement) {
          const overlayRect = overlayElement.getBoundingClientRect();

          // Calcula a distância do início do tooltip até o centro do elemento
          const elementCenterX = elementRect.left + (elementRect.width / 2);
          const arrowOffsetFromTooltipLeft = -overlayRect.left -4 + elementCenterX;

          // Atualiza a posição da seta
          this.tooltipRef.setInput('arrowLeft', `${arrowOffsetFromTooltipLeft}px`);
        }
      }
    });

    const tooltipPortal = new ComponentPortal(TooltipComponent);
    this.tooltipRef = this.overlayRef.attach(tooltipPortal);

    this.tooltipRef.setInput('text', this.appTooltip());
    this.tooltipRef.setInput('position', this.tooltipPosition());
    this.tooltipRef.setInput('tooltipId', this.tooltipId);
    this.tooltipRef.setInput('isVisible', false);

    // requestAnimationFrame: garante animação suave após DOM atualizar
    requestAnimationFrame(() => {
      if (this.tooltipRef) {
        this.tooltipRef.setInput('isVisible', true);
      }
    });
  }

  private hide(): void {
    if (!this.overlayRef || !this.tooltipRef) return;

    this.tooltipRef.setInput('isVisible', false);

    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }

    // Aguarda 200ms para animação de saída antes de destruir
    this.hideTimeout = setTimeout(() => {
      if (this.overlayRef) {
        this.overlayRef.dispose();
        this.overlayRef = null;
        this.tooltipRef = null;
        this.hideTimeout = null;
      }
    }, 200);
  }

  private getConnectedPositions(): ConnectedPosition[] {
    const gap = 8;
    const position = this.tooltipPosition();
    const mainPosition = this.getPositionConfig(position, gap);
    
    // Define fallbacks: se não couber em 'top', tenta 'bottom', depois 'left', etc
    const fallbackPositions: ('top' | 'bottom' | 'left' | 'right')[] = [];

    switch (position) {
      case 'top':
        fallbackPositions.push('bottom');
        break;
      case 'bottom':
        fallbackPositions.push('top');
        break;
      case 'left':
        fallbackPositions.push('right', 'top', 'bottom');
        break;
      case 'right':
        fallbackPositions.push('left', 'top', 'bottom');
        break;
    }

    return [
      mainPosition,
      ...fallbackPositions.map(pos => this.getPositionConfig(pos, gap))
    ];
  }

  private getPositionConfig(position: 'top' | 'bottom' | 'left' | 'right', gap: number): ConnectedPosition {
    const configs: Record<string, ConnectedPosition> = {
      top: {
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom',
        offsetY: -gap
      },
      bottom: {
        originX: 'center',
        originY: 'bottom',
        overlayX: 'center',
        overlayY: 'top',
        offsetY: gap
      },
      left: {
        originX: 'start',
        originY: 'center',
        overlayX: 'end',
        overlayY: 'center',
        offsetX: -gap
      },
      right: {
        originX: 'end',
        originY: 'center',
        overlayX: 'start',
        overlayY: 'center',
        offsetX: gap
      }
    };

    return configs[position];
  }

  ngOnDestroy(): void {
    this.cancelShow();

    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }

    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
      this.tooltipRef = null;
    }
  }
}
