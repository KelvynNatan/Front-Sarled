<?php
class Database {
    private $db_file = __DIR__ . '/../data/forum.db';
    private $pdo;
    
    public function __construct() {
        $this->connect();
        $this->createTables();
    }
    
    private function connect() {
        try {
            // Criar diretório data se não existir
            $data_dir = dirname($this->db_file);
            if (!is_dir($data_dir)) {
                mkdir($data_dir, 0755, true);
            }
            
            $this->pdo = new PDO('sqlite:' . $this->db_file);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $e) {
            die('Erro na conexão: ' . $e->getMessage());
        }
    }
    
    private function createTables() {
        // Tabela de usuários
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                is_admin BOOLEAN DEFAULT 0,
                avatar VARCHAR(255) DEFAULT 'default.png',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME,
                is_online BOOLEAN DEFAULT 0
            )
        ");
        
        // Tabela de categorias
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                icon VARCHAR(50) DEFAULT 'fas fa-comments',
                color VARCHAR(7) DEFAULT '#3b82f6',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");
        
        // Tabela de tópicos
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS topics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                title VARCHAR(200) NOT NULL,
                content TEXT NOT NULL,
                is_pinned BOOLEAN DEFAULT 0,
                is_locked BOOLEAN DEFAULT 0,
                views INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        ");
        
        // Tabela de posts
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                topic_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (topic_id) REFERENCES topics(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        ");
        
        // Inserir dados iniciais
        $this->insertInitialData();
    }
    
    private function insertInitialData() {
        // Verificar se já existem dados
        $stmt = $this->pdo->query('SELECT COUNT(*) FROM users');
        if ($stmt->fetchColumn() > 0) return;
        
        // Criar usuário admin padrão
        $admin_password = password_hash('admin123', PASSWORD_DEFAULT);
        $this->pdo->exec("
            INSERT INTO users (username, email, password, is_admin) 
            VALUES ('admin', 'admin@nexorstudios.com', '$admin_password', 1)
        ");
        
        // Criar categorias padrão
        $categories = [
            ['Discussões Gerais', 'Converse sobre todos os nossos jogos', 'fas fa-gamepad', '#3b82f6'],
            ['Competições & Eventos', 'Participe de torneios e eventos especiais', 'fas fa-trophy', '#f59e0b'],
            ['Suporte Técnico', 'Obtenha ajuda com problemas técnicos', 'fas fa-tools', '#ef4444'],
            ['Sugestões & Feedback', 'Compartilhe suas ideias para melhorar nossos jogos', 'fas fa-lightbulb', '#10b981']
        ];
        
        foreach ($categories as $cat) {
            $this->pdo->prepare("
                INSERT INTO categories (name, description, icon, color) 
                VALUES (?, ?, ?, ?)
            ")->execute($cat);
        }
    }
    
    public function getConnection() {
        return $this->pdo;
    }
}
?>