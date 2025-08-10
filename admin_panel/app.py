from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import sqlite3
import os
import json
from datetime import datetime, timedelta
import hashlib
from functools import wraps
import logging
from collections import defaultdict

app = Flask(__name__)
app.secret_key = 'nexor_admin_secret_key_2024'

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('admin_panel.log'),
        logging.StreamHandler()
    ]
)

# Configurações
ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = 'nexor2024'  # Altere esta senha!
DATABASE_PATH = '../forum/forum.db'
LOGS_PATH = 'access_logs.json'

def init_database():
    """Inicializa o banco de dados com tabelas necessárias"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Tabela de contatos
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'pending',
            admin_response TEXT
        )
    ''')
    
    # Tabela de logs de acesso
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS access_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip_address TEXT NOT NULL,
            user_agent TEXT,
            page TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            user_id INTEGER
        )
    ''')
    
    # Tabela de configurações do site
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS site_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def login_required(f):
    """Decorator para verificar se o usuário está logado"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def log_access(ip, user_agent, page, user_id=None):
    """Registra acesso no banco de dados"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO access_logs (ip_address, user_agent, page, user_id) VALUES (?, ?, ?, ?)',
            (ip, user_agent, page, user_id)
        )
        conn.commit()
        conn.close()
    except Exception as e:
        logging.error(f"Erro ao registrar acesso: {e}")

@app.route('/')
@login_required
def dashboard():
    """Página principal do painel administrativo"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # Estatísticas gerais
        stats = {}
        
        # Total de usuários
        cursor.execute('SELECT COUNT(*) FROM users')
        stats['total_users'] = cursor.fetchone()[0]
        
        # Total de tópicos
        cursor.execute('SELECT COUNT(*) FROM topics')
        stats['total_topics'] = cursor.fetchone()[0]
        
        # Total de posts
        cursor.execute('SELECT COUNT(*) FROM posts')
        stats['total_posts'] = cursor.fetchone()[0]
        
        # Contatos pendentes
        cursor.execute('SELECT COUNT(*) FROM contacts WHERE status = "pending"')
        stats['pending_contacts'] = cursor.fetchone()[0]
        
        # Usuários online (últimos 15 minutos)
        fifteen_minutes_ago = datetime.now() - timedelta(minutes=15)
        cursor.execute(
            'SELECT COUNT(DISTINCT user_id) FROM access_logs WHERE timestamp > ? AND user_id IS NOT NULL',
            (fifteen_minutes_ago,)
        )
        stats['online_users'] = cursor.fetchone()[0]
        
        # Atividade recente
        cursor.execute('''
            SELECT u.username, t.title, t.created_at
            FROM topics t
            JOIN users u ON t.user_id = u.id
            ORDER BY t.created_at DESC
            LIMIT 5
        ''')
        recent_topics = cursor.fetchall()
        
        cursor.execute('''
            SELECT u.username, p.content, p.created_at
            FROM posts p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
            LIMIT 5
        ''')
        recent_posts = cursor.fetchall()
        
        conn.close()
        
        return render_template('dashboard.html', 
                             stats=stats, 
                             recent_topics=recent_topics,
                             recent_posts=recent_posts)
    except Exception as e:
        logging.error(f"Erro no dashboard: {e}")
        return f"Erro: {e}", 500

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Página de login"""
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session['logged_in'] = True
            session['username'] = username
            logging.info(f"Login realizado por {username}")
            return redirect(url_for('dashboard'))
        else:
            logging.warning(f"Tentativa de login inválida: {username}")
            return render_template('login.html', error='Credenciais inválidas')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    """Logout do sistema"""
    session.clear()
    return redirect(url_for('login'))

@app.route('/contacts')
@login_required
def contacts():
    """Gerenciamento de contatos"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, name, email, subject, message, created_at, status, admin_response
            FROM contacts
            ORDER BY created_at DESC
        ''')
        contacts_list = cursor.fetchall()
        
        conn.close()
        
        return render_template('contacts.html', contacts=contacts_list)
    except Exception as e:
        logging.error(f"Erro ao carregar contatos: {e}")
        return f"Erro: {e}", 500

@app.route('/contacts/respond/<int:contact_id>', methods=['POST'])
@login_required
def respond_contact(contact_id):
    """Responder a um contato"""
    try:
        response = request.form['response']
        
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute(
            'UPDATE contacts SET admin_response = ?, status = "responded" WHERE id = ?',
            (response, contact_id)
        )
        
        conn.commit()
        conn.close()
        
        logging.info(f"Resposta enviada para contato {contact_id}")
        return redirect(url_for('contacts'))
    except Exception as e:
        logging.error(f"Erro ao responder contato: {e}")
        return f"Erro: {e}", 500

@app.route('/logs')
@login_required
def logs():
    """Visualização de logs de acesso"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # Logs recentes
        cursor.execute('''
            SELECT al.ip_address, al.user_agent, al.page, al.timestamp, u.username
            FROM access_logs al
            LEFT JOIN users u ON al.user_id = u.id
            ORDER BY al.timestamp DESC
            LIMIT 100
        ''')
        recent_logs = cursor.fetchall()
        
        # Estatísticas de acesso
        cursor.execute('SELECT COUNT(*) FROM access_logs WHERE DATE(timestamp) = DATE("now")')
        today_visits = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(DISTINCT ip_address) FROM access_logs WHERE DATE(timestamp) = DATE("now")')
        unique_visitors_today = cursor.fetchone()[0]
        
        # Páginas mais visitadas
        cursor.execute('''
            SELECT page, COUNT(*) as visits
            FROM access_logs
            WHERE DATE(timestamp) >= DATE("now", "-7 days")
            GROUP BY page
            ORDER BY visits DESC
            LIMIT 10
        ''')
        popular_pages = cursor.fetchall()
        
        conn.close()
        
        return render_template('logs.html', 
                             recent_logs=recent_logs,
                             today_visits=today_visits,
                             unique_visitors_today=unique_visitors_today,
                             popular_pages=popular_pages)
    except Exception as e:
        logging.error(f"Erro ao carregar logs: {e}")
        return f"Erro: {e}", 500

@app.route('/users')
@login_required
def users():
    """Gerenciamento de usuários"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT u.id, u.username, u.email, u.created_at, u.is_active,
                   COUNT(DISTINCT t.id) as topic_count,
                   COUNT(DISTINCT p.id) as post_count
            FROM users u
            LEFT JOIN topics t ON u.id = t.user_id
            LEFT JOIN posts p ON u.id = p.user_id
            GROUP BY u.id
            ORDER BY u.created_at DESC
        ''')
        users_list = cursor.fetchall()
        
        conn.close()
        
        return render_template('users.html', users=users_list)
    except Exception as e:
        logging.error(f"Erro ao carregar usuários: {e}")
        return f"Erro: {e}", 500

@app.route('/api/stats')
@login_required
def api_stats():
    """API para estatísticas em tempo real"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # Dados para gráficos
        # Registros por dia (últimos 7 dias)
        cursor.execute('''
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM users
            WHERE DATE(created_at) >= DATE("now", "-7 days")
            GROUP BY DATE(created_at)
            ORDER BY date
        ''')
        user_registrations = cursor.fetchall()
        
        # Atividade por hora (hoje)
        cursor.execute('''
            SELECT strftime('%H', timestamp) as hour, COUNT(*) as count
            FROM access_logs
            WHERE DATE(timestamp) = DATE("now")
            GROUP BY hour
            ORDER BY hour
        ''')
        hourly_activity = cursor.fetchall()
        
        conn.close()
        
        return jsonify({
            'user_registrations': user_registrations,
            'hourly_activity': hourly_activity
        })
    except Exception as e:
        logging.error(f"Erro na API de stats: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Inicializar banco de dados
    init_database()
    
    # Executar aplicação
    app.run(debug=True, host='0.0.0.0', port=5000)