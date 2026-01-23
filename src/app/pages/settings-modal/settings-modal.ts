import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tabs } from '../../components/tabs/tabs';
import { GeneralSettingsComponent } from './general-settings/general-settings';
import { IntegrationSettingsComponent } from './integration-settings/integration-settings';
import { AboutSettingsComponent } from './about-settings/about-settings';
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

interface AppInfo {
  version: string;
  product_name: string;
  tauri_version: string;
  architecture: string;
  os_platform: string;
  build_type: string;
}

@Component({
  selector: 'app-settings-modal',
  imports: [CommonModule, Tabs, GeneralSettingsComponent, IntegrationSettingsComponent, AboutSettingsComponent],
  templateUrl: './settings-modal.html',
  styleUrl: './settings-modal.css',
})
export class SettingsModal implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  activeTabIndex: number = 0;
  tabLabels: string[] = ['Geral', 'Integração', 'Sobre'];

  appInfo: AppInfo = {
    version: '',
    product_name: '',
    tauri_version: '',
    architecture: '',
    os_platform: '',
    build_type: ''
  };

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
    await this.loadAppInfo();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
      this.activeTabIndex = 0;
    }
  }

  async loadSettings() {
    try {
      const loadedSettings = await invoke<Settings>('load_settings');
      this.settings = loadedSettings;
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  }

  async loadAppInfo() {
    try {
      const info = await invoke<AppInfo>('get_app_info');
      this.appInfo = info;
    } catch (error) {
      console.error('Erro ao carregar informações do app:', error);
    }
  }

  async saveSettings() {
    try {
      await invoke('save_settings', { settings: this.settings });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  }

  async onSaveCredentials() {
    if (!this.settings.pontomaisLogin || !this.settings.pontomaisPassword) {
      this.toastService.error('Preencha login e senha', 3000);
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

  onLogout() {
    // TODO: Implementar logout
    console.log('Logout');
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
