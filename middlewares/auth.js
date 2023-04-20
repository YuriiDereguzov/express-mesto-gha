const jsonwebtoken = require('jsonwebtoken');

const { JWT_SECRET } = require('../config');

const auth = (req, res, next) => {
  // достаём авторизационный заголовок
  const { authorization } = req.headers;
  // убеждаемся, что он есть или начинается с Bearer
  if (!authorization || !authorization.startsWith('Bearer')) {
    res.status(401).send({ message: 'Необходима авторизация' });
  }

  // извлечём jwt
  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    // попытаемся верифицировать токен
    payload = jsonwebtoken.verify(token, JWT_SECRET);
  } catch (err) {
    // отправим ошибку, если не получилось
    res.status(401).send({ message: 'Необходима авторизация' });
  }
  req.user = payload; // записываем пейлоуд в объект запроса

  next();
};

module.exports = auth;