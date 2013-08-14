/// <reference path="class.js" />
/// <reference path="persister.js" />
/// <reference path="jquery-2.0.2.js" />
/// <reference path="ui.js" />

var controllers = (function () {
    var rootUrl = "http://localhost:55911/api/";

	var Controller = Class.create({
		init: function () {
			this.persister = persisters.get(rootUrl);
		},
		loadUI: function (selector) {
		    //--------------------- start -----------------------
		    //this.loadGalleryUI(selector);
			if (this.persister.isUserLoggedIn()) {
				this.loadGalleryUI(selector);
			}
			else {
				this.loadLoginFormUI(selector);
			}
			this.attachUIEventHandlers(selector);
		},
		loadLoginFormUI: function (selector) {
			var loginFormHtml = ui.loginForm()
			$(selector).html(loginFormHtml);
		},
		loadGalleryUI: function (selector) {

		    this.persister.user.getUsers(function (user) {
		        // wait for data -> array of albums
		        var list = ui.GalleryUI(user);
		        $(selector).html(list);
		    }, function () { alert("error, not found albums") });



			//var list = ui.GalleryUI(this.persister.nickname());
			//$(selector).html(list);

			//this.persister.game.open(function (games) {
			//	var list = ui.openGamesList(games);
			//	$(selector + " #open-games")
			//		.html(list);
			//});

			//this.persister.game.myActive(function (games) {
			//	var list = ui.usersList(games);
			//	$(selector + " #active-games")
			//		.html(list);
			//});
		},
		loadGalleriesUI: function (userId, selector) {
		    //alert(userId);
		    this.persister.user.getGalleries(userId, function (user) {
		        //alert(user);
		        //console.log(user.Galleries);
                // wait for data -> array of albums
		        var list = ui.GaleriesUI(user.Galleries);
		        $(selector).html(list);
		    }, function () { alert("error, not found albums")});
		},
		loadGame: function (selector, gameId) {
			this.persister.game.field(gameId, function (gameState) {
			    var gameHtml = ui.gameState(gameState);
				$(selector + " #game-holder").html(gameHtml)
			});
		},

		attachUIEventHandlers: function (selector) {
			var wrapper = $(selector);
			var self = this;
			var selectedUnit = {};

			//wrapper.on("click", "#btn-show-login", function () {
			//	wrapper.find(".button.selected").removeClass("selected");
			//	$(this).addClass("selected");
			//	wrapper.find("#login-form").show();
			//	wrapper.find("#register-form").hide();
			//});
			//wrapper.on("click", "#btn-show-register", function () {
			//	wrapper.find(".button.selected").removeClass("selected");
			//	$(this).addClass("selected");
			//	wrapper.find("#register-form").show();
			//	wrapper.find("#login-form").hide();
			//});

			wrapper.on("click", "#btn-login", function () {
				var user = {
					username: $(selector + " #tb-login-username").val(),
					password: $(selector + " #tb-login-password").val()
				}

				self.persister.user.login(user, function () {
					self.loadGalleryUI(selector);
				}, function () {
					wrapper.html("oh no..");
				});


				return false;
			});
			wrapper.on("click", "#btn-register", function () {
			    var user = {
			        username: $(selector + " #tb-login-username").val(),
			        password: $(selector + " #tb-login-password").val()
			    }

			    self.persister.user.register(user, function () {
			        self.loadGalleryUI(selector);
			    }, function () {
			        wrapper.html("oh no..");
			    });
			    return false;
			});
			wrapper.on("click", "#btn-logout", function () {
			    //alert("logout");
				//self.persister.user.logout(function () {
				//	self.loadLoginFormUI(selector);
			    //});
			    localStorage.removeItem("nickname");
			    localStorage.removeItem("sessionKey");
			    nickname = "";
			    sessionKey = "";
			    self.loadLoginFormUI(selector);
			});

			wrapper.on("click", "#btn-create-game", function () {
			    var game = {
			        title: $("#tb-create-title").val()
			    }
			    self.persister.game.create(game, function () {
			        self.loadGalleryUI("#wrapper");
			    });
			});
			wrapper.on("click", "#open-games-container a", function () {
			    $("#btn-join-game").remove();
			    var html = '<button id="btn-join-game">join</button>';
			    $(this).after(html);
			});
			wrapper.on("click", "#btn-join-game", function () {
				var game = {
					id: $(this).parents("li").first().data("game-id")
				};

				var password = $("#tb-game-pass").val();

				if (password) {
					game.password = password;
				}
				self.persister.game.join(game, function () {
				    self.loadGalleryUI("#wrapper");
				});
			});

			wrapper.on("click", ".active-games .in-progress", function () {
				self.loadGame(selector, $(this).parent().data("game-id"));
			});
			wrapper.on("click", ".users", function () {
			    //console.log(target);
			    var userId = $(this).parent().data("user-id");
			    //alert($(this).parent().data("user-id"));
			    self.loadGalleriesUI(userId, "#galleries");
			    //$("#btn-start-game").remove();
			    //var html = '<button id="btn-start-game">start</button>';
			    //$(this).after(html);
			});
			wrapper.on("click", "#btn-start-game", function () {
			    var id = $(this).parents("li").first().data("game-id")
			    var element = $(this).prev().removeClass("full").addClass("in-progress");
			    $(this).remove();

			    self.persister.game.start(id, function () {
			        self.loadGame(selector, id);
			    }, function () {
			        element.removeClass("in-progress").addClass("full")
			        alert("You are not creator of the game");
			    });
			});

			wrapper.on("click", "#field .empty", function () {
			    var gameId = $(this).parents("#game-state").data("game-id");
			    var coords = $(this).data("id-new-position");
			    coords = coords + "";
			    var position = {
			        "x": (coords[coords.length - 2]).toString(),
			        "y": (coords[coords.length - 1]).toString()
			    }

			    selectedUnit.position = position;
			    if (selectedUnit.player == "red" || selectedUnit.player == "blue") {
			        self.persister.battle.move(gameId, selectedUnit, function () {
			            self.loadGame(selector, gameId);
			            selectedUnit = {};
			    });
			    }
			});
			wrapper.on("click", "#field .full", function () {

			    var player = $(this).data("player-id");
			    //console.log(selectedUnit.player);
			    if (player == selectedUnit.player || selectedUnit.player == undefined) {
			        var unitId = $(this).data("unit-id");

			        selectedUnit = {
			            "unitId": unitId,
			            "player": player
			        };
			    }
			    else {
			        var coords = $(this).data("id-new-position");
			        coords = coords + "";
			        var position = {
			            "x": (coords[coords.length - 2]).toString(),
			            "y": (coords[coords.length - 1]).toString()
			        }
			        var gameId = $(this).parents("#game-state").data("game-id");
			        //alert("attack");
			        selectedUnit.position = position;
			        self.persister.battle.attack(gameId, selectedUnit, function () {
			            self.loadGame(selector, gameId);
			        });
			        selectedUnit = {};
                }
			});
			wrapper.on("dblclick", "#field .full", function () {
			    var gameId = $(this).parents("#game-state").data("game-id");
			    var unitId = $(this).data("unit-id");
			    self.persister.battle.defend(gameId, unitId, function () {
			        self.loadGame(selector, gameId);
			    });
			});

			wrapper.on("click", "#btn-scores", function () {
			    self.persister.user.scores(function (data) {
			        if ($('#score-container').text() == "") {
			            var html = ui.score(data);
			            $('#score-container').html(html);
			            $("#game-state").remove();
			        }
			        else {
			            $('#score-container').html("");
			        }
			    });
			});
			
            
			//self.persister.messages.all(function (messages) {
			//    var html = ui.messagesBox(messages);
			//    $("#messages-holder").html(html);
			//});

			//(setInterval(function (selector) {
			//    self.persister.messages.unread(function (messages) {
			//        var html = ui.messagesBox(messages);                    
			//        $("#messages-holder").append(html);
			//    });
			//}, 2000));

			//(setInterval(function () {
			//    if ($("#game-state").text()) {
			//        self.loadGame(selector, $("#game-state").data("game-id"));
			//    }
			//}, 2000));
		}
	});
	return {
		get: function () {
			return new Controller();
		}
	}
}());

$(function () {
	var controller = controllers.get();
	controller.loadUI("#content");
});