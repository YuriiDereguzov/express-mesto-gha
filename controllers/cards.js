const Card = require("../models/card");
const http2 = require("node:http2");

const RES_OK = http2.constants.HTTP_STATUS_OK;
const ERROR_CODE = http2.constants.HTTP_STATUS_BAD_REQUEST;
const ERROR_NOTFOUND = http2.constants.HTTP_STATUS_NOT_FOUND;
const ERROR_DEFAULT = http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR;

// GET /cards — возвращает все карточки
const getCards = (req, res) => {
  Card.find({})
    .populate(Card.owner)
    .then((cards) => res.status(RES_OK).send(cards))
    .catch(() =>
      res.status(ERROR_DEFAULT).send({ Message: "Произошла ошибка." })
    );
};

// DELETE /cards/:cardId — удаляет карточку по идентификатору
const deleteCard = (req, res) => {
  Card.findByIdAndDelete(req.params.cardId)
    .then((users) => {
      if (users) {
        res.send(users);
      } else {
        res
          .status(ERROR_NOTFOUND)
          .send({ message: "Карточка с указанным _id не найдена." });
      }
    })
    .catch((err) => {
      if (err.name === "CastError") {
        res
          .status(ERROR_CODE)
          .send({ message: "Переданы некорректные данные." });
      } else {
        res.status(ERROR_DEFAULT).send({ message: "Произошла ошибка" });
      }
    });
};

// POST /cards — создаёт карточку
const createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.status(RES_OK).send(card))
    .catch((err) => {
      if (err.name === "ValidationError") {
        res
          .status(ERROR_CODE)
          .send({
            message: "Переданы некорректные данные при создании карточки.",
          });
      } else {
        res.status(ERROR_DEFAULT).send({ message: "Произошла ошибка." });
      }
    });
};

// PUT /cards/:cardId/likes — поставить лайк карточке
const likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .then((card) => {
      if (card) {
        res.send({ message: "like." });
      } else {
        res
          .status(ERROR_NOTFOUND)
          .send({ message: "Передан несуществующий _id карточки." });
      }
    })
    .catch((err) => {
      if (err.name === "CastError") {
        res
          .status(ERROR_CODE)
          .send({
            message: "Переданы некорректные данные для постановки лайка.",
          });
      } else {
        res.status(ERROR_DEFAULT).send({ message: "Произошла ошибка." });
      }
    });
};

// DELETE /cards/:cardId/likes — убрать лайк с карточки
const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .then((card) => {
      if (card) {
        res.send({ message: "dislike." });
      } else {
        res
          .status(ERROR_NOTFOUND)
          .send({ message: "Передан несуществующий _id карточки." });
      }
    })
    .catch((err) => {
      if (err.name === "CastError") {
        res
          .status(ERROR_CODE)
          .send({ message: "Переданы некорректные данные для снятия лайка." });
      } else {
        res.status(ERROR_DEFAULT).send({ message: "Произошла ошибка." });
      }
    });
};

module.exports = {
  getCards,
  deleteCard,
  createCard,
  likeCard,
  dislikeCard,
};
