var config = require("config");
var fs = require('fs-extra');
function SyncFile(configParam){
	this.localEnabled = config.get("localOverwriteEnabled");
}
SyncFile.prototype.start = function(){

}
SyncFile.prototype.sendFileData = function(type, source, target){
	var that = this;
	if(this.localEnabled){
		
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
/*var SyncFile = new SyncFile("127.0.0.1", 8888);
SyncFile.start();*/
module.exports = SyncFile;