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
  const { id } = req.params;

  Card.findByIdAndDelete(id)
    .then((card) => res.status(200).send(card))
    .catch(() => res.status(404).send({ Message: 'ошибка поиска id' }));
};

// POST /cards — создаёт карточку
const createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
  .then((card) => res.status(200).send(card))
  // .catch(() => res.status(404).send({ Message: 'ошибка создания карточки' }));
  .catch((err) => {
    console.log(err);
  });
};

// PUT /cards/:cardId/likes — поставить лайк карточке

// DELETE /cards/:cardId/likes — убрать лайк с карточки

module.exports = {
  getCards, deleteCard, createCard,
};
