/**
 * Define "Question" model
 */

 module.exports = function(Sequelize, DataTypes) {
    return Sequelize.define("Question", {
        question: DataTypes.TEXT,
        answer: DataTypes.TEXT,
        DeckId: {
            type:          DataTypes.INTEGER,
            references:    'decks',
            referencesKey: 'id',
            onUpdate:      'cascade',
            onDelete:      'cascade',
        }
    });
};
