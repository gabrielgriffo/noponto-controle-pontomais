import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { SettingsModal } from '../settings-modal/settings-modal';
import { FlipText } from '../../components/flip-text/flip-text';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, SettingsModal, FlipText],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  showSettingsModal = false;
  timeEntries = {
    checkIn: '',
    checkOut: '',
    checkIn2: ''
  };

  // Tempo Trabalhado
  workedTime = {
    hours: 0,
    minutes: 0
  };

  // Tempo Restante
  remainingTime = {
    hours: 0,
    minutes: 0
  };

  private increasing = true; // Controla se está crescendo ou decrescendo

  constructor() {
    this.startTimeSimulation();
  }

  startTimeSimulation(): void {
    setInterval(() => {
      if (this.increasing) {
        // Adiciona 10 minutos
        this.workedTime.minutes += 1;
        this.remainingTime.minutes += 1;

        // Converte minutos em horas se necessário
        if (this.workedTime.minutes >= 60) {
          this.workedTime.hours++;
          this.workedTime.minutes -= 60;
        }
        if (this.remainingTime.minutes >= 60) {
          this.remainingTime.hours++;
          this.remainingTime.minutes -= 60;
        }

        // Verifica se chegou em 8 horas
        if (this.workedTime.hours === 8 && this.workedTime.minutes === 0) {
          this.increasing = false;
        }
      } else {
        // Subtrai 1 minutos
        this.workedTime.minutes -= 1;
        this.remainingTime.minutes -= 1;

        // Converte horas em minutos se necessário
        if (this.workedTime.minutes < 0) {
          this.workedTime.hours--;
          this.workedTime.minutes += 60;
        }
        if (this.remainingTime.minutes < 0) {
          this.remainingTime.hours--;
          this.remainingTime.minutes += 60;
        }

        // Verifica se chegou em 0 horas
        if (this.workedTime.hours === 0 && this.workedTime.minutes === 0) {
          this.increasing = true;
        }
      }
    }, 1000); // Executa a cada 1 segundo
  }

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
  }

  get workedTimeText(): string {
    const h = this.workedTime.hours.toString().padStart(2, '0');
    const m = this.workedTime.minutes.toString().padStart(2, '0');

    return `${h}h ${m}m`;
  }

  get remainingTimeText(): string {
    const h = this.remainingTime.hours.toString().padStart(2, '0');
    const m = this.remainingTime.minutes.toString().padStart(2, '0');

    return `${h}h ${m}m`;
  }

  get hasTimeData(): boolean {
    // Verifica se há pelo menos um horário válido no formato HH:MM
    const hasValidCheckIn = this.timeEntries.checkIn.includes(':');
    const hasValidCheckOut = this.timeEntries.checkOut.includes(':');
    const hasValidCheckIn2 = this.timeEntries.checkIn2.includes(':');

    return hasValidCheckIn || hasValidCheckOut || hasValidCheckIn2;
  }

  async onMinimizeClick() {
    const window = await getCurrentWindow();
    window.minimize();
  }

  async onCloseClick() {
    const window = await getCurrentWindow();
    window.close();
  }

  onSettingsClick() {
    this.showSettingsModal = true;
  }

  onCloseSettingsModal() {
    this.showSettingsModal = false;
  }
}
