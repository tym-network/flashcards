(function($) {
    /*
     * IndexedDB
     */
    var db,
        deckCollections = [];

    /*
     * Routes
     */
    var Router = Backbone.Router.extend({
        routes: {
            "":                                   "home",
            "decks":                               "listDecks",
            "decks/:deckId":                       "showDeck",
            "decks/:deckId/questions":             "listQuestions",
            "decks/:deckId/questions/:questionId": "showQuestion"
        },
        home: function() {
            var decksView = new DecksView();
            var offlineDecksView = new OfflineDecksView();
        },
        listDecks: function() {
            console.log("List decks");
        },
        showDeck: function() {
            console.log("Show deck");
        },
        listQuestions: function() {
            console.log("List questions");
        },
        showQuestion: function() {
            console.log("Show question");
        }
    });

    /*
     * Models & Collections
     */
    var Deck = Backbone.Model.extend({
        saveLocally: function() {
            var self = this,
                questions = this.getQuestions(function() {
                    var transaction = db.transaction(["decks", "questions"], "readwrite"),
                        decksStore = transaction.objectStore("decks"),
                        questionsStore = transaction.objectStore("questions"),
                        requestDeck = decksStore.add(self.attributes);
                    _(self.questions.models).each(function(question) {
                        questionsStore.add(question.attributes);
                    });
                    requestDeck.onsuccess = function(event) {
                        console.log("DECK SAVED");
                    };
                    transaction.onsuccess = function(event) {
                        console.log(self, "Saved to DB");
                    };
                    console.log("success");
                });
        },
        /**
         * Get the questions linked to this deck
         * @param {Function} cb - Callback when the questions are fetch
         * @return {Questions} questions (Collection)
         */
        getQuestions: function(cb) {
            var self = this;
            if (this.questions) {
                cb.call(this, this.questions);
            } else if (this.loadingQuestions) {
                // Questions are being loaded, wait
                this.on("Questions loaded", function() {
                    cb.call(self, self.questions);
                });
            } else {
                // Retrieve questions from API
                this.loadingQuestions = true;
                this.questions = new Questions({ "deck": this });
                this.questions.url = "/api/decks/"+this.get("id")+"/questions";
                this.questions.fetch({
                    complete : function() {
                        self.loadingQuestions = false;
                        self.trigger("Questions loaded");
                        cb(self.questions);
                    }
                });
            }
        }
    });

    var Decks = Backbone.Collection.extend({
        url: "/api/decks",
        model: Deck,
        initialize: function() {
            decks.push(this);
        }
    });

    var Question = Backbone.Model.extend({});

    var Questions = Backbone.Collection.extend({
        model: Question,
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
            var self = this,
                $saveLocally = $("<span>Save</span>");
            this.$el.html(this.model.get("name")+" ").append($saveLocally);
            $saveLocally.on("click", {"el": self}, function(e) {
                e.data.el.model.saveLocally();
            });
            return this;
        },
        listQuestions: function() {
            //this.navigate("decks/" + this.model.get("id") + "/questions");
            new QuestionsView({ deck: this.model });
        }
    });

    var DecksView = Backbone.View.extend({
        title: "Decks list",
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

            this.$el.append("<h4>" + this.title + "</h4>");
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
            options.deck.getQuestions(self.render);
        },
        render: function(questions) {
            var self = this;

            this.$el.append("<h4>Questions list</h4>");
            this.$el.append("<ul></ul>");
            _(questions.models).each(function(question) {
                self.addQuestion(question);
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
     * Offline database
     */
    var OfflineDecksView = DecksView.extend({
        title: "Decks list",
        el: $("#offlineDecks"),
        decks: new Decks(),
        initialize: function(options) {
            var self = this;

            // Retrieve questions from IndexDB
            this.openDB(this.retriveLocalDecks);
        },
        openDB: function(cb) {
            var request = window.indexedDB.open("Cardashian", 1),
                self = this;
            request.onerror = function(event) {
                console.log("Impossible to open indexDB", request.errorCode, event);
                // Notify the user that it is required for offline browsing (and let him retry?)
            };
            // Connection successful
            request.onsuccess = function(event) {
                db = this.result;
                cb.call(self);
            };
            // Scheme needs to be updated / doesn't exist
            request.onupgradeneeded = function(event) {
                db = event.target.result;
                var decksStore = db.createObjectStore("decks", { keyPath: "id" });
                var questionsStore = db.createObjectStore("questions", { keyPath: "id" });
                questionsStore.createIndex("DeckId", "DeckId", { unique: false });
            };
        },
        retriveLocalDecks: function() {
            var self = this,
                deck,
                transaction = db.transaction(["decks"], "readonly"),
                decksStore = transaction.objectStore("decks");
            decksStore.openCursor().onsuccess = function(event) {
                var cursor = event.target.result;
                if (cursor) {
                    deck = new Deck();
                    deck.set(cursor.value);
                    this.decks.add(deck);
                    console.log("Deck " + cursor.key + " is " + cursor.value.name);
                    self.retriveLocalQuestions(deck);
                    cursor.continue();
                }
                else {
                    console.log("No more decks!");
                }
            };
        },
        retriveLocalQuestions: function(deck) {
            var self = this,
                questions = new Questions(),
                question,
                transaction = db.transaction(["questions"], "readonly"),
                questionsStore = transaction.objectStore("questions"),
                index = questionsStore.index("DeckId");
            deck.questions = questions;
            index.openCursor().onsuccess = function(event) {
                var cursor = event.target.result;
                if (cursor) {
                    question = new Question();
                    question.set(cursor.value);
                    questions.add(question);
                    console.log("Question " + cursor.key + " is " + cursor.value.question);
                    cursor.continue();
                }
                else {
                    console.log("No more questions!");
                }
            };
        }
    });

    /*
     * Core
     */

    var router = new Router();

    Backbone.history.start();

})(jQuery);
