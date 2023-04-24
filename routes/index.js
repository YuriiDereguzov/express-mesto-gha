const router = require('express').Router();
const userRouter = require('./users');
const cardRouter = require('./cards');
const { login, createUser } = require('../controllers/users');
const auth = require('../middlewares/auth');
const NotFoundError = require('../middlewares/errors/not-found-err');

router.post('/signup', createUser);
router.post('/signin', login);

router.use('/users', auth, userRouter);
router.use('/cards', auth, cardRouter);

router.use((req, res, next) => {
  next(new NotFoundError('Стараница по указанному маршруту не найдена'));
});

router.use((req, res, err) => {
  const { statusCode = 500, message } = err;

  res.status(statusCode).send({ message: statusCode === 500 ? 'На сервере произошла ошибка' : message });
});

module.exports = router;
