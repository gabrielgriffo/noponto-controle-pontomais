import { Injectable } from '@angular/core';
import { getCurrentWindow } from '@tauri-apps/api/window';

@Injectable({
  providedIn: 'root'
})
export class WindowService {

  async minimize(): Promise<void> {
    const window = await getCurrentWindow();
    await window.minimize();
  }

  async close(): Promise<void> {
    const window = await getCurrentWindow();
    await window.close();
  }
}
