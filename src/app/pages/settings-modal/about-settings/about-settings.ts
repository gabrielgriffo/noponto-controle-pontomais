import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AppInfo {
  version: string;
  product_name: string;
  tauri_version: string;
  architecture: string;
  os_platform: string;
  build_type: string;
}

@Component({
  selector: 'app-about-settings',
  imports: [CommonModule],
  templateUrl: './about-settings.html',
  styleUrl: './about-settings.css',
})
export class AboutSettingsComponent {
  @Input() appInfo!: AppInfo;
}
