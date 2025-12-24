import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToggleSwitch } from '../../components/toggle-switch/toggle-switch';
import { invoke } from '@tauri-apps/api/core';
import { ToastService } from '../../services/toast.service';

interface Settings {
  autoImportEnabled: boolean;
  autoImportInterval: number;
  alarmEnabled: boolean;
  notificationEnabled: boolean;
  pontomaisLogin: string;
  pontomaisPassword: string;
}

@Component({
  selector: 'app-settings-modal',
  imports: [CommonModule, FormsModule, ToggleSwitch],
  templateUrl: './settings-modal.html',
  styleUrl: './settings-modal.css',
})
export class SettingsModal implements OnInit {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  settings: Settings = {
    autoImportEnabled: false,
    autoImportInterval: 10,
    alarmEnabled: false,
    notificationEnabled: false,
    pontomaisLogin: '',
    pontomaisPassword: ''
  };

  intervalOptions = [
    { value: 10, label: '10 minutos' },
    { value: 15, label: '15 minutos' },
    { value: 30, label: '30 minutos' },
    { value: 60, label: '1 hora' }
  ];

  constructor(private toastService: ToastService) {}

  async ngOnInit() {
    await this.loadSettings();
  }

  async loadSettings() {
    try {
      const loadedSettings = await invoke<Settings>('load_settings');
      this.settings = loadedSettings;
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  }

  async saveSettings() {
    try {
      await invoke('save_settings', { settings: this.settings });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  }

  async onToggleChange() {
    await this.saveSettings();
  }

  async onIntervalChange() {
    await this.saveSettings();
  }

  async onSaveCredentials() {
    if (!this.settings.pontomaisLogin || !this.settings.pontomaisPassword) {
      this.toastService.error('Preencha login e senha', 90000000);
      return;
    }

    try {
      await this.saveSettings();
      this.toastService.success('Credenciais salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar credenciais:', error);
      this.toastService.error('Erro ao salvar credenciais');
    }
  }

  onClose() {
    this.close.emit();
  }

  onOverlayClick(event: MouseEvent) {
    // Fecha o modal apenas se clicar no overlay, não no conteúdo
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
