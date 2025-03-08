/**
 * browser-tools-mcp.ts
 * 
 * Este arquivo contém utilitários para integração com ferramentas de navegador
 * que podem ser usadas para melhorar a experiência do usuário
 * e facilitar a depuração durante o desenvolvimento.
 */

import { createClient } from '@supabase/supabase-js';

// Tipos para as ferramentas do navegador
interface BrowserTool {
  name: string;
  description: string;
  execute: (...args: any[]) => any;
}

// Classe principal para gerenciar as ferramentas do navegador
export class BrowserToolsMCP {
  private tools: Map<string, BrowserTool>;
  private supabaseClient: any;

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    this.tools = new Map();
    
    // Inicializa o cliente Supabase se as credenciais forem fornecidas
    if (supabaseUrl && supabaseKey) {
      this.supabaseClient = createClient(supabaseUrl, supabaseKey);
    }
    
    // Registra as ferramentas padrão
    this.registerDefaultTools();
  }

  /**
   * Registra uma nova ferramenta
   */
  public registerTool(tool: BrowserTool): void {
    if (this.tools.has(tool.name)) {
      console.warn(`Ferramenta "${tool.name}" já está registrada. Substituindo...`);
    }
    
    this.tools.set(tool.name, tool);
    console.log(`Ferramenta "${tool.name}" registrada com sucesso.`);
  }

  /**
   * Executa uma ferramenta pelo nome
   */
  public executeTool(name: string, ...args: any[]): any {
    const tool = this.tools.get(name);
    
    if (!tool) {
      throw new Error(`Ferramenta "${name}" não encontrada.`);
    }
    
    try {
      return tool.execute(...args);
    } catch (error) {
      console.error(`Erro ao executar a ferramenta "${name}":`, error);
      throw error;
    }
  }

  /**
   * Lista todas as ferramentas disponíveis
   */
  public listTools(): { name: string; description: string }[] {
    return Array.from(this.tools.values()).map(tool => ({
      name: tool.name,
      description: tool.description
    }));
  }

  /**
   * Registra as ferramentas padrão
   */
  private registerDefaultTools(): void {
    // Ferramenta para depuração de estado
    this.registerTool({
      name: 'debugState',
      description: 'Exibe o estado atual de um componente no console',
      execute: (state: any) => {
        console.group('Estado do Componente');
        console.log(state);
        console.groupEnd();
        return state;
      }
    });

    // Ferramenta para medir performance
    this.registerTool({
      name: 'measurePerformance',
      description: 'Mede o tempo de execução de uma função',
      execute: (fn: Function, ...args: any[]) => {
        const startTime = performance.now();
        const result = fn(...args);
        const endTime = performance.now();
        
        console.log(`Tempo de execução: ${endTime - startTime}ms`);
        return result;
      }
    });

    // Ferramenta para exportar dados
    this.registerTool({
      name: 'exportData',
      description: 'Exporta dados para um arquivo JSON',
      execute: (data: any, filename: string = 'export.json') => {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(url);
        return true;
      }
    });

    // Ferramenta para verificar compatibilidade do navegador
    this.registerTool({
      name: 'checkBrowserCompatibility',
      description: 'Verifica a compatibilidade do navegador com recursos necessários',
      execute: () => {
        const features = {
          localStorage: !!window.localStorage,
          sessionStorage: !!window.sessionStorage,
          webSockets: !!window.WebSocket,
          serviceWorkers: 'serviceWorker' in navigator,
          webGL: (() => {
            try {
              const canvas = document.createElement('canvas');
              return !!(window.WebGLRenderingContext && 
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
            } catch (e) {
              return false;
            }
          })(),
          webRTC: !!(window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection)
        };
        
        console.table(features);
        return features;
      }
    });

    // Ferramenta para sincronizar com Supabase
    if (this.supabaseClient) {
      this.registerTool({
        name: 'syncWithSupabase',
        description: 'Sincroniza dados com o Supabase',
        execute: async (table: string, data: any) => {
          try {
            const { data: result, error } = await this.supabaseClient
              .from(table)
              .upsert(data, { onConflict: 'id' });
              
            if (error) throw error;
            return result;
          } catch (error) {
            console.error('Erro ao sincronizar com Supabase:', error);
            throw error;
          }
        }
      });
    }
  }
}

// Exporta uma instância padrão para uso rápido
export const browserTools = new BrowserToolsMCP();