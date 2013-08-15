var ui = (function () {

	function buildLoginForm() {
		var html =
            '<div id="login-form-holder">' +
				'<form>' +
					'<div id="login-form">' +
						'<label for="tb-login-username">Username: </label>' +
						'<input type="text" id="tb-login-username"><br />' +
						'<label for="tb-login-password">Password: </label>' +
						'<input type="password" id="tb-login-password"><br />' +
						'<button id="btn-login" class="button">Login</button>' +
						'<button id="btn-register" class="button">Register</button>' +
					'</div>' +
				'</form>' +
            '</div>';
		return html;
	}

	//function GaleriesUI() {
	//    return buildGalleriesList([{
	//        id: 3,
	//        title: "Clicked album"
	//    },
	//		{
	//		    id: 2,
	//		    title: "Second album"
	//		}]);
	//}

	function buildGalleryUI(user) {
	    var html = '<span id="user-nickname">' +
				localStorage.getItem("nickname") +
		'</span>' +
		'<button id="btn-logout">Logout</button><br/>' +
		'<div id="users-container">' +
			'<h2>Users</h2>' +
			'<div id="users">' + buildUsersList(user) +
	    '</div></div>' +
		'<div id="galleries-container">' +
			'<h2>Galleries</h2>' +
			'<div id="galleries">' +
            '</div>' +
		'</div>';

		return html;
	}

	function buildGalleriesList(galleries) {
	    var list = '<ul class="galleries-list">';
	    for (var i = 0; i < galleries.length; i++) {
	        var gallery = galleries[i];
			list +=
				'<li data-gallery-id="' + gallery.AlbumId + '">' +
						'<h3>' + $("<div />").html(gallery.Title).text() + '</h3>' +
					'<a href="#" class="albums">' +
                        '<img src="images/folder.png" alt="Alternate Text" />' +
					'</a>' +
				'</li>';
		}
		list += "</ul>";
		return list;
	}

	function buildUsersList(users) {
		var list = '<ul class="users-list">';
		for (var i = 0; i < users.length; i++) {
			//var game = gamesList[i];
			list +=
				'<li data-user-id="' + users[i].UserId + '">' +
					'<a href="#" class="users">' + //users[i].username +
						$("<div />").html(users[i].Username).text() +
					'</a>' + 
				'</li>';
		}
		list += "</ul>";
		return list;
	}

	function buildField(field) {
	    var tableHtml = '<table id="field" border="1" cellspacing="0" cellpadding="5">';

		for (var i = 0; i < 9; i++) {
		    tableHtml += '<tr>';
		    for (var k = 0; k < 9; k++) {
		        var hasUnit = false;
		        for (var index = 0; index < field.red.units.length; index++) {
		            var redUnit = field.red.units[index];
		            if (redUnit.position.x == k && redUnit.position.y == i) {
		                tableHtml += '<td class="red full ' + redUnit.mode + '" data-unit-id="' + redUnit.id +
                            '" data-player-id="red" data-id-new-position="' + k + "" + i + '">'
                            + redUnit.type;
		                hasUnit = true;
		            }
		        }

		        for (index = 0; index < field.blue.units.length; index++) {
		            var blueUnit = field.blue.units[index];
		            if (blueUnit.position.x == k && blueUnit.position.y == i) {
		                tableHtml += '<td class="blue full ' + blueUnit.mode + '" data-unit-id="' + blueUnit.id +
                            '" data-player-id="blue" data-id-new-position="' + k + "" + i + '">'
                            + blueUnit.type;// + '<td>';
		                hasUnit = true;
		            }
		        }

		        if (!hasUnit) {
		            tableHtml += '<td class="empty" data-id-new-position="' + k + "" + i + '">';
		        }
		    }
		}
		tableHtml += '</table>';
		return tableHtml;
	}

	function buildGameState(gameState) {
	    var turn = "";
	    if(gameState.inTurn == "red") {
	        turn = gameState.red.nickname;
	    }
	    else{
	        turn = gameState.blue.nickname;
	    }

	    var html =
			'<div id="game-state" data-game-id="' + gameState.gameId + '">' +
				'<h2>' + gameState.title + '</h2>' +
                '<h3 class="' + gameState.inTurn + '">'+ turn + ' is in turn</h3>' +
                buildField(gameState) +
		'</div>';
		return html;
	}

	function buildMessagesBox(messages) {
	    var html = "";

	    //console.log(messages);
	    for (var i = 0; i < messages.length; i++) {
	        html += '<p>' +
                'MESSAGE: ' + messages[i].text +
                '</p>';

	        //console.log(messages[i].text);
	    }

	    return html;
	}

	function buildScoreTable(data) {
	    var html = '<h2>Scores</h2>' +
            '<table id="score-table>"';

	    for (var i = 0; i < data.length; i++) {
	        html += '<tr>' +
                '<td>' + data[i].nickname +
                '<td>' + data[i].score;
	    }

	    return html;
	}

	return {
	    //GaleriesUI:GaleriesUI,
		GalleryUI: buildGalleryUI,
		GaleriesUI: buildGalleriesList,
		loginForm: buildLoginForm,
		usersList: buildUsersList,
		gameState: buildGameState,
		messagesBox: buildMessagesBox,
		score: buildScoreTable
	}

}());