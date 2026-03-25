const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.tipo !== 'admin' && req.user.tipo !== 'superadmin') {
    return res.status(403).json({ error: 'Acesso permitido apenas para administradores' });
  }
  next();
};

const isSuperAdmin = (req, res, next) => {
  if (req.user.tipo !== 'superadmin') {
    return res.status(403).json({ error: 'Acesso permitido apenas para Super Admin' });
  }
  next();
};

module.exports = { auth, isAdmin, isSuperAdmin };
