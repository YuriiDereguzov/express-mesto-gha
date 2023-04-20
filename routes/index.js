const router = require('express').Router();
const userRouter = require('./users');
const cardRouter = require('./cards');
const { login, createUser } = require('../controllers/users');
const auth = require('../middlewares/auth');

router.post('/signup', createUser);
router.post('/signin', login);

router.use('/users', auth, userRouter);
router.use('/cards', auth, cardRouter);

router.use((req, res) => {
  res.status(404).send({ message: 'Стараница по указанному маршруту не найдена' });
});

module.exports = router;
