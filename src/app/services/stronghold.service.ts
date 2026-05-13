import { Injectable } from '@angular/core';
import { Stronghold, Client } from '@tauri-apps/plugin-stronghold';
import { appDataDir } from '@tauri-apps/api/path';

export interface StoredToken {
  token: string;
  client_id: string;
  expiry: string;
  uid: string;
}

@Injectable({
  providedIn: 'root'
})
export class StrongholdService {
  private stronghold?: Stronghold;
  private client?: Client;
  private readonly VAULT_NAME = 'noponto-vault.hold';
  private readonly CLIENT_NAME = 'main';
  private readonly TOKEN_KEY = 'pontomais_token';

  /**
   * Inicializa o Stronghold com a senha mestra do usuário.
   * Por padrão, usa uma senha mestra fixa.
   * Em produção, deveria solicitar ao usuário.
   */
  async initialize(masterPassword: string = 'noponto-master-password'): Promise<boolean> {
    try {
      const vaultPath = `${await appDataDir()}/${this.VAULT_NAME}`;
      this.stronghold = await Stronghold.load(vaultPath, masterPassword);

      try {
        this.client = await this.stronghold.loadClient(this.CLIENT_NAME);
      } catch {
        // Cliente não existe, criar um novo
        this.client = await this.stronghold.createClient(this.CLIENT_NAME);
      }

      return true;
    } catch (error) {
      console.error('Erro ao inicializar Stronghold:', error);
      return false;
    }
  }

  /**
   * Salva o token de autenticação de forma segura
   */
  async saveToken(tokenData: StoredToken): Promise<boolean> {
    if (!this.stronghold) {
      await this.initialize();
    }

    if (!this.client || !this.stronghold) {
      throw new Error('Stronghold não inicializado');
    }

    try {
      const store = this.client.getStore();

      // Converter objeto para JSON e depois para Uint8Array
      const tokenJson = JSON.stringify(tokenData);
      const encoded = new TextEncoder().encode(tokenJson);

      // Salvar no Stronghold
      await store.insert(this.TOKEN_KEY, Array.from(encoded));

      // Persistir no disco
      await this.stronghold.save();

      return true;
    } catch (error) {
      console.error('Erro ao salvar token:', error);
      return false;
    }
  }

  /**
   * Recupera o token salvo
   */
  async getToken(): Promise<StoredToken | null> {
    if (!this.stronghold) {
      await this.initialize();
    }

    if (!this.client) {
      return null;
    }

    try {
      const store = this.client.getStore();

      // Recuperar do Stronghold
      const retrieved = await store.get(this.TOKEN_KEY);

      if (!retrieved) {
        return null;
      }

      // Converter de volta para objeto
      const decoded = new TextDecoder().decode(new Uint8Array(retrieved));
      const tokenData: StoredToken = JSON.parse(decoded);

      return tokenData;
    } catch (error) {
      console.error('Erro ao recuperar token:', error);
      return null;
    }
  }

  /**
   * Remove o token salvo (logout)
   */
  async deleteToken(): Promise<boolean> {
    if (!this.stronghold) {
      await this.initialize();
    }

    if (!this.client || !this.stronghold) {
      throw new Error('Stronghold não inicializado');
    }

    try {
      const store = this.client.getStore();
      await store.remove(this.TOKEN_KEY);
      await this.stronghold.save();
      return true;
    } catch (error) {
      console.error('Erro ao deletar token:', error);
      return false;
    }
  }

  /**
   * Verifica se existe um token salvo
   */
  async hasToken(): Promise<boolean> {
    if (!this.stronghold) {
      await this.initialize();
    }

    try {
      const token = await this.getToken();
      return token !== null;
    } catch {
      return false;
    }
  }
}
