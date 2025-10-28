const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

// Configurar EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configurar pasta pública
app.use(express.static(path.join(__dirname, 'public')));

// Configurar body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// "Banco de dados" em memória
const usuarios = [];

// Rota GET para cadastro
app.get('/cadastra', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'LAB8', 'Cadastro.html'));
});

// Rota POST para cadastro
app.post('/cadastra', (req, res) => {
  const { usuario, email, senha } = req.body;
  usuarios.push({ usuario, email, senha }); // salva em memória
  res.redirect('/login'); // redireciona para login após cadastrar
});

// Rota GET para login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'LAB8', 'Login.html'));
});

// Rota POST para processar login
app.post('/login', (req, res) => {
  const { usuario, senha } = req.body;
  const user = usuarios.find(u => u.usuario === usuario && u.senha === senha);

  if (user) {
    res.render('resposta', { status: 'Login bem-sucedido!', usuario: user.usuario });
  } else {
    res.render('resposta', { status: 'Usuário ou senha inválidos.', usuario: null });
  }
});

// Página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'LAB8', 'Login.html'));
});

const PORT = 80;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}/`);
});
