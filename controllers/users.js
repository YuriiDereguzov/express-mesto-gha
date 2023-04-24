const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken'); // импортируем модуль jsonwebtoken
const User = require('../models/user');
const { JWT_SECRET, NODE_ENV } = require('../config');

const NotFoundError = require('../middlewares/errors/not-found-err');
const BadRequestError = require('../middlewares/errors/bad-request-err');
const ConflictError = require('../middlewares/errors/conflict-err');

// GET /users — возвращает всех пользователей
const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(next);
};

// GET /users/:userId - возвращает пользователя по _id
const getUser = (req, res, next) => {
  User.findById(req.params.userId)
    .then((users) => {
      if (users) {
        res.send(users);
      } else {
        next(new NotFoundError('Пользователь по указанному _id не найден'));
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные пользователя.'));
      } else {
        next(err);
      }
    });
};

// POST /signup — создаёт пользователя
const createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictError('пользователь с таким Email уже существует'));
      } else if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при создании пользователя.'));
      } else {
        next(err);
      }
    });
};

// PATCH /users/me — обновляет профиль
const updateUserProfile = (req, res, next) => {
  console.log(req.user._id);
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        next(new NotFoundError('Пользователь по указанному _id не найден'));
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
      } else {
        next(err);
      }
    });
};

// PATCH /users/me/avatar — обновляет аватар
const updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true })
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        next(new NotFoundError('Пользователь по указанному _id не найден'));
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
      } else {
        next(err);
      }
    });
};

// POST /signin — логинет профиль
const login = (req, res, next) => {
  const { email, password } = req.body;

  User
    .findOne({ email }).select('+password')
    .orFail(() => next(new NotFoundError('Пользователь не найден')))
    .then((user) => bcrypt.compare(password, user.password).then((matched) => {
      if (matched) {
        return user;
      }
      return next(new NotFoundError('Пользователь не найден'));
    }))
    .then((user) => {
      // создадим jwt
      const token = jsonwebtoken.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
      // вернём jwt
      res.send({ user, token });
    })
    .catch(next);
};

// GET /users/me - возвращает информацию о текущем пользователе
const getCurrentUser = (req, res, next) => {
  User
    .findById(req.user._id)
    .orFail(() => next(new NotFoundError('Пользователь не найден')))
    .then((user) => res.send(user))
    .catch(next);
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUserProfile,
  updateUserAvatar,
  login,
  getCurrentUser,
};
