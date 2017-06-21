var net = require("net");
var config = require("config");
var fs = require('fs-extra');
var SyncUtils = require("./SyncUtils");
function SyncServer(configParam){
	this.serverEnabled = configParam.config.enabled;
	this.port = configParam.port;
	this.ip = configParam.ip;
	this.clients = new Array();
	if(this.serverEnabled){
		this.server = net.createServer();
	}
}
SyncServer.prototype.start = function(){
	if(this.serverEnabled){
		var that = this;
		this.server.on("connection", function(client){
			console.log("one client connected:"+client)
			that.clients.push(client);
		});
		console.log("Start listen:"+this.ip+":"+this.port);
		this.server.listen(this.port, this.ip);
	}
}
SyncServer.prototype.sendFileData = function(type, source, params){
	var that = this;
	var configItem = params.item;
	if(configItem==null){
		configItem = {};
	}
	if(this.serverEnabled){
		var target = that.getTargetPath(configItem, source);
		var fileContent = fs.readFileSync(source);
		var dataEndSign = config.get("remote.dataEndSign");
		var sendData = {
			"type": type,
			"source": source,
			"target": target,
			"content": fileContent
		}
		sendData = JSON.stringify(sendData);
		sendData = sendData + dataEndSign;
		var sendChange = function(){
			that.sendDataToAllClient(sendData);
		}
		var sendAdd = function(){
			that.sendDataToAllClient(sendData);
		}
		var sendDelete = function(){
			that.sendDataToAllClient(sendData);
		}
		switch (type){
			case "change":
				sendChange();
				break;
			case "add":
				sendAdd();
				break;
			case "remove":
				sendRemove();
				break;
		}
	}
}
SyncServer.prototype.getTargetPath = function(configItem, sourcePath){
	var relTarget = SyncUtils.getRelationPath(configItem, sourcePath);
	var remoteRoot = config.get("remote.rootPath");
	var remoteTargetFolder = configItem.remoteTargetFolder;
	var remoteFilePath = remoteRoot+remoteTargetFolder+relTarget;
	return remoteFilePath;
};
SyncServer.prototype.sendDataToAllClient = function(data){
	if(this.serverEnabled){
		var clients = this.clients;
		var cleanupClients = new Array();
		for(var i=0;i<clients.length;i++){
			var client = clients[i];
			if(client.writable){
				client.write(data);
			}else{
				cleanupClients.push(client);
				client.end();
			}
		}
		for(var i=0;i<cleanupClients.length;i++){
			var cleanupClient = cleanupClients[i];
			clients.splice(clients.indexOf(cleanupClient),1);
		}
	}
}
/*var syncServer = new SyncServer("127.0.0.1", 8888);
syncServer.start();*/
module.exports = SyncServer;