var config = require('config');
var MonitorItem = require("./MonitorItem");
var SyncServer = require("./SyncServer");
function CodeSync() {
	this.monitorDirs = config.get("monitorDirs");
	this.monitorItems = new Array();
	var port = config.get("remote.port");
	var ip = config.get("remote.ip");
	if(ip == null || ip == ""){
		ip = "127.0.0.1";
	}
	this.syncServer = new SyncServer(ip, port);
}
CodeSync.prototype.start = function(){
	var dirs = this.monitorDirs;
	var remoteROOT = config.get("remote.rootPath");
	this.syncServer.start();
	for(var i=0;i<dirs.length;i++){
		var dir = dirs[i];
		var item = new MonitorItem(dir, remoteROOT, this.syncServer);
		this.monitorItems.push(item);
		item.startMonitor();
	}
}

var codeSync = new CodeSync();
codeSync.start();