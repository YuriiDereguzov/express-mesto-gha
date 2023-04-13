const User = require("../models/user");
const http2 = require("node:http2");

const RES_OK = http2.constants.HTTP_STATUS_OK;
const ERROR_CODE = http2.constants.HTTP_STATUS_BAD_REQUEST;
const ERROR_NOTFOUND = http2.constants.HTTP_STATUS_NOT_FOUND;
const ERROR_DEFAULT = http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR;

// GET /users — возвращает всех пользователей
const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(RES_OK).send(users))
    .catch(() =>
      res.status(ERROR_DEFAULT).send({ Message: "Произошла ошибка." })
    );
};

// GET /users/:userId - возвращает пользователя по _id
const getUser = (req, res) => {
  User.findById(req.params.userId)
    .then((users) => {
      if (users) {
        res.send(users);
      } else {
        res
          .status(ERROR_NOTFOUND)
          .send({ message: "Пользователь по указанному _id не найден." });
      }
    })
    .catch((err) => {
      if (err.name === "CastError") {
        res
          .status(ERROR_CODE)
          .send({ message: "Переданы некорректные данные пользователя." });
      } else {
        res.status(ERROR_DEFAULT).send({ message: "Произошла ошибка" });
      }
    });
};

// POST /users — создаёт пользователя
const createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.status(RES_OK).send(user))
    .catch((err) => {
      if (err.name === "ValidationError") {
        res
          .status(ERROR_CODE)
          .send({
            message: "Переданы некорректные данные при создании пользователя.",
          });
      } else {
        res.status(ERROR_DEFAULT).send({ message: "Произошла ошибка." });
      }
    });
};

// PATCH /users/me — обновляет профиль
const updateUserProfile = (req, res) => {
  console.log(req.user._id);
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true }
  )
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        res
          .status(ERROR_NOTFOUND)
          .send({ message: "Пользователь по указанному _id не найден." });
      }
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        res
          .status(ERROR_CODE)
          .send({
            message: "Переданы некорректные данные при обновлении профиля.",
          });
      } else {
        res.status(ERROR_DEFAULT).send({ message: "Произошла ошибка." });
      }
    });
};

// PATCH /users/me/avatar — обновляет аватар
const updateUserAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true })
    .then((user) => res.status(RES_OK).send(user))
    .catch((err) => {
      if (err.name === "ValidationError") {
        res
          .status(ERROR_CODE)
          .send({
            message: "Переданы некорректные данные при обновлении профиля.",
          });
      } else if (err.name === "CastError") {
        res
          .status(ERROR_NOTFOUND)
          .send({ message: "Пользователь по указанному _id не найден." });
      } else {
        res.status(ERROR_DEFAULT).send({ message: "Произошла ошибка." });
      }
    });
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUserProfile,
  updateUserAvatar,
};
