const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const userRouter = require('./users');
const cardRouter = require('./cards');
const { login, createUser } = require('../controllers/users');
const auth = require('../middlewares/auth');
const NotFoundError = require('../middlewares/errors/not-found-err');

// router.post('/signup', createUser);
// router.post('/signin', login);
router.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(/(https?:\/\/)(w{3}\.)?(((\d{1,3}\.){3}\d{1,3})|((\w-?)+\.(ru|com)))(:\d{2,5})?((\/.+)+)?\/?#?/),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), createUser);

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(5),
  }),
}), login);

router.use('/users', auth, userRouter);
router.use('/cards', auth, cardRouter);

router.use((req, res, next) => {
  next(new NotFoundError('Стараница по указанному маршруту не найдена'));
});

// было
// router.use((req, res, err) => {
//   const { statusCode = 500, message } = err;

//   res
//     .status(statusCode)
//     .send({ message: statusCode === 500 ? 'На сервере произошла ошибка' : message });
// });

module.exports = router;
