var config = require("config");
var fs = require('fs-extra');
var SyncUtils = require("./SyncUtils");
function SyncFile(configParam){
	this.localEnabled = configParam.config.enabled;
}
SyncFile.prototype.start = function(){

}
SyncFile.prototype.sendFileData = function(type, source, params){
	var that = this;
	var configItem = params.item;
	if(configItem==null){
		configItem = {};
	}
	if(this.localEnabled){
		var target = that.getTargetPath(configItem, source);
		var sendChange = function(){
			fs.copySync(source , target, {clobber: true});
		}
		var sendAdd = function(){
			fs.copySync(source , target);
		}
		var sendDelete = function(){
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
SyncFile.prototype.getTargetPath = function(configItem, sourcePath){
	var relTarget = SyncUtils.getRelationPath(configItem, sourcePath);
	var targetBaseFolder = configItem.targetBaseFolder;
	var remoteFilePath = targetBaseFolder+relTarget;
	return remoteFilePath;
};
/*var SyncFile = new SyncFile("127.0.0.1", 8888);
SyncFile.start();*/
module.exports = SyncFile;