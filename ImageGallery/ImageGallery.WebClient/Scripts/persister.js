/// <reference path="http-requester.js" />
/// <reference path="class.js" />
/// <reference path="http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/sha1.js" />
var persisters = (function () {
	var nickname = localStorage.getItem("nickname");
	var sessionKey = localStorage.getItem("sessionKey");

	function saveUserData(userData) {
	    localStorage.setItem("nickname", userData.nickname);
	    localStorage.setItem("sessionKey", userData.sessionKey);
	    nickname = userData.nickname;
	    sessionKey = userData.sessionKey;
	}

	function clearUserData() {
		localStorage.removeItem("nickname");
		localStorage.removeItem("sessionKey");
		nickname = "";
		sessionKey = "";
	}

	var MainPersister = Class.create({
		init: function (rootUrl) {
			this.rootUrl = rootUrl;
			this.user = new UserPersister(this.rootUrl);
			this.album = new AlbumPersister(this.rootUrl);
			this.image = new ImagePersister(this.rootUrl);
			this.comment = new CommentPersister(this.rootUrl);
		},
		isUserLoggedIn: function () {
			var isLoggedIn = nickname != null && sessionKey != null;
			return isLoggedIn;
		},
		nickname: function () {
		    return localStorage.getItem("nickname");
		}
	});
	var UserPersister = Class.create({
		init: function (rootUrl) {
			this.rootUrl = rootUrl + "users/";
		},
		login: function (user, success, error) {
			var url = this.rootUrl + "login";
			var userData = {
				username: user.username,
				authCode: CryptoJS.SHA1(user.username + user.password).toString()
			};

			httpRequester.postJSON(url, userData,
				function (data) {
				    //debugger;
				    //console.log(data);
					saveUserData(data);
					success(data);
				}, error);
		},
		register: function (user, success, error) {
			var url = this.rootUrl + "register";
			var userData = {
				username: user.username,
				nickname: user.nickname,
				authCode: CryptoJS.SHA1(user.username + user.password).toString()
			};
			httpRequester.postJSON(url, userData,
				function (data) {
					saveUserData(data);
					success(data);
				}, error);
		},
		logout: function (success, error) {
			var url = this.rootUrl + "logout/" + sessionKey;
			httpRequester.getJSON(url, function (data) {
				clearUserData();
				success(data);
			}, error)
		},
		getGalleries: function (userId, success, error) {
		    var url = this.rootUrl + userId;
		    httpRequester.getJSON(url, success, error);
		}
	});
	var AlbumPersister = Class.create({
		init: function (url) {
			this.rootUrl = url + "albums/";
		},
		create: function (album, success, error) {
			var albumData = {
			    title: album.title,
			};
			var url = this.rootUrl + "create/" + sessionKey;
			httpRequester.postJSON(url, albumData, success, error);
		},
		getAlbums: function (album, success, error) {
			var url = this.rootUrl + album.id;
			httpRequester.getJSON(url, success, error);
		}
	});
	var ImagePersister = Class.create({
		init: function (url) {
		    this.rootUrl = url + "images/";
		},
		getImageById: function (imgId, success, error) {
		    var url = this.rootUrl + imgId;
		    httpRequester.getJSON(url, success, error);
		}
	});
	var CommentPersister = Class.create({
	    init: function (url) {
	        this.rootUrl = url + "comments";
		}
	});
	return {
	    get: function (url) {
	        return new MainPersister(url);
	    }
	};
}());