const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');

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
const uri = 'mongodb+srv://user:password@cluster0.ipnwv3x.mongodb.net/?appName=Cluster0';

MongoClient.connect(uri)
  .then(client => {
    console.log('✅ Conectado ao MongoDB');

    // ----- Banco de dados do LAB9 -----
    const db9 = client.db('blog_bd');
    const posts = db9.collection('posts');

    // Página do blog → lista todos os posts
    app.get('/blog', async (req, res) => {
      const todosPosts = await posts.find().toArray();
      res.render('blog', { posts: todosPosts });
    });

    // Página para cadastrar novo post
    app.get('/cadastrar_post', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'LAB9', 'cadastrar_post.html'));
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

    // ======== LAB10 - CONCESSIONÁRIA ========
    const db10 = client.db('concessionaria_bd');
    const usuarios10 = db10.collection('usuarios');
    const carros10 = db10.collection('carros');

    // Página inicial do LAB10 (projetos)
    app.get('/lab10', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'LAB10', 'GerenciarCarros.html'));
    });

    // ---------- Usuários ----------
    app.get('/lab10/cadastrar_usuario', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'LAB10', 'CadastroUsuario.html'));
    });

    app.post('/lab10/cadastrar_usuario', async (req, res) => {
      const { nome, login, senha } = req.body;
      try {
        await usuarios10.insertOne({ nome, login, senha });
        res.render('resposta_lab10', { mensagem: 'Usuário cadastrado com sucesso!' });
      } catch {
        res.render('resposta_lab10', { mensagem: 'Erro ao cadastrar usuário.' });
      }
    });

    app.get('/lab10/login', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'LAB10', 'Login.html'));
    });

    app.post('/lab10/login', async (req, res) => {
      const { login, senha } = req.body;
      const user = await usuarios10.findOne({ login, senha });
      if (user) {
        res.render('resposta_lab10', { mensagem: `Bem-vindo, ${user.nome}!` });
      } else {
        res.render('resposta_lab10', { mensagem: 'Usuário ou senha inválidos.' });
      }
    });

    // ---------- Carros ----------
    app.get('/lab10/carros', async (req, res) => {
      const lista = await carros10.find().toArray();
      res.render('carros', { carros: lista });
    });

    app.get('/lab10/gerenciar_carros', async (req, res) => {
      const lista = await carros10.find().toArray();
      res.render('gerenciar_carros', { carros: lista });
    });

    app.post('/lab10/cadastrar_carro', async (req, res) => {
      const { marca, modelo, ano, qtde_disponivel } = req.body;
      try {
        await carros10.insertOne({
          marca,
          modelo,
          ano: parseInt(ano),
          qtde_disponivel: parseInt(qtde_disponivel)
        });
        res.redirect('/lab10/gerenciar_carros');
      } catch {
        res.render('resposta_lab10', { mensagem: 'Erro ao cadastrar carro.' });
      }
    });

    app.post('/lab10/atualizar_carro/:id', async (req, res) => {
      const { id } = req.params;
      const { marca, modelo, ano, qtde_disponivel } = req.body;
      await carros10.updateOne(
        { _id: new ObjectId(id) },
        { $set: { marca, modelo, ano: parseInt(ano), qtde_disponivel: parseInt(qtde_disponivel) } }
      );
      res.redirect('/lab10/gerenciar_carros');
    });

    app.get('/lab10/remover_carro/:id', async (req, res) => {
      const { id } = req.params;
      await carros10.deleteOne({ _id: new ObjectId(id) });
      res.redirect('/lab10/gerenciar_carros');
    });

    app.get('/lab10/vender/:id', async (req, res) => {
      const { id } = req.params;
      const carro = await carros10.findOne({ _id: new ObjectId(id) });

      if (!carro) {
        return res.render('resposta_lab10', { mensagem: 'Carro não encontrado.' });
      }

      if (carro.qtde_disponivel <= 0) {
        return res.render('resposta_lab10', { mensagem: 'Esgotado!' });
      }

      await carros10.updateOne(
        { _id: new ObjectId(id) },
        { $inc: { qtde_disponivel: -1 } }
      );

      const novo = await carros10.findOne({ _id: new ObjectId(id) });
      const msg = novo.qtde_disponivel === 0 ? 'Esgotado!' : 'Venda registrada!';
      res.render('resposta_lab10', { mensagem: msg });
    });

  })
  .catch(err => console.error('❌ Erro ao conectar no MongoDB:', err));

// ======== SERVIDOR ========
const PORT = 1600;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}/`);
});
