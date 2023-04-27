// const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const routes = require('./routes');
// Слушаем 3000 порт
const { PORT = 3000 } = process.env;

const app = express();

// подключаемся к серверу mongo
mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {});

// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(routes);
app.use(errors());

// пытаюсь реализовать
app.use((err, req, res, next) => {
  console.log('err: ', err.statusCode);
  console.log('req: ', req.body);
  console.log('res: ', res.status);
  console.log('next: ', next);
  const { statusCode = 500, message } = err;

  res.status(statusCode).send({ message: statusCode === 500 ? 'На сервере произошла ошибка' : message });
});
// было
// app.use((err, req, res, next) => {
//   console.log('next: ', next);
//   res.status(err.statusCode).send({ message: err.message });
// });

app.listen(PORT, () => {
  // Если всё работает, консоль покажет, какой порт приложение слушает
  console.log(`App listening on port ${PORT}`);
});
