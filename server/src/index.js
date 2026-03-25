require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const tarefaRoutes = require('./routes/tarefas');
const postRoutes = require('./routes/posts');
const conclusaoRoutes = require('./routes/conclusoes');
const avisoRoutes = require('./routes/avisos');
const CronService = require('./services/CronService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tarefas', tarefaRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/conclusoes', conclusaoRoutes);
app.use('/api/avisos', avisoRoutes);

app.get('/api/health', async (req, res) => {
  try {
    const dbTest = await require('./config/database').query('SELECT 1 as test');
    res.json({ status: 'ok', message: 'Central Divas API Running!', db: 'connected' });
  } catch (error) {
    res.json({ status: 'ok', message: 'Central Divas API Running!', db: 'error', error: error.message });
  }
});

app.get('/api/status', (req, res) => {
  try {
    const cronStatus = CronService.getStatus();
    res.json({ 
      server: 'ok',
      cron: cronStatus
    });
  } catch (error) {
    console.error('Erro no /api/status:', error);
    res.json({ 
      server: 'ok',
      cron: {
        status: 'indisponivel',
        isDiaUtil: false,
        horaAtual: '--:--',
        error: 'Cron não disponível'
      }
    });
  }
});

app.use((err, req, res, next) => {
  console.error('Erro:', err.message);
  
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Arquivo muito grande. Máximo 5MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  CronService.start();
  
  console.log(`
  ╔════════════════════════════════════════════╗
  ║                                            ║
  ║   👑 Central Divas 2.0 - API Server 👑     ║
  ║                                            ║
  ║   Server running on port ${PORT}             ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}               ║
  ║                                            ║
  ╚════════════════════════════════════════════╝
  `);
});

module.exports = app;
