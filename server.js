const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();

// ======== CONFIGURAÇÕES GERAIS ========
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ======== LOGIN (LAB8) ========
const usuarios = [];

// Página inicial → Login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'LAB8', 'Login.html'));
});

// Rota GET → Cadastro
app.get('/cadastra', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'LAB8', 'Cadastro.html'));
});

// Rota POST → Cadastro
app.post('/cadastra', (req, res) => {
  const { usuario, email, senha } = req.body;
  usuarios.push({ usuario, email, senha });
  res.redirect('/login');
});

// Rota GET → Login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'LAB8', 'Login.html'));
});

// Rota POST → Login
app.post('/login', (req, res) => {
  const { usuario, senha } = req.body;
  const user = usuarios.find(u => u.usuario === usuario && u.senha === senha);

  if (user) {
    res.render('resposta', { status: 'Login bem-sucedido!', usuario: user.usuario });
  } else {
    res.render('resposta', { status: 'Usuário ou senha inválidos.', usuario: null });
  }
});

// ======== BLOG (LAB9) ========
const uri = 'mongodb+srv://gustavobarsil:barbosa2202@cluster0.ipnwv3x.mongodb.net/?appName=Cluster0';

MongoClient.connect(uri)
  .then(client => {
    console.log('✅ Conectado ao MongoDB');
    const db = client.db('blog_bd');
    const posts = db.collection('posts');

    // Página do blog → lista todos os posts
    app.get('/blog', async (req, res) => {
      const todosPosts = await posts.find().toArray();
      res.render('blog', { posts: todosPosts });
    });

    // Página para cadastrar novo post
    app.get('/cadastrar_post', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'cadastrar_post.html'));
    });

    // Recebe o formulário de novo post
    app.post('/cadastrar_post', async (req, res) => {
      const novoPost = {
        titulo: req.body.titulo,
        resumo: req.body.resumo,
        conteudo: req.body.conteudo
      };

      try {
        await posts.insertOne(novoPost);
        res.render('resposta_post', { resposta: 'Post cadastrado com sucesso!' });
      } catch {
        res.render('resposta_post', { resposta: 'Erro ao cadastrar o post!' });
      }
    });
  })
  .catch(err => console.error('❌ Erro ao conectar no MongoDB:', err));

// ======== SERVIDOR ========
const PORT = 1600;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}/`);
});
