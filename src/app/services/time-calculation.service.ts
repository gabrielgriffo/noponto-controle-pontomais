import { Injectable } from '@angular/core';
import { TimeObject } from '../models/time-object';

@Injectable({
  providedIn: 'root'
})
export class TimeCalculationService {

  // Converte string HH:MM para minutos totais
  timeStringToMinutes(timeString: string): number {
    if (!timeString || !timeString.includes(':')) return 0;
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Converte minutos totais para objeto TimeObject
  minutesToTimeObject(totalMinutes: number): TimeObject {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes };
  }

  // Obtém a hora atual em minutos
  getCurrentTimeInMinutes(): number {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }

  // Incrementa um TimeObject em 1 minuto
  incrementTime(time: TimeObject): void {
    time.minutes += 1;
    if (time.minutes >= 60) {
      time.hours++;
      time.minutes -= 60;
    }
  }

  // Decrementa um TimeObject em 1 minuto
  decrementTime(time: TimeObject): void {
    time.minutes -= 1;
    if (time.minutes < 0) {
      time.hours--;
      time.minutes += 60;
    }
  }

  // Incrementa tempo com limite de horas (para endTime que não pode passar de 24h)
  incrementTimeWithLimit(time: TimeObject, maxHours: number = 24): void {
    this.incrementTime(time);
    if (time.hours >= maxHours) {
      time.hours -= maxHours;
    }
  }

  // Decrementa tempo restante com proteção para não ficar negativo
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

  // Calcula tempo de trabalho baseado nos horários inseridos
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

    // Primeiro período: checkOut - checkIn
    let firstPeriod = 0;
    if (checkInMinutes && checkOutMinutes) {
      firstPeriod = checkOutMinutes - checkInMinutes;
    }

    // Segundo período: horaAtual - checkIn2 (se já voltou do almoço)
    let secondPeriod = 0;
    if (checkIn2Minutes && currentMinutes >= checkIn2Minutes) {
      secondPeriod = currentMinutes - checkIn2Minutes;
    }

    // Tempo total trabalhado
    const totalWorkedMinutes = firstPeriod + secondPeriod;

    // Tempo restante para completar 8 horas (480 minutos)
    const remainingMinutes = Math.max(0, 480 - totalWorkedMinutes);

    // Fim do expediente (hora atual + tempo restante)
    const endTimeMinutes = currentMinutes + remainingMinutes;

    return {
      firstPeriod: this.minutesToTimeObject(firstPeriod),
      secondPeriod: this.minutesToTimeObject(secondPeriod),
      workedTime: this.minutesToTimeObject(totalWorkedMinutes),
      remainingTime: this.minutesToTimeObject(remainingMinutes),
      endTime: this.minutesToTimeObject(endTimeMinutes % (24 * 60))
    };
  }
}
