var config = require('config');
var MonitorItem = require("./MonitorItem");
var SyncServer = require("./SyncServer");
var SyncFile = require("./SyncFile");
function CodeSync() {
	this.monitorDirs = config.get("monitorDirs");
	this.monitorItems = new Array();
}
CodeSync.prototype.start = function(){
	var dirs = this.monitorDirs;
	var remoteROOT = config.get("remote.rootPath");
	var afterUpdateTasks = this.configAfterUpdateTasks();
	for(var i=0;i<dirs.length;i++){
		var dir = dirs[i];
		var item = new MonitorItem(dir, remoteROOT, afterUpdateTasks);
		this.monitorItems.push(item);
		item.startMonitor();
	}
}
CodeSync.prototype.configAfterUpdateTasks = function(){
	var port = config.get("remote.port");
	var ip = config.get("remote.ip");
	if(ip == null || ip == ""){
		ip = "127.0.0.1";
	}
	
	var tasks = config.get("afterUpdateTasks");
	console.log(tasks);
	var taskObjs = new Array();
	for(var i=0;i<tasks.length;i++){
		var task = tasks[i];
		var taskPath = task.pluginPath;
		console.log(taskPath);
		var taskClass = require(taskPath);

		var taskData = {
			"ip": ip,
			"port": port,
			"config": task
		}
		var taskObj = new taskClass(taskData);
		taskObj.start();
		taskObjs.push(taskObj);
	}
	return taskObjs;
}
var codeSync = new CodeSync();
codeSync.start();