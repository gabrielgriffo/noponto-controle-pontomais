import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage, ToastType } from '../../services/toast.service';
import { Subscription } from 'rxjs';

interface ToastItem extends ToastMessage {
  id: number;
  isExiting: boolean;
  zIndex: number;
}

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})
export class Toast implements OnInit, OnDestroy {
  toasts: ToastItem[] = [];
  private subscription?: Subscription;
  private nextId: number = 1;
  private baseZIndex: number = 9999;
  private readonly maxToasts: number = 3;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.subscription = this.toastService.toast$.subscribe((toast: ToastMessage) => {
      this.showToast(toast);
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private showToast(toast: ToastMessage) {
    const activeToasts = this.toasts.filter(t => !t.isExiting);

    // Remove toasts antigos se exceder o limite
    while (activeToasts.length >= this.maxToasts) {
      const oldestToast = activeToasts[0];
      this.closeImmediately(oldestToast.id);
      activeToasts.shift();
    }

    const newToast: ToastItem = {
      id: this.nextId++,
      message: toast.message,
      type: toast.type,
      duration: toast.duration,
      isExiting: false,
      zIndex: this.baseZIndex + this.nextId
    };

    this.toasts.push(newToast);

    const duration = toast.duration || 3000;
    setTimeout(() => {
      this.close(newToast.id);
    }, duration);
  }

  close(id: number) {
    const toast = this.toasts.find(t => t.id === id);
    if (toast && !toast.isExiting) {
      toast.isExiting = true;
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== id);
      }, 300);
    }
  }

  private closeImmediately(id: number) {
    const toast = this.toasts.find(t => t.id === id);
    if (toast && !toast.isExiting) {
      toast.isExiting = true;
      // Remove sem esperar animação
      this.toasts = this.toasts.filter(t => t.id !== id);
    }
  }

  getZIndex(index: number): number {
    const activeToasts = this.toasts.filter(t => !t.isExiting);
    const activeIndex = activeToasts.indexOf(this.toasts[index]);
    return this.baseZIndex + (activeIndex >= 0 ? activeIndex : index);
  }

  getBottomOffset(index: number): number {
    const activeToasts = this.toasts.filter(t => !t.isExiting);
    const activeIndex = activeToasts.indexOf(this.toasts[index]);
    if (activeIndex < 0) return 20;
    return 20 + (activeIndex * 5);
  }

  getOpacity(index: number): number | undefined {
    const toast = this.toasts[index];

    // Deixa animação CSS controlar opacidade ao sair
    if (toast.isExiting) {
      return undefined;
    }

    const activeToasts = this.toasts.filter(t => !t.isExiting);
    const activeIndex = activeToasts.indexOf(toast);

    if (activeIndex < 0) return 1;

    const toastsAbove = activeToasts.length - 1 - activeIndex;
    const opacity = 1 - (toastsAbove * 0.25);
    return Math.max(0.5, opacity);
  }
}
