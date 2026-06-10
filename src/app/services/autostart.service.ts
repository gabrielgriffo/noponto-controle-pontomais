import { Injectable } from '@angular/core';
import { enable, isEnabled, disable } from '@tauri-apps/plugin-autostart';

@Injectable({
  providedIn: 'root'
})
export class AutostartService {

  /**
   * Habilita o autostart da aplicação
   */
  async enable(): Promise<void> {
    await enable();
  }

  /**
   * Verifica se o autostart está habilitado
   */
  async isEnabled(): Promise<boolean> {
    return await isEnabled();
  }

  /**
   * Desabilita o autostart da aplicação
   */
  async disable(): Promise<void> {
    await disable();
  }
}
