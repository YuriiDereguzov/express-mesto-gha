// const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const routes = require('./routes');
// Слушаем 3000 порт
const { PORT = 3000 } = process.env;

const app = express();

// подключаемся к серверу mongo
// mongoose.connect('mongodb://0.0.0.0:27017/mestodb', {});
mongoose.connect("mongodb://127.0.0.1:27017/mestodb", {});

// мидлвэр
app.use((req, res, next) => {
  req.user = { _id: '642ed05a06f01ebe4eb9281a' };
  next();
});
// app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(routes);

app.listen(PORT, () => {
  // Если всё работает, консоль покажет, какой порт приложение слушает
  console.log(`App listening on port ${PORT}`);
});
