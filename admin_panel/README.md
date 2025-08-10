# NEXOR Admin Panel

Painel administrativo em Python/Flask para gerenciar o site NEXOR.

## Funcionalidades

- **Dashboard**: Visão geral com estatísticas em tempo real
- **Gerenciamento de Usuários**: Visualizar, ativar/desativar e gerenciar usuários do fórum
- **Contatos**: Responder e gerenciar mensagens de contato do site
- **Logs & Analytics**: Monitorar acessos, páginas mais visitadas e atividade do site
- **Gráficos Interativos**: Visualizações de dados em tempo real
- **Interface Moderna**: Design responsivo com Bootstrap 5

## Instalação

1. **Instalar dependências**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configurar banco de dados**:
   - O painel usa o mesmo banco SQLite do fórum (`../forum/forum.db`)
   - As tabelas necessárias são criadas automaticamente

3. **Executar o painel**:
   ```bash
   python app.py
   ```

4. **Acessar o painel**:
   - URL: `http://localhost:5000`
   - Usuário: `admin`
   - Senha: `nexor2024` (altere no arquivo `app.py`)

## Estrutura do Projeto

```
admin_panel/
├── app.py                 # Aplicação principal Flask
├── requirements.txt       # Dependências Python
├── README.md             # Este arquivo
└── templates/            # Templates HTML
    ├── base.html         # Template base
    ├── login.html        # Página de login
    ├── dashboard.html    # Dashboard principal
    ├── users.html        # Gerenciamento de usuários
    ├── contacts.html     # Gerenciamento de contatos
    └── logs.html         # Logs e analytics
```

## Configuração

### Alterar Credenciais de Admin

No arquivo `app.py`, altere as seguintes linhas:

```python
ADMIN_USERNAME = 'admin'        # Seu usuário
ADMIN_PASSWORD = 'nexor2024'    # Sua senha
```

### Configurar Banco de Dados

O caminho do banco pode ser alterado em:

```python
DATABASE_PATH = '../forum/forum.db'
```

## Recursos

### Dashboard
- Estatísticas em tempo real
- Gráficos de atividade
- Alertas de contatos pendentes
- Atividade recente do fórum

### Gerenciamento de Usuários
- Lista completa de usuários
- Filtros por status (ativo/inativo)
- Busca por nome ou email
- Ações: ativar, desativar, excluir
- Estatísticas de atividade

### Contatos
- Visualizar mensagens de contato
- Responder diretamente pelo painel
- Filtrar por status (pendente/respondido)
- Link para email direto

### Logs & Analytics
- Logs de acesso detalhados
- Páginas mais visitadas
- Gráficos de navegadores
- Atividade por hora
- Filtros e busca

## Segurança

- Autenticação obrigatória
- Sessões seguras
- Logs de todas as ações administrativas
- Proteção contra SQL injection
- Validação de entrada

## Desenvolvimento

### Adicionar Novas Funcionalidades

1. Criar nova rota em `app.py`
2. Criar template correspondente em `templates/`
3. Adicionar link no menu lateral (`base.html`)

### Personalizar Interface

- Estilos CSS estão incorporados nos templates
- Use Bootstrap 5 para componentes
- Ícones Font Awesome disponíveis
- Gráficos com Chart.js

## Troubleshooting

### Erro de Banco de Dados
- Verifique se o arquivo `forum.db` existe
- Certifique-se que o caminho está correto
- Execute o fórum pelo menos uma vez para criar o banco

### Erro de Permissões
- Verifique permissões de leitura/escrita na pasta
- Execute como administrador se necessário

### Porta em Uso
- Altere a porta no final do `app.py`:
  ```python
  app.run(debug=True, host='0.0.0.0', port=5001)
  ```

## Logs

O painel gera logs em `admin_panel.log` com:
- Tentativas de login
- Ações administrativas
- Erros do sistema
- Acessos ao painel

## Backup

Recomenda-se fazer backup regular de:
- `../forum/forum.db` (banco de dados)
- `admin_panel.log` (logs do sistema)
- Configurações personalizadas

## Suporte

Para suporte ou dúvidas:
- Verifique os logs em `admin_panel.log`
- Consulte a documentação do Flask
- Verifique as configurações do banco de dados