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
		        var list = ui.GalleryUI(user);
		        $(selector).html(list);
		    }, function () { alert("error, not found albums") });
		},
		loadGalleriesUI: function (userId, selector) {
		    this.persister.user.getGalleries(userId, function (user) {
		        var list = ui.GaleriesUI(user.Galleries);
		        console.log(user);
		        if(user.SessionKey == localStorage.getItem("sessionKey")){
		            list += '<a href="#" class="btn-create-album">create album</a>' +
		                '<input type="type" id="input-title-album" name="name" value=" " />';
		        }

		        $(selector).html(list);
		    }, function () { alert("error, not found albums")});
		},
		loadAlbumsUI: function (albumId, selector) {
		    this.persister.album.getAlbums(albumId, function (albums) {
		        var list = ui.GaleriesUI(albums[0].Albums);

		        //console.log(albums);
		        //if (albums.SessionKey == localStorage.getItem("sessionKey")) {
		        //    list += '<a href="#">create album</a>';
		        //}

		        $(selector).html(list);
		    }, function () { alert("error, not found albums") });
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
			wrapper.on("click", ".btn-create-album", function () {
			    alert("tuk sam");
			    var album = {
			        title: $("#input-title-album").val(),
			        AlbumId: "1",
                    userId: null
			    }

			    self.persister.album.create(album, function () {
			        self.loadGalleryUI(selector);
			    }, function () {
			        wrapper.html("oh no..");
			    });
			    return false;
			});
			wrapper.on("click", ".active-games .in-progress", function () {
				self.loadGame(selector, $(this).parent().data("game-id"));
			});
			wrapper.on("click", ".users", function () {
			    //console.log(target);
			    var userId = $(this).parent().data("user-id");
			    //alert($(this).parent().data("user-id"));
			    self.loadGalleriesUI(userId, "#galleries");
			});
			wrapper.on("click", ".albums", function () {
			    //console.log(target);
			    var albumId = $(this).parent().data("gallery-id");
			    self.loadAlbumsUI(albumId, "#galleries");
			});
			wrapper.on("dblclick", "#field .full", function () {
			    var gameId = $(this).parents("#game-state").data("game-id");
			    var unitId = $(this).data("unit-id");
			    self.persister.battle.defend(gameId, unitId, function () {
			        self.loadGame(selector, gameId);
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