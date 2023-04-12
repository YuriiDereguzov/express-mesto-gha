const User = require('../models/user');

// GET /users — возвращает всех пользователей
const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch(() => res.status(500).send({ Message: "ошибка поиска пользователей" }));
};

// GET /users/:userId - возвращает пользователя по _id
const getUser = (req, res) => {
  User.findById(req.params.userId)
    .then((user) =>{
      if (user) {
        res.status(200).send(user);
      } else {
        res.status(404).send({ message: "ошибка поиска по id" })
      }
    })
    .catch((err) => {
      console.log(err);
      // if (err.name == 'CastError') {
      //   res.status(400).send({ message: 'Некоретный id' })
      // } else {
      //   res.status(500).send({ message: 'Произошла ошибка' })
      // }
    });
};

// POST /users — создаёт пользователя
const createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      console.log(err);
      // if (err._message == 'user validation failed') {
      //   res.status(400).send({ message: 'Переданы некорректные данные при создании пользователя' })
      // } else {
      //   res.status(500).send({ message: 'Произошла ошибка' })
      // }
    });
};

// PATCH /users/me — обновляет профиль
const updateUserProfile = (req, res) => {
  console.log(req.user._id);
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true })
    .then((user) =>{
      if (user) {
        res.status(200).send(user);
      } else {
        res.status(404).send({message: "пользователь не найден"})
      }
    })
    .catch((err) => {
      console.log(err);
      // if (err._message == 'user validation failed') {
      //   res.status(400).send({ message: 'Переданы некорректные данные при обновлении профиля' })
      // } else {
      //   res.status(500).send({ message: 'Произошла ошибка' })
      // }
    });
};

// PATCH /users/me/avatar — обновляет аватар
const updateUserAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true })
    .then((user) =>{
      if (user) {
        res.status(200).send(user);
      } else {
        res.status(404).send({message: "пользователь не найден"})
      }
    })
    .catch((err) => {
      console.log(err);
      // if (err._message == 'user validation failed') {
      //   res.status(400).send({ message: 'Переданы некорректные данные при обновлении аватара' })
      // } else {
      //   res.status(500).send({ message: 'Произошла ошибка' })
      // }
    });
};

module.exports = {
  getUsers, getUser, createUser, updateUserProfile, updateUserAvatar,
};
