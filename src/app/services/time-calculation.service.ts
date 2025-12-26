import { Injectable } from '@angular/core';
import { TimeObject } from '../models/time-object';

@Injectable({
  providedIn: 'root'
})
export class TimeCalculationService {

  timeStringToMinutes(timeString: string): number {
    if (!timeString || !timeString.includes(':')) return 0;
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Trata virada de dia: se end < start, adiciona 24h
  calculateTimeDifference(startMinutes: number, endMinutes: number): number {
    if (endMinutes >= startMinutes) {
      return endMinutes - startMinutes;
    } else {
      return (endMinutes + 1440) - startMinutes;
    }
  }

  minutesToTimeObject(totalMinutes: number): TimeObject {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes };
  }

  getCurrentTimeInMinutes(): number {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }

  incrementTime(time: TimeObject): void {
    time.minutes += 1;
    if (time.minutes >= 60) {
      time.hours++;
      time.minutes -= 60;
    }
  }

  decrementTime(time: TimeObject): void {
    time.minutes -= 1;
    if (time.minutes < 0) {
      time.hours--;
      time.minutes += 60;
    }
  }

  incrementTimeWithLimit(time: TimeObject, maxHours: number = 24): void {
    this.incrementTime(time);
    if (time.hours >= maxHours) {
      time.hours -= maxHours;
    }
  }

  decrementRemainingTime(time: TimeObject): void {
    time.minutes -= 1;
    if (time.minutes < 0) {
      if (time.hours > 0) {
        time.hours--;
        time.minutes = 59;
      } else {
        time.minutes = 0;
      }
    }
  }

  calculateWorkTime(
    checkIn: string,
    checkOut: string,
    checkIn2: string
  ): {
    firstPeriod: TimeObject;
    secondPeriod: TimeObject;
    workedTime: TimeObject;
    remainingTime: TimeObject;
    endTime: TimeObject;
  } {
    const checkInMinutes = this.timeStringToMinutes(checkIn);
    const checkOutMinutes = this.timeStringToMinutes(checkOut);
    const checkIn2Minutes = this.timeStringToMinutes(checkIn2);
    const currentMinutes = this.getCurrentTimeInMinutes();

    let firstPeriod = 0;
    let secondPeriod = 0;

    if (checkInMinutes && !checkOutMinutes && !checkIn2Minutes) {
      firstPeriod = this.calculateTimeDifference(checkInMinutes, currentMinutes);
    }
    else if (checkInMinutes && checkOutMinutes) {
      firstPeriod = this.calculateTimeDifference(checkInMinutes, checkOutMinutes);

      if (checkIn2Minutes) {
        secondPeriod = this.calculateTimeDifference(checkIn2Minutes, currentMinutes);
      }
    }

    const totalWorkedMinutes = firstPeriod + secondPeriod;
    const remainingMinutes = Math.max(0, 480 - totalWorkedMinutes);

    let endTimeMinutes: number;
    if (totalWorkedMinutes >= 480) {
      endTimeMinutes = currentMinutes - (totalWorkedMinutes - 480);
    } else {
      endTimeMinutes = currentMinutes + remainingMinutes;
    }

    return {
      firstPeriod: this.minutesToTimeObject(firstPeriod),
      secondPeriod: this.minutesToTimeObject(secondPeriod),
      workedTime: this.minutesToTimeObject(totalWorkedMinutes),
      remainingTime: this.minutesToTimeObject(remainingMinutes),
      endTime: this.minutesToTimeObject(endTimeMinutes % (24 * 60))
    };
  }
}
