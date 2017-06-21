var fs =  require('fs-extra');
var gaze= require('gaze');
var configGaze = require('gaze');
var config = require('config');

function MonitorItem(monitorDir, remoteROOT, afterUpdateTasks) {
	this.monitorDir = monitorDir;
	this.remoteROOT = remoteROOT;
	this.afterUpdateTasks = afterUpdateTasks;
}
MonitorItem.prototype.readConfiguration = function(){
}
MonitorItem.prototype.startMonitor = function(){
	var that = this;
	var rootPath = this.monitorDir.path;
	var targetBaseDir = this.monitorDir.targetBaseFolder;
	var remoteTargetFolder = this.monitorDir.remoteTargetFolder;
	var usingDirs = new Array();
	var exts = this.monitorDir.exts;
	for(var i=0;i<exts.length;i++){
		var usingDir = rootPath+"/**/*"+"."+exts[i];
		usingDirs.push(usingDir);
	}
	var gazeItem = gaze(usingDirs, function(err, watcher) {
 		var gazeThat = this;
		var data = gazeThat.monitorData;
		console.log(data);
	    // On file changed
	    this.on('changed', function(filepath) {
	  	    console.log("changed:"+filepath);
	  	
		  	var excluded = data.excluded;
		  	var isExcluded = false;
		  	/*for(var x = 0; x<excluded.length;x++){
		  		var excludeItem = excluded[x];
		  		var rg = new RegExp(excluded);
		  		isExcluded = rg.test(filepath);
		  		if(isExcluded==true){
		  			break;
		  		}
		  	}*/
		  	if(!isExcluded){
		  		that.executeAfterUpdateTasks("change", filepath);
		  	}
		});

		// On file added
		this.on('added', function(filepath) {
		 	console.log("added:"+filepath);
		 	that.executeAfterUpdateTasks("added", filepath);
	    });

		// On file deleted
		this.on('deleted', function(filepath) {
			console.log("deleted:"+filepath);
			that.executeAfterUpdateTasks("deleted", filepath);
		});
	 });
	gazeItem.monitorData = usingDirs;
}
MonitorItem.prototype.executeAfterUpdateTasks = function(type, filepath){
	var tasks = this.afterUpdateTasks;
	for(var i=0;i<tasks.length;i++){
		var task = tasks[i];
		task.sendFileData(type, filepath, {item: this.monitorDir});
	}
}
MonitorItem.prototype.getRelativeDir = function(sourcePath){
	var rules = this.monitorDir.replaceRules;
	var relativeStartIndex = this.monitorDir.relativeStartIndex;
	var isRequireReplace = this.monitorDir.replaceRules && this.monitorDir.replaceRules.length>0;
	var targetPath = "";
	if(isRequireReplace){
		for(var i=0;i<rules.length;i++){
			var rule = rules[i];
			console.log(rule);
			var source = rule.source;
			var target = rule.target;
			var sourcePathLastPointIndex = sourcePath.lastIndexOf(".");
			var sourceExt = sourcePath.substring(sourcePathLastPointIndex);
			if(sourceExt==source){
				targetDir = sourcePath.substring(0, sourcePathLastPointIndex)+target;
				targetDir = targetDir.substring(relativeStartIndex);
				break;
			}
		}
	}else{
		targetDir = sourcePath;
		targetDir = targetDir.substring(relativeStartIndex);
	}
	
	return targetDir;
}
module.exports = MonitorItem;