const express = require('express');
const app = express();
const port = 5000;
const cors = require('cors');
const morgan = require('morgan');
const indexRouter = require('./routes/index');

app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'OPTION', 'DELETE'],
    credentials: true,
  }),
);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);

app.listen(port, () => {
  console.log(`Server start at http://localhost:${port}`);
});
