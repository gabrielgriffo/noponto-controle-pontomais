import { Component, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsModal } from '../settings-modal/settings-modal';
import { FlipText } from '../../components/flip-text/flip-text';
import { TimeFormatPipe } from '../../pipes/time-format.pipe';
import { TimeInputDirective } from '../../directives/time-input.directive';
import { TimeCalculationService } from '../../services/time-calculation.service';
import { WindowService } from '../../services/window.service';
import { TimeObject } from '../../models/time-object';
import { TimeUtilsService } from '../../services/time-utils.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, SettingsModal, FlipText, TimeFormatPipe, TimeInputDirective],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnDestroy {
  showSettingsModal = false;
  isMonitoring = false;

  @ViewChild('checkInInput') checkInInput!: ElementRef<HTMLInputElement>;
  @ViewChild('checkOutInput') checkOutInput!: ElementRef<HTMLInputElement>;
  @ViewChild('checkIn2Input') checkIn2Input!: ElementRef<HTMLInputElement>;

  workedTime: TimeObject = { hours: 0, minutes: 0 };
  remainingTime: TimeObject = { hours: 0, minutes: 0 };
  firstPeriodTime: TimeObject = { hours: 0, minutes: 0 };
  secondPeriodTime: TimeObject = { hours: 0, minutes: 0 };
  endTime: TimeObject = { hours: 0, minutes: 0 };

  private updateInterval: any;
  private capturedCheckIn: string = '';
  private capturedCheckOut: string = '';
  private capturedCheckIn2: string = '';

  constructor(
    private timeCalc: TimeCalculationService,
    private timeUtils: TimeUtilsService,
    private windowService: WindowService
  ) {}

  updateWorkTime(): void {
    const result = this.timeCalc.calculateWorkTime(
      this.capturedCheckIn,
      this.capturedCheckOut,
      this.capturedCheckIn2
    );

    this.firstPeriodTime = result.firstPeriod;
    this.secondPeriodTime = result.secondPeriod;
    this.workedTime = result.workedTime;
    this.remainingTime = result.remainingTime;
    this.endTime = result.endTime;
  }

  get progressPercentageValue(): number {
    const totalWorkMinutes = (this.workedTime.hours * 60) + this.workedTime.minutes;
    const totalJourneyMinutes = 8 * 60;
    const percentage = (totalWorkMinutes / totalJourneyMinutes) * 100;
    return Math.min(percentage, 100);
  }

  get firstPeriodPercentage(): number {
    const firstPeriodMinutes = (this.firstPeriodTime.hours * 60) + this.firstPeriodTime.minutes;
    const totalJourneyMinutes = 8 * 60;
    const percentage = (firstPeriodMinutes / totalJourneyMinutes) * 100;
    return Math.min(percentage, 100);
  }

  get secondPeriodPercentage(): number {
    const secondPeriodMinutes = (this.secondPeriodTime.hours * 60) + this.secondPeriodTime.minutes;
    const totalJourneyMinutes = 8 * 60;
    const percentage = (secondPeriodMinutes / totalJourneyMinutes) * 100;
    return Math.min(percentage, 100);
  }

  get hasFirstPeriod(): boolean {
    return this.capturedCheckIn.length > 0;
  }

  get hasSecondPeriod(): boolean {
    return this.capturedCheckIn2.length > 0;
  }

  async onMinimizeClick(): Promise<void> {
    await this.windowService.minimize();
  }

  async onCloseClick(): Promise<void> {
    await this.windowService.close();
  }

  onStartMonitoringClick(): void {
    this.capturedCheckIn = this.checkInInput.nativeElement.value;
    this.capturedCheckOut = this.checkOutInput.nativeElement.value;
    this.capturedCheckIn2 = this.checkIn2Input.nativeElement.value;

    this.updateWorkTime();

    this.isMonitoring = true;

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.updateInterval = setInterval(() => {
      this.updateWorkTime();
    }, 1000);
  }

  onImportClick(): void {
    this.checkInInput.nativeElement.value = this.timeUtils.formatTimeInput('12:00');
    this.checkOutInput.nativeElement.value = this.timeUtils.formatTimeInput('12:00');
    this.checkIn2Input.nativeElement.value = this.timeUtils.formatTimeInput('13:00');
  }

  onSettingsClick(): void {
    this.showSettingsModal = true;
  }

  onCloseSettingsModal(): void {
    this.showSettingsModal = false;
  }

  ngOnDestroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}
