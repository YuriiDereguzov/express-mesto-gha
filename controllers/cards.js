const Card = require('../models/card');

// GET /cards — возвращает все карточки
const getCards = (req, res) => {
  Card.find({})
    .populate(Card.owner)
    .then((cards) => res.status(200).send(cards))
    .catch(() => res.status(404).send({ Message: 'ошибка поиска карточек' }));
};

// DELETE /cards/:cardId — удаляет карточку по идентификатору
const deleteCard = (req, res) => {
  // Card.findById(req.user._id)
  Card.findByIdAndDelete(req.params.cardId)
    .then((card) => {
      if (card) {
        res.status(200).send({ message: "Карточка удалена" });
      } else {
        res.status(404).send({ message: "ошибка поиска id" });
      }
    })
    .catch((err) => {
      // res.status(500).send({ message: "Произошла ошибка" });
    });
};

// POST /cards — создаёт карточку
const createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.status(200).send(card))
    .catch((err) => {
      // if (err._message == 'card validation failed') {
      //   res.status(400).send({ message: 'Переданы некорректные данные при создании карточки' })
      // } else {
      //   res.status(500).send({ message: 'Произошла ошибка' })
      // }
    });
};

// PUT /cards/:cardId/likes — поставить лайк карточке
const likeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (card) {
        res.status(200).send({ message: "like" });
      } else {
        res
          .status(404)
          .send({ message: "ошибка поиска id" });
      }
    })
    .catch((err) => {
      // res.status(500).send({ message: "Произошла ошибка" });
    });
};

// DELETE /cards/:cardId/likes — убрать лайк с карточки
const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (card) {
        res.status(200).send({ message: "dislike" });
      } else {
        res.status(404).send({ message: "ошибка поиска id" });
      }
    })
    .catch((err) => {
      // res.status(500).send({ message: "Произошла ошибка" });
    });
};

module.exports = {
  getCards, deleteCard, createCard, likeCard, dislikeCard
};
