var config = require('./config'),
    Sequelize = require('sequelize'),
    sequelize = new Sequelize(config.database, config.username, config.password, {
        host: config.host,
        dialect: config.dialect,
        port: config.port
      }),
    Deck = sequelize.import(__dirname + '/models/Deck'),
    Question = sequelize.import(__dirname + '/models/Question');

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

// Defining Model association
Deck.hasMany(Question);
Question.belongsTo(Deck);


sequelize
  .sync({ force: true })
  .complete(function(err) {
     if (!!err) {
       console.log('An error occurred while creating the table:', err);
     } else {
       console.log('It worked!');
     }
 });
