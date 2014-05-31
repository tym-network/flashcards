(function($) {
    var Deck = Backbone.Model.extend({});

    var Decks = Backbone.Collection.extend({
        url: "/api/decks",
        model: Deck
    });

    var Question = Backbone.Model.extend({
        id: 0,
        question: "",
        answer: "",
        DeckId: 0
    });

    var Result = Backbone.Model.extend({
        id: 0,
        QuestionId: 0,
        answerIsCorrect: false,
        date: new Date()
    });

    var DeckView = Backbone.View.extend({
        tagName: "li",
        render: function() {
            this.$el.html(this.model.get('name'));
            return this;
        }
    });

    var DecksView = Backbone.View.extend({
        el: $("#decks"),
        initialize: function() {
            var self = this;

            // Retrieve decks from API
            this.decks = new Decks()
                .fetch()
                .complete(function(data) {
                    self.render();
            });

        },
        render: function() {
            var self = this;

            this.$el.append("<h4>Desks list</h4>");
            this.$el.append("<ul></ul>");
            _(this.decks.responseJSON).each(function(deck) {
                self.addDeck(new Deck(deck));
            }, this);
        },
        addDeck: function(deck) {
            var deckView = new DeckView({
                model: deck
            });
            $('ul', this.el).append(deckView.render().el);
        }
    });

    var decksView = new DecksView();
})(jQuery);
