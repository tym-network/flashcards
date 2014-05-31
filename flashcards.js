/**
IndexedDB
http://hacks.mozilla.org/2010/06/comparing-indexeddb-and-webdatabase/
https://developer.mozilla.org/fr/docs/IndexedDB
http://caniuse.com/#search=index

Express
http://expressjs.com/4x/api.html

ORM
http://sequelizejs.com/articles/getting-started
http://sequelizejs.com/articles/express

Offline applications
http://diveintohtml5.info/offline.html
*/

var express = require('express'),
    app = express(),
    config = require(__dirname + '/db/config'),
    Sequelize = require('sequelize'),
    sequelize = new Sequelize(config.database, config.username, config.password, {
        host: config.host,
        dialect: config.dialect,
        port: config.port
    }),
    Deck = sequelize.import(__dirname + '/db/models/Deck'),
    Question = sequelize.import(__dirname + '/db/models/Question');

// Listen on port 3000
app.listen(3000);

// Connect to the mysql DB
sequelize
  .authenticate()
  .complete(function(err) {
    if (!!err) {
      console.log('Unable to connect to the database:', err);
  } else {
      console.log('Connection has been established successfully.');
    }
});

// Setting routes
app.get('/', function(req, res) {
    response.send('This would be the client side single page app');
});

app.get('/decks', function(req, res) {
    Deck
        .findAll()
        .complete(function(err, decks) {
            if (!!err) {
                console.log('An error occurred while searching for Decks:', err);
                res.send(500, { error: 'Unknown error encountered' });
            } else if (!decks) {
                res.send(500, { error: 'No decks' });
            } else {
                res.send(decks);
            }
        });
});

app.get('/decks/:id', function(req, res) {
    var deckId = parseInt(req.param('id'));
    deckId !== deckId && (res.send(500, { error: 'Id invalid' }));
    Deck
        .find({
            where: {'id': deckId}
        })
        .complete(function(err, deck) {
            if (!!err) {
                console.log('An error occurred while searching for Deck '+deckId, err);
                res.send(500, { error: 'Unknown error encountered' });
            } else if (!deck) {
                res.send(500, { error: 'No deck with this id' });
            } else {
                res.send(deck);
            }
        });
});

app.get('/decks/:deckId/questions', function(req, res) {
    var deckId = parseInt(req.param('deckId'));
    deckId !== deckId && (res.send(500, { error: 'DeckID invalid' }));
    Question
        .findAll({
            where: {'id': deckId}
        })
        .complete(function(err, questions) {
            if (!!err) {
                console.log('An error occurred while searching for Questions of Deck '+deckId, err);
                res.send(500, { error: 'Unknown error encountered' });
            } else if (!questions) {
                res.send(500, { error: 'No questions in this deck' });
            } else {
                res.send(questions);
            }
        });
});

app.get('/decks/:deckId/questions/:questionId', function(req, res) {
    var deckId = parseInt(req.param('deckId')),
        questionId = parseInt(req.param('questionId'));
    deckId !== deckId && (res.send(500, { error: 'DeckId invalid' }));
    questionId !== questionId && (res.send(500, { error: 'QuestionId invalid' }));
    Question
        .find({
            where: {'DeckId': deckId, 'id': questionId}
        })
        .complete(function(err, question) {
            if (!!err) {
                console.log('An error occurred while searching for Question '+questionId+' in Deck '+deckId, err);
                res.send(500, { error: 'Unknown error encountered' });
            } else if (!question) {
                console.log('No question has been found.');
                res.send(500, { error: 'No question with this id in this deck' });
            } else {
                res.send(question);
            }
        });
});

// ... Tout le code de gestion des routes (app.get) se trouve au-dessus

app.use(function(req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.send(404, 'Not found !');
});
