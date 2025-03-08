/**
 * Browser Tools MCP
 * 
 * Biblioteca de ferramentas para navegador que auxiliam no desenvolvimento
 * e depuração de aplicações web.
 */

// Exporta a classe principal e a instância padrão
export { BrowserToolsMCP, browserTools } from './browser-tools-mcp';

// Exporta integrações
export { useBrowserTools } from './integrations/react-hooks';
export { 
  BrowserToolsExpress, 
  createBrowserToolsExpress,
  BrowserToolsConfig 
} from './integrations/express-middleware';