
const express = require('express');
const cors = require('cors');

const examHandler = require('./routeHandlers/examsHandler');
const examQuestionsHandler = require('./routeHandlers/examQuestionsHandler');
const questionsHandler = require('./routeHandlers/questionsHandler');
const answersHandler = require('./routeHandlers/answersHandler');
const examAssignmentsHandler = require('./routeHandlers/examAssignmentsHandler');
const usersHandler = require('./routeHandlers/usersHandler');
const rootHandler = require('./routeHandlers/rootHandler');

const app = express();
const port = 8080;

app.use(cors({
  origin: '*'
}));

app.use(express.json());

/**
 * Routes
 */
app.use('/tentit', examHandler);
app.use('/tenttikysymykset', examQuestionsHandler);
app.use('/kysymykset', questionsHandler);
app.use('/vastaukset', answersHandler);
app.use('/tenttisuoritukset', examAssignmentsHandler);
app.use('/kayttajat', usersHandler);
app.use('/', rootHandler);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
