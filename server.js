const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

const PORT = 80;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}/index.html`);
});
