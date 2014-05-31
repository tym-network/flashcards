/**
 * Define "Deck" model
 */

 module.exports = function(Sequelize, DataTypes) {
  return Sequelize.define("Deck", {
      name: DataTypes.STRING,
      picture: DataTypes.STRING
  });
};
