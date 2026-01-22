import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'app-flip-text',
  imports: [],
  templateUrl: './flip-text.html',
  styleUrl: './flip-text.css',
  standalone: true,
  encapsulation: ViewEncapsulation.None
})
export class FlipText implements OnChanges, AfterViewInit {
  @Input() text = '';
  @Input() fontSize: number = 42; // Tamanho da fonte em pixels
  @Input() grayPrefix?: string; // Prefixo opcional para aplicar cor cinza (ex: '00h')

  @ViewChild('flipContainer', { static: false }) flipContainer!: ElementRef<HTMLDivElement>;

  private isInitialized = false;

  ngAfterViewInit(): void {
    this.isInitialized = true;
    this.applyContainerStyles();
    // Renderiza o texto inicial sem animação
    if (this.text) {
      this.renderText(this.text, false);
    }
  }

  private applyContainerStyles(): void {
    if (!this.flipContainer?.nativeElement) {
      return;
    }

    const container = this.flipContainer.nativeElement;
    // Altura proporcional ao fontSize (aprox. 1.2x)
    container.style.height = `${this.fontSize * 1.2}px`;
    container.style.fontSize = `${this.fontSize}px`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Atualiza estilos se fontSize mudar
    if (changes['fontSize'] && this.isInitialized) {
      this.applyContainerStyles();
    }

    // Só anima se já foi inicializado e o texto realmente mudou
    if (changes['text'] && this.isInitialized && !changes['text'].firstChange) {
      this.renderText(this.text, true);
    }
  }

  private renderText(value: string, animate: boolean): void {
    if (!this.flipContainer?.nativeElement) {
      return;
    }

    const container = this.flipContainer.nativeElement;

    // Marca os elementos antigos para saída
    const oldWords = container.querySelectorAll('.word');

    if (animate && oldWords.length > 0) {
      oldWords.forEach((word) => {
        word.classList.add('exit');
      });
    }

    // Cria o novo elemento
    const wordWrapper = document.createElement('div');
    wordWrapper.className = 'word';

    // Verifica se deve aplicar cor cinza no prefixo
    const shouldGrayPrefix = this.grayPrefix && value.startsWith(this.grayPrefix);
    const grayPrefixLength = shouldGrayPrefix ? this.grayPrefix!.length : 0;

    // Calcula valores de animação proporcionais ao fontSize
    const translateYIn = this.fontSize * 0.42; // ~20px para 48px
    const translateYOut = this.fontSize * 0.625; // ~30px para 48px
    const blurIn = this.fontSize * 0.208; // ~10px para 48px
    const blurOut = this.fontSize * 0.25; // ~12px para 48px

    // Cria cada letra
    [...value].forEach((char, index) => {
      const letter = document.createElement('span');
      letter.className = 'letter';

      // Aplica cinza no prefixo se configurado
      if (shouldGrayPrefix && index < grayPrefixLength) {
        letter.classList.add('gray');
      }

      letter.textContent = char === ' ' ? '\u00A0' : char;

      // Define delay apenas se for animado
      if (animate) {
        letter.style.animationDelay = `${index * 0.03}s`;
        // Define valores customizados de animação
        letter.style.setProperty('--translate-y-in', `${translateYIn}px`);
        letter.style.setProperty('--translate-y-out', `${translateYOut}px`);
        letter.style.setProperty('--blur-in', `${blurIn}px`);
        letter.style.setProperty('--blur-out', `${blurOut}px`);
      } else {
        // Sem animação, já mostra a letra
        letter.style.animation = 'none';
        letter.style.opacity = '1';
        letter.style.transform = 'none';
        letter.style.filter = 'none';
      }

      wordWrapper.appendChild(letter);
    });

    // Adiciona o novo elemento ao container
    container.appendChild(wordWrapper);

    // Remove os elementos antigos após a animação terminar
    if (animate && oldWords.length > 0) {
      setTimeout(() => {
        oldWords.forEach((word) => {
          if (word.parentNode) {
            word.remove();
          }
        });
      }, 600);
    } else if (!animate && oldWords.length > 0) {
      // Se não anima, remove imediatamente
      oldWords.forEach((word) => word.remove());
    }
  }
}
