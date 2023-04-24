// const http2 = require('node:http2');
const Card = require('../models/card');

// const ERROR_CODE = http2.constants.HTTP_STATUS_BAD_REQUEST;
// const ERROR_NOTFOUND = http2.constants.HTTP_STATUS_NOT_FOUND;
// const ERROR_DEFAULT = http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR;
const NotFoundError = require('../middlewares/errors/not-found-err');
const BadRequestError = require('../middlewares/errors/bad-request-err');
const ConflictError = require('../middlewares/errors/conflict-err');

// GET /cards — возвращает все карточки
const getCards = (req, res, next) => {
  Card.find({})
    .populate(Card.owner)
    .then((cards) => res.send(cards))
    // .catch(() => res.status(ERROR_DEFAULT).send({ message: 'Произошла ошибка.' }));
    .catch(next);
};

// DELETE /cards/:cardId — удаляет карточку по идентификатору
const deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .populate('owner')
    .then((card) => {
      if (card.owner._id.toString() === req.user._id) {
        Card.deleteOne(card)
          .then((deletedCard) => {
            if (deletedCard) {
              res.send({ deletedCard, message: 'Карточка успешно удалена' });
            } else {
              next(new NotFoundError(`Карточка с _id ${req.params.cardId} не найдена`));
            }
          });
      } else {
        next(new ConflictError('Вы не можете удалять чужие карточки'));
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};
// const deleteCard = (req, res) => {
//   Card.findById(req.params.cardId)
//     .orFail(() => new Error('User not found'))
//     .then((card) => {
//       if (card.owner.toString() === req.user._id) {
//         Card.findByIdAndDelete(req.params.cardId)
//           .then((deletedCard) => res.send({ deletedCard, message: 'Карточка успешно удалена' }))
//           .catch(() => res.status(ERROR_NOTFOUND)
//           .send({ message: `Карточка с _id ${req.params.cardId} не найдена` }));
//       } else {
//         res.status(403).send({ message: 'Вы не можете удалять чужие карточки' });
//       }
//     })
//     .catch((err) => {
//       if (err.name === 'CastError') {
//         res.status(ERROR_CODE).send({ message: 'Переданы некорректные данные.' });
//       } else if (err.message === 'User not found') {
//         res
//          .status(ERROR_NOTFOUND)
//          .send({ message: `Карточка с _id ${req.params.cardId} не найдена` });
//       } else {
//         res.status(ERROR_DEFAULT).send({ message: 'Произошла ошибка.' });
//       }
//     });
// };

// POST /cards — создаёт карточку
const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.send(card))
    // .catch((err) => {
    //   if (err.name === 'ValidationError') {
    //     res
    //       .status(ERROR_CODE)
    //       .send({ message: 'Переданы некорректные данные при создании карточки.' });
    //   } else {
    //     res.status(ERROR_DEFAULT).send({ message: 'Произошла ошибка.' });
    //   }
    // });
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при создании карточки'));
      } else {
        next(err);
      }
    });
};

// PUT /cards/:cardId/likes — поставить лайк карточке
const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card) {
        res.send({ message: 'like.' });
      } else {
        // res.status(ERROR_NOTFOUND).send({ message: 'Передан несуществующий _id карточки.' });
        next(new NotFoundError('Передан несуществующий _id карточки'));
      }
    })
    // .catch((err) => {
    //   if (err.name === 'CastError') {
    //     res
    //       .status(ERROR_CODE)
    //       .send({ message: 'Переданы некорректные данные для постановки лайка.' });
    //   } else {
    //     res.status(ERROR_DEFAULT).send({ message: 'Произошла ошибка.' });
    //   }
    // });
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные для постановки лайка'));
      } else {
        next(err);
      }
    });
};

// DELETE /cards/:cardId/likes — убрать лайк с карточки
const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card) {
        res.send({ message: 'dislike.' });
      } else {
        // res.status(ERROR_NOTFOUND).send({ message: 'Передан несуществующий _id карточки.' });
        next(new NotFoundError('Передан несуществующий _id карточки'));
      }
    })
    // .catch((err) => {
    //   if (err.name === 'CastError') {
    //     res
    //       .status(ERROR_CODE)
    //       .send({ message: 'Переданы некорректные данные для снятия лайка.' });
    //   } else {
    //     res.status(ERROR_DEFAULT).send({ message: 'Произошла ошибка.' });
    //   }
    // });
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные для снятия лайка'));
      } else {
        next(err);
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
