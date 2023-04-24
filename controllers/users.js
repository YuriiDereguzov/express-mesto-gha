// const http2 = require('node:http2');
const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken'); // импортируем модуль jsonwebtoken
const User = require('../models/user');
const { JWT_SECRET, NODE_ENV } = require('../config');

// const ERROR_CODE = http2.constants.HTTP_STATUS_BAD_REQUEST;
// const ERROR_NOTFOUND = http2.constants.HTTP_STATUS_NOT_FOUND;
// const ERROR_DEFAULT = http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR;
const NotFoundError = require('../middlewares/errors/not-found-err');
const BadRequestError = require('../middlewares/errors/bad-request-err');
const ConflictError = require('../middlewares/errors/conflict-err');

// GET /users — возвращает всех пользователей
const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    // .catch(() => res.status(ERROR_DEFAULT).send({ message: 'Произошла ошибка.' }));
    .catch(next);
};

// GET /users/:userId - возвращает пользователя по _id
const getUser = (req, res, next) => {
  User.findById(req.params.userId)
    .then((users) => {
      if (users) {
        res.send(users);
      } else {
        // res
        //   .status(ERROR_NOTFOUND)
        //   .send({ message: 'Пользователь по указанному _id не найден.' });
        next(new NotFoundError('Пользователь по указанному _id не найден'));
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        // res
        //   .status(ERROR_CODE)
        //   .send({ message: 'Переданы некорректные данные пользователя.' });
        next(new BadRequestError('Переданы некорректные данные пользователя.'));
      } else {
        // res.status(ERROR_DEFAULT).send({ message: 'Произошла ошибка' });
        next(err);
      }
    });
};

// POST /signup — создаёт пользователя
const createUser = (req, res, next) => {
  // const { name, about, avatar } = req.body;
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
  // User.create({ name, about, avatar })
    .then((user) => res.send(user))
    // .catch((err) => {
    //   if (err.name === 'ValidationError') {
    //     res
    //       .status(ERROR_CODE)
    //       .send({ message: 'Переданы некорректные данные при создании пользователя.' });
    //   } else {
    //     res.status(ERROR_DEFAULT).send({ message: 'Произошла ошибка.' });
    //   }
    // });
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
        // res
        //   .status(ERROR_NOTFOUND)
        //   .send({ message: 'Пользователь по указанному _id не найден.' });
        next(new NotFoundError('Пользователь по указанному _id не найден'));
      }
    })
    // .catch((err) => {
    //   if (err.name === 'ValidationError') {
    //     res
    //       .status(ERROR_CODE)
    //       .send({ message: 'Переданы некорректные данные при обновлении профиля.' });
    //   } else {
    //     res
    //       .status(ERROR_DEFAULT)
    //       .send({ message: 'Произошла ошибка.' });
    //   }
    // });
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
        // res
        //   .status(ERROR_NOTFOUND)
        //   .send({ message: 'Пользователь по указанному _id не найден.' });
        next(new NotFoundError('Пользователь по указанному _id не найден'));
      }
    })
    // .catch((err) => {
    //   if (err.name === 'ValidationError') {
    //     res
    //       .status(ERROR_CODE)
    //       .send({ message: 'Переданы некорректные данные при обновлении профиля.' });
    //   } else {
    //     res
    //       .status(ERROR_DEFAULT)
    //       .send({ message: 'Произошла ошибка.' });
    //   }
    // });
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
    // .orFail(() => res.status(404).send({ message: 'Пользователь не найден' }))
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
    // .catch((err) => {
    //   // res
    //   //   .status(401)
    //   //   .send({ message: err.message });
    //   // next(new UnauthorizedError('Отсутствует авторизация'));
    //   // next(new UnauthorizedError('Необходима авторизация'));
    // });
    .catch(next);
};

// GET /users/me - возвращает информацию о текущем пользователе
const getCurrentUser = (req, res, next) => {
  User
    .findById(req.user._id)
    .orFail(() => next(new NotFoundError('Пользователь не найден')))
    .then((user) => res.send(user))
    // .catch((err) => res.status(401).send({ message: err.message }));
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
