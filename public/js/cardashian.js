(function($) {
    /*
     * Routes
     */
    var Router = Backbone.Router.extend({
        routes: {
            "/":                                   "home",
            "decks":                               "listDecks",
            "decks/:deckId":                       "showDeck",
            "decks/:deckId/questions":             "listQuestions",
            "decks/:deckId/questions/:questionId": "showQuestion"
        },
        home: function() {
            var decksView = new DecksView();
        }
    });

    /*
     * Models & Collections
     */
    var Deck = Backbone.Model.extend({});

    var Decks = Backbone.Collection.extend({
        url: "/api/decks",
        model: Deck
    });

    var Question = Backbone.Model.extend({});
    var Questions = Backbone.Collection.extend({
        model: Question
    });

    var Result = Backbone.Model.extend({});

    /*
     * Views
     */
    var DeckView = Backbone.View.extend({
        tagName: "li",
        events: {
            "click":  "listQuestions"
        },
        render: function() {
            this.$el.html(this.model.get("name"));
            return this;
        },
        listQuestions: function() {
            //this.navigate("decks/" + this.model.get("id") + "/questions");
            new QuestionsView({ deckId: this.model.get("id") });
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
            $("ul", this.el).append(deckView.render().el);
        }
    });

    var QuestionView = Backbone.View.extend({
        tagName: "li",
        render: function() {
            this.$el.html(this.model.get("id"));
            return this;
        }
    });
    var QuestionsView = Backbone.View.extend({
        el: $("#questions"),
        initialize: function(options) {
            var self = this;
            // Retrieve questions from API
            this.questions = new Questions({ "deckId": options.deckId })
                .fetch({ url: "/api/decks/"+options.deckId+"/questions" })
                .complete(function(data) {
                    self.render();
            });

        },
        render: function() {
            var self = this;

            this.$el.append("<h4>Questions list</h4>");
            this.$el.append("<ul></ul>");
            _(this.questions.responseJSON).each(function(question) {
                self.addQuestion(new Question(question));
            }, this);
        },
        addQuestion: function(question) {
            var questionView = new QuestionView({
                model: question
            });
            $("ul", this.el).append(questionView.render().el);
        }
    });

    /*
     * Core
     */

    var router = new Router();
    // Initialize view
    var decksView = new DecksView();

    Backbone.history.start();

})(jQuery);
