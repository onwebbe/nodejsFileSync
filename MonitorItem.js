var fs =  require('fs-extra');
var gaze= require('gaze');
var configGaze = require('gaze');
var config = require('config');

function MonitorItem(monitorDir, remoteROOT, syncFile, syncServer) {
	this.monitorDir = monitorDir;
	this.remoteROOT = remoteROOT;
	this.syncFile = syncFile;
	this.syncServer = syncServer;
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
		  		if(that.syncServer){
		  			var remoteFilePath = that.remoteROOT+remoteTargetFolder+that.getRelativeDir(filepath);
					that.syncServer.sendFileData("change", filepath, remoteFilePath);
		  		}
		  		if(that.syncFile){
		  			var remoteFilePath = targetBaseDir+that.getRelativeDir(filepath);
					that.syncFile.sendFileData("change", filepath, remoteFilePath);
		  		}
		  		
		  	}
		});

		// On file added
		this.on('added', function(filepath) {
		 	console.log("added:"+filepath);
		 	if(that.syncServer){
			    var remoteFilePath = that.remoteROOT+remoteTargetFolder+that.getRelativeDir(filepath);
			    that.syncServer.sendFileData("add", filepath, remoteFilePath);
			}
			if(that.syncFile){
	  			var remoteFilePath = targetBaseDir+that.getRelativeDir(filepath);
				that.syncFile.sendFileData("add", filepath, remoteFilePath);
	  		}
	    });

		// On file deleted
		this.on('deleted', function(filepath) {
			console.log("deleted:"+filepath);
			if(that.syncServer){
			    var remoteFilePath = that.remoteROOT+remoteTargetFolder+that.getRelativeDir(filepath);
			    that.syncServer.sendFileData("delete", filepath, remoteFilePath);
			}
			if(that.syncFile){
	  			var remoteFilePath = targetBaseDir+that.getRelativeDir(filepath);
				that.syncFile.sendFileData("delete", filepath, remoteFilePath);
	  		}
		});
	 });
	gazeItem.monitorData = usingDirs;
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