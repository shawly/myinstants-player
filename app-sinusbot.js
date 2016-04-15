/*
 * This file is a part of project https://github.com/HarpyWar/myinstants-player
 * (c) 2016 HarpyWar <harpywar@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var bot;

$(document).ready(function(){

	tryLogin();

	$("#auth").click(function(){
		login($("#login").val(), $("#password").val());
	});
	$("#logout").click(function(){
		logout();
	});

});

// redefine function that defined in app.js
function play()
{
	var $btn = $(this); // el
	currentIdx = $btn.attr('data-idx');
	var player = $btn.attr('data-player');
	
	switch(player) {
		case "browser":
			$("#audio-container").html('<audio autoplay><source src="' + playUrl + '" type="audio/mpeg"></audio>');
	
			playAllowed($btn);
			break;
		case "sinusbot":
			var playUrl = 'http://api.cleanvoice.ru/myinstants/?type=file&id=' + items[currentIdx].id;
			var botId = $("#bot-list").val();
			bot.stop(botId, null);
			bot.playUrl(botId, encodeURIComponent(playUrl), function(){
				playAllowed($btn);
			});
			break;
		default:
			console.info('Unkown player ' + player);
	}
	
}

function stop() {
	var $btn = $(this);
	var player = $btn.attr('data-player');
	
	switch(player) {
		case "browser":
			$("#audio-container > audio").remove();
	
			playbackStopped($btn);
			break;
		case "sinusbot":
			var botId = $("#bot-list").val();
			bot.stop(botId, function(){
				playbackStopped($btn);
			});
			break;
		default:
			console.info('Unkown player ' + player);
	}
}




function tryLogin() {
	$("#login-form").show();
	$("#login-loading").hide();
	
	if ( localStorage["login"] ) {	
		$("#login").val( localStorage["login"] );
		
		if ( localStorage["token"] ) {
			tryGetInstances(localStorage["token"]);
		}
	}
}

function login(login, password) {
	
	$("#login-form").hide();
	$("#login-loading").show();

	localStorage["login"] = login;
	
	bot = new SinusBotAPI();
	bot.auth( login, password, function(){
		localStorage["token"] = bot.token;

		tryGetInstances(bot.token);
	}, 
	function(data){
		var err = (data.error) ? data.error : "LOGIN FAILED";
		alert(err);
		logout();
	});
}
function tryGetInstances(token) {
	
	$("#login-form").hide();
	$("#login-loading").show();

	bot = new SinusBotAPI();
	bot.token = token;
	
	bot.getInstances(function(data){
		$("#bot-list").empty();
		$.each(data, function(i, item){
			$("#bot-list").append("<option value='" + item.uuid + "'>" + item.nick + "</option>");
		});
		
		$("#login-screen").hide();
		$(".page-container").fadeIn();
		$("#logout").parent().fadeIn();
	},
	function(data){
		var err = (data.error) ? data.error : "LOGIN FAILED";
		alert(err);
		logout();
	});

}


function logout() {
	$(".page-container").hide();
	$("#login-screen").fadeIn();
	$("#login-form").show();
	$("#login-loading").hide();
	$("#logout").parent().hide();
	
	if (bot) {
		bot.logout();
	}
	localStorage.removeItem("token");
}





function SinusBotAPI() {
	this.botId = false;
	this.token = false;
	this.instances = {};

	this.auth = function(login, password, callback, error) {
		var that = this;
		this.getBotId(function(){
			that.send('post', '/api/v1/bot/login', {
				'username': login.trim(),
				'password': password.trim(),
				'botid': that.botId
			}, function(data){
				that.token = data.token;
				if (callback != undefined) {
					callback(data);
				}
			}, 
			error);
		}, error);
	};
	
	this.logout = function() {
		this.token = false;
	};
	
	this.getBotId = function(callback, error) {
		var that = this;
		this.send('get', '/api/v1/botId', {}, function(data){
			that.botId = data.defaultBotId;
			if (callback != undefined) {
				callback(data);
			}
		}, error);
	};
	
	this.getInstances = function(callback, error) {
		var that = this;
		this.send('get', '/api/v1/bot/instances', {}, function(data){
			that.instances = data;
			if (callback != undefined) {
				callback(data);
			}
		}, error);
	};

	this.playUrl = function(instanceId, url, callback) {
		this.send('post', '/api/v1/bot/i/' + instanceId + '/playUrl?url=' + url, {}, function(data){
			if (callback != undefined) {
				callback(data);
			}
		});
	};

	this.stop = function(instanceId, callback) {
		this.send('post', '/api/v1/bot/i/' + instanceId + '/stop', {}, function(data){
			if (callback != undefined) {
				callback(data);
			}
		});
	};
	
	this.send = function(type, url, data, success, error) {
		var that = this;
		$.ajax( {
			url: url, 
			type: type,
			data: type == 'post' ? JSON.stringify(data) : {},
			dataType: 'json',
			beforeSend: function(xhr) {
				xhr.setRequestHeader("Authorization", 'Bearer ' + that.token);
			},
			success: function(data){
				if (data.success != 'undefined' && data.success === false) {
					if (error != undefined) {
						error(data);
					}
					return false;
				}
				if (success != undefined) {
					success(data);
				}
			},
			error: function(data){
				if (error != undefined) {
					error(data);
				}
			}
		});
	};
	
}
