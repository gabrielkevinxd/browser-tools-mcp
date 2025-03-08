# Browser Tools MCP

Ferramentas para navegador que auxiliam no desenvolvimento e depuração de aplicações web.

## Sobre o Projeto

Browser Tools MCP é uma biblioteca TypeScript que fornece ferramentas úteis para desenvolvimento e depuração de aplicações web. Ela inclui funcionalidades para:

- Depuração de estado de componentes
- Medição de performance
- Exportação de dados
- Verificação de compatibilidade do navegador
- Integração com Supabase para persistência de dados

A biblioteca é compatível com aplicações React e servidores Express, fornecendo integrações específicas para cada um.

## Instalação

```bash
npm install browser-tools-mcp
```

ou

```bash
yarn add browser-tools-mcp
```

## Uso Básico

### Uso Direto

```typescript
import { browserTools } from 'browser-tools-mcp';

// Listar todas as ferramentas disponíveis
console.log(browserTools.listTools());

// Usar a ferramenta de depuração de estado
browserTools.executeTool('debugState', { count: 5, items: ['a', 'b', 'c'] });

// Medir a performance de uma função
browserTools.executeTool('measurePerformance', () => {
  // Código a ser medido
  for (let i = 0; i < 1000000; i++) {}
});

// Exportar dados
browserTools.executeTool('exportData', { users: [/* ... */] }, 'users-export.json');

// Verificar compatibilidade do navegador
browserTools.executeTool('checkBrowserCompatibility');
```

### Integração com React

```typescript
import React, { useState, useEffect } from 'react';
import { useBrowserTools } from 'browser-tools-mcp';

const MyComponent = () => {
  const { debugState, measurePerformance, exportData } = useBrowserTools();
  const [data, setData] = useState([]);
  
  useEffect(() => {
    // Depurar o estado atual
    debugState(data, 'Dados iniciais');
    
    // Medir a performance de uma operação
    const processedData = measurePerformance(() => {
      return data.map(item => ({ ...item, processed: true }));
    }, 'Processamento de dados');
    
    setData(processedData);
  }, []);
  
  const handleExport = () => {
    exportData(data, 'meus-dados.json');
  };
  
  return (
    <div>
      {/* ... */}
      <button onClick={handleExport}>Exportar Dados</button>
    </div>
  );
};
```

### Integração com Express

```typescript
import express from 'express';
import { createBrowserToolsExpress } from 'browser-tools-mcp';

const app = express();
const port = 3000;

// Configurar o Browser Tools
const browserTools = createBrowserToolsExpress({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_KEY,
  enableLogging: true
});

// Adicionar o middleware
app.use(browserTools.middleware());

// Adicionar as rotas
app.use('/api/browser-tools', browserTools.router());

// Registrar eventos do servidor
browserTools.logEvent('server-start', { timestamp: new Date() });

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
```

## API

### Classe `BrowserToolsMCP`

A classe principal que gerencia as ferramentas do navegador.

#### Métodos

- `registerTool(tool: BrowserTool)`: Registra uma nova ferramenta
- `executeTool(name: string, ...args: any[])`: Executa uma ferramenta pelo nome
- `listTools()`: Lista todas as ferramentas disponíveis

### Hook `useBrowserTools`

Hook React para usar as ferramentas do navegador em componentes.

#### Retorno

- `debugState(state: any, label?: string)`: Depura o estado de um componente
- `measurePerformance<T>(fn: () => T, label?: string): T`: Mede a performance de uma operação
- `exportData(data: any, filename?: string): boolean`: Exporta dados para um arquivo
- `checkBrowserCompatibility()`: Verifica a compatibilidade do navegador

### Classe `BrowserToolsExpress`

Classe para integração com Express.

#### Métodos

- `middleware()`: Retorna um middleware Express
- `router()`: Retorna um roteador Express com endpoints para browser-tools
- `logEvent(type: string, data: any, userId?: string): Promise<boolean>`: Registra um evento

## Endpoints da API Express

- `POST /api/browser-tools/events`: Registra eventos do cliente
- `GET /api/browser-tools/metrics/performance`: Obtém métricas de performance
- `GET /api/browser-tools/status`: Verifica o status da integração

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'feat: adicionar nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT.