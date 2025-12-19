import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getCurrentWindow } from '@tauri-apps/api/window';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  timeEntries = {
    entrada: '',
    saida: '',
    entrada2: ''
  };

  onTimeInput(event: Event, field: keyof typeof this.timeEntries): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove tudo que não é número

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
      this.timeEntries[field] = '';
    } else if (value.length <= 2) {
      this.timeEntries[field] = value;
    } else {
      this.timeEntries[field] = value.slice(0, 2) + ':' + value.slice(2, 4);
    }

    // Atualiza o valor do input
    input.value = this.timeEntries[field];
  }

  async onMinimizeClick() {
    const window = await getCurrentWindow();
    window.minimize();
  }

  async onCloseClick() {
    const window = await getCurrentWindow();
    window.destroy();
  }

  async onSettingsClick() {
    // TODO: Implementar abertura de janela de configurações
    console.log('Abrir configurações');
  }
}
