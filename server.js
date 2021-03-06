/**
IndexedDB
http://hacks.mozilla.org/2010/06/comparing-indexeddb-and-webdatabase/
https://developer.mozilla.org/fr/docs/IndexedDB
http://caniuse.com/#search=index

Express
http://expressjs.com/4x/api.html

Backbone
http://arturadib.com/hello-backbonejs/docs/2.html

ORM
http://sequelizejs.com/articles/getting-started
http://sequelizejs.com/articles/express

Offline applications
http://diveintohtml5.info/offline.html
https://developer.mozilla.org/fr/Apps/Build/Hors-ligne
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

app.set('views', __dirname + '/public/views');
app.engine('html', require('ejs').renderFile);
app.use(express.static('public'));

// Connect to the mysql DB
sequelize
    .authenticate()
    .complete(function(err) {
        if (!!err) {
            console.log('Unable to connect to the database:', err);
        }
    });

// Setting routes
app.get('/', function(req, res) {
    res.render('index.html');
});

app.get('/test', function(req, res) {
    res.render('test.html');
});

app.get('/card', function(req, res) {
    res.render('card.html');
});

app.get('/api/decks', function(req, res) {
    Deck
        .findAll()
        .complete(function(err, decks) {
            if (!!err) {
                console.log('An error occurred while searching for Decks:', err);
                res.send(500, { error: 'Unknown error encountered' });
            } else if (!decks) {
                res.send(404, { error: 'No decks' });
            } else {
                res.send(decks);
            }
        });
});

app.get('/api/decks/:id', function(req, res) {
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
                res.send(404, { error: 'No deck with this id' });
            } else {
                res.send(deck);
            }
        });
});

app.get('/api/decks/:deckId/questions', function(req, res) {
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
                res.send(404, { error: 'No questions in this deck' });
            } else {
                res.send(questions);
            }
        });
});

app.get('/api/decks/:deckId/questions/:questionId', function(req, res) {
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
                res.send(404, { error: 'No question with this id in this deck' });
            } else {
                res.send(question);
            }
        });
});

app.use(function(req, res, next){
    res.render('index.html');
});
