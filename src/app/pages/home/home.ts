import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { SettingsModal } from '../settings-modal/settings-modal';
import { FlipText } from '../../components/flip-text/flip-text';
import { TimeFormatPipe } from '../../pipes/time-format.pipe';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, SettingsModal, FlipText, TimeFormatPipe],
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
    hours: 7,
    minutes: 50
  };

  // Tempo Restante
  remainingTime = {
    hours: 7,
    minutes: 50
  };

  // Primeiro período de trabalho
  firstPeriodTime = {
    hours: 2,
    minutes: 34
  };

  // Segundo período de trabalho
  secondPeriodTime = {
    hours: 5,
    minutes: 21
  };

  // Horário de fim do expediente
  endTime = {
    hours: 18,
    minutes: 54
  };

  private increasing = true; // Controla se está crescendo ou decrescendo
  hasTimeData: boolean = true;

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
    }, 1000);
  }

  onTimeInput(field: keyof typeof this.timeEntries): void {
    const inputElement = document.getElementById(field) as HTMLInputElement
    let value = inputElement.value.replace(/[^0-9]/g, '');
    
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
      inputElement.value = '';
    } else if (value.length <= 2) {
      inputElement.value = value;
    } else {
      inputElement.value = value.slice(0, 2) + ':' + value.slice(2, 4);
    }
    
    this.timeEntries[field] = inputElement.value;
  }

  get progressPercentageValue(): number {
    // Calcula o percentual baseado em uma jornada de 8 horas (480 minutos)
    const totalWorkMinutes = (this.workedTime.hours * 60) + this.workedTime.minutes;
    const totalJourneyMinutes = 8 * 60; // 480 minutos
    const percentage = (totalWorkMinutes / totalJourneyMinutes) * 100;

    return Math.min(percentage, 100); // Limita a 100%
  }

  // get hasTimeData(): boolean {
  //   // Verifica se há pelo menos um horário válido no formato HH:MM
  //   const hasValidCheckIn = this.timeEntries.checkIn.includes(':');
  //   const hasValidCheckOut = this.timeEntries.checkOut.includes(':');
  //   const hasValidCheckIn2 = this.timeEntries.checkIn2.includes(':');
    
  //   // return true;
  //   return hasValidCheckIn || hasValidCheckOut || hasValidCheckIn2;
  // }

  async onMinimizeClick() {
    const window = await getCurrentWindow();
    window.minimize();
  }

  async onCloseClick() {
    const window = await getCurrentWindow();
    window.close();
  }

  onStartMonitoringClick(){
    // this.timeEntries.checkIn
    // console.log(this.timeEntries.checkIn);
    
    // this.workedTime.hours
  }

  onImportClick(){
    this.hasTimeData = !this.hasTimeData;
  }

  onSettingsClick() {
    this.showSettingsModal = true;
  }

  onCloseSettingsModal() {
    this.showSettingsModal = false;
  }
}
