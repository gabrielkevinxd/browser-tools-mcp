/**
 * Integração com browser-tools-mcp no backend Express
 * 
 * Este arquivo fornece utilitários para integrar as ferramentas do navegador
 * com o backend, permitindo o registro de eventos e métricas que podem ser
 * visualizados no frontend.
 */

import express from 'express';
import { createClient } from '@supabase/supabase-js';

/**
 * Configuração para o middleware de browser-tools
 */
export interface BrowserToolsConfig {
  supabaseUrl?: string;
  supabaseKey?: string;
  tableName?: string;
  enableLogging?: boolean;
}

/**
 * Classe para gerenciar a integração com browser-tools no backend
 */
export class BrowserToolsExpress {
  private supabaseClient: any;
  private tableName: string;
  private enableLogging: boolean;

  constructor(config: BrowserToolsConfig = {}) {
    this.tableName = config.tableName || 'browser_tools_events';
    this.enableLogging = config.enableLogging !== false;

    // Inicializa o cliente Supabase se as credenciais forem fornecidas
    if (config.supabaseUrl && config.supabaseKey) {
      this.supabaseClient = createClient(config.supabaseUrl, config.supabaseKey);
    }
  }

  /**
   * Middleware para registrar eventos de browser-tools
   */
  public middleware(): express.RequestHandler {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      // Adiciona um cabeçalho para indicar que o servidor suporta browser-tools
      res.setHeader('X-Browser-Tools-Enabled', 'true');
      
      // Continua com a próxima middleware
      next();
    };
  }

  /**
   * Roteador para endpoints relacionados a browser-tools
   */
  public router(): express.Router {
    const router = express.Router();

    // Endpoint para registrar eventos do cliente
    router.post('/events', async (req, res) => {
      try {
        const { type, data, timestamp, userId } = req.body;
        
        if (!type || !data) {
          return res.status(400).json({ error: 'Tipo e dados do evento são obrigatórios' });
        }
        
        // Registra o evento no Supabase se disponível
        if (this.supabaseClient) {
          const { data: eventData, error } = await this.supabaseClient
            .from(this.tableName)
            .insert([
              {
                type,
                data,
                timestamp: timestamp || new Date().toISOString(),
                user_id: userId || null
              }
            ]);
          
          if (error) throw error;
          
          if (this.enableLogging) {
            console.log(`[Browser Tools] Evento registrado: ${type}`);
          }
          
          return res.status(201).json({ success: true, event: eventData });
        }
        
        // Se não houver Supabase, apenas loga o evento
        if (this.enableLogging) {
          console.log(`[Browser Tools] Evento recebido (sem persistência): ${type}`, data);
        }
        
        res.status(200).json({ success: true, persisted: false });
      } catch (error: any) {
        console.error('[Browser Tools] Erro ao registrar evento:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Endpoint para obter métricas de performance
    router.get('/metrics/performance', async (req, res) => {
      try {
        if (!this.supabaseClient) {
          return res.status(503).json({ error: 'Supabase não configurado' });
        }
        
        const { days = 7 } = req.query;
        
        // Calcula a data de início com base no número de dias
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Number(days));
        
        // Obtém as métricas de performance do Supabase
        const { data, error } = await this.supabaseClient
          .from(this.tableName)
          .select('*')
          .eq('type', 'performance')
          .gte('timestamp', startDate.toISOString())
          .order('timestamp', { ascending: false });
        
        if (error) throw error;
        
        // Processa os dados para o formato adequado
        const metrics = data.map((event: any) => ({
          id: event.id,
          timestamp: event.timestamp,
          operation: event.data.operation,
          duration: event.data.duration,
          userId: event.user_id
        }));
        
        res.status(200).json(metrics);
      } catch (error: any) {
        console.error('[Browser Tools] Erro ao obter métricas de performance:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Endpoint para verificar status
    router.get('/status', (req, res) => {
      res.status(200).json({
        enabled: true,
        version: '1.0.0',
        supabase: !!this.supabaseClient,
        features: [
          'performance-monitoring',
          'compatibility-check',
          'event-logging'
        ]
      });
    });

    return router;
  }

  /**
   * Função para registrar um evento de browser-tools diretamente do servidor
   */
  public async logEvent(type: string, data: any, userId?: string): Promise<boolean> {
    if (!this.supabaseClient) {
      if (this.enableLogging) {
        console.log(`[Browser Tools] Evento do servidor (sem persistência): ${type}`, data);
      }
      return false;
    }
    
    try {
      const { error } = await this.supabaseClient
        .from(this.tableName)
        .insert([
          {
            type,
            data,
            timestamp: new Date().toISOString(),
            user_id: userId || null
          }
        ]);
      
      if (error) {
        console.error('[Browser Tools] Erro ao registrar evento do servidor:', error);
        return false;
      }
      
      if (this.enableLogging) {
        console.log(`[Browser Tools] Evento do servidor registrado: ${type}`);
      }
      
      return true;
    } catch (error) {
      console.error('[Browser Tools] Erro ao registrar evento do servidor:', error);
      return false;
    }
  }
}

// Exporta uma função de fábrica para criar a instância
export const createBrowserToolsExpress = (config?: BrowserToolsConfig) => {
  return new BrowserToolsExpress(config);
};