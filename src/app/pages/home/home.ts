import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsModal } from '../settings-modal/settings-modal';
import { FlipText } from '../../components/flip-text/flip-text';
import { TimeFormatPipe } from '../../pipes/time-format.pipe';
import { TimeInputDirective } from '../../directives/time-input.directive';
import { TimeCalculationService } from '../../services/time-calculation.service';
import { WindowService } from '../../services/window.service';
import { TimeObject } from '../../models/time-object';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, SettingsModal, FlipText, TimeFormatPipe, TimeInputDirective],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  showSettingsModal = false;
  hasTimeData = false;

  timeEntries = {
    checkIn: '',
    checkOut: '',
    checkIn2: ''
  };

  workedTime: TimeObject = { hours: 0, minutes: 0 };
  remainingTime: TimeObject = { hours: 0, minutes: 0 };
  firstPeriodTime: TimeObject = { hours: 0, minutes: 0 };
  secondPeriodTime: TimeObject = { hours: 0, minutes: 0 };
  endTime: TimeObject = { hours: 0, minutes: 0 };

  private increasing = true;
  private isSimulationRunning = false;

  constructor(
    private timeCalc: TimeCalculationService,
    private windowService: WindowService
  ) {}

  // Calcula tempo de trabalho baseado no horário real (não utilizada, apenas para testes)
  calculateWorkTime(): void {
    const result = this.timeCalc.calculateWorkTime(
      this.timeEntries.checkIn,
      this.timeEntries.checkOut,
      this.timeEntries.checkIn2
    );

    this.firstPeriodTime = result.firstPeriod;
    this.secondPeriodTime = result.secondPeriod;
    this.workedTime = result.workedTime;
    this.remainingTime = result.remainingTime;
    this.endTime = result.endTime;
  }

  startTimeSimulation(): void {
    if (this.isSimulationRunning) return;

    this.isSimulationRunning = true;

    setInterval(() => {
      if (this.increasing) {
        this.timeCalc.incrementTime(this.workedTime);
        this.timeCalc.incrementTime(this.secondPeriodTime);
        this.timeCalc.decrementRemainingTime(this.remainingTime);
        this.timeCalc.incrementTimeWithLimit(this.endTime, 24);

        if (this.workedTime.hours === 8 && this.workedTime.minutes === 0) {
          this.increasing = false;
        }
      } else {
        this.timeCalc.decrementTime(this.workedTime);
        this.timeCalc.decrementTime(this.secondPeriodTime);
        this.timeCalc.incrementTime(this.remainingTime);
        this.timeCalc.decrementTime(this.endTime);

        if (this.endTime.hours < 0) {
          this.endTime.hours += 24;
        }

        if (this.workedTime.hours === 0 && this.workedTime.minutes === 0) {
          this.increasing = true;
        }
      }
    }, 1000);
  }

  get progressPercentageValue(): number {
    const totalWorkMinutes = (this.workedTime.hours * 60) + this.workedTime.minutes;
    const totalJourneyMinutes = 8 * 60;
    const percentage = (totalWorkMinutes / totalJourneyMinutes) * 100;
    return Math.min(percentage, 100);
  }

  async onMinimizeClick(): Promise<void> {
    await this.windowService.minimize();
  }

  async onCloseClick(): Promise<void> {
    await this.windowService.close();
  }

  onStartMonitoringClick(): void {
    // Calcula os valores iniciais baseados nos inputs
    const result = this.timeCalc.calculateWorkTime(
      this.timeEntries.checkIn,
      this.timeEntries.checkOut,
      this.timeEntries.checkIn2
    );

    // Define os valores iniciais calculados
    this.firstPeriodTime = result.firstPeriod;
    this.secondPeriodTime = result.secondPeriod;
    this.workedTime = result.workedTime;
    this.remainingTime = result.remainingTime;
    this.endTime = result.endTime;

    // Ativa as métricas
    this.hasTimeData = true;

    // Inicia a simulação a partir dos valores calculados
    this.startTimeSimulation();
  }

  onImportClick(): void {
    this.timeEntries.checkIn = '08:00';
    this.timeEntries.checkOut = '12:00';
    this.timeEntries.checkIn2 = '13:00';
  }

  onSettingsClick(): void {
    this.showSettingsModal = true;
  }

  onCloseSettingsModal(): void {
    this.showSettingsModal = false;
  }
}
