require('dotenv').config();

const { JWT_SECRET = 'JWT_SECRET', NODE_ENV } = process.env;

module.exports = {
  JWT_SECRET,
  NODE_ENV,
};
