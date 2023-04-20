const router = require('express').Router();
const userRouter = require('./users');
const cardRouter = require('./cards');
const { login, createUser } = require('../controllers/users');

router.post('/signup', createUser);
router.post('/signin', login);

router.use('/users', userRouter);
router.use('/cards', cardRouter);

router.use((req, res) => {
  res.status(404).send({ message: 'Стараница по указанному маршруту не найдена' });
});

module.exports = router;
