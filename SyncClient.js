var net = require("net");
var config = require("config");
var fs = require('fs-extra');
function SyncClient(){
	var client = new net.Socket();
	client.setEncoding("UTF-8");
	this.client = client;
}
SyncClient.prototype.connect = function(ip, port){
	var that = this;
	var allData = "";
	var dataEndSign = config.get("remote.dataEndSign");
	this.client.connect(port, ip, function(){
		console.log("Server connected:"+ip+":"+port);
		that.client.write("data send from Client");
	});
	this.client.on("data", function(data){
		console.log("Get Server data");
		allData = allData + data;
		if(allData.endsWith(dataEndSign)){
			var usingData = allData.substring(0, allData.length - dataEndSign.length);
			var jsonData = JSON.parse(usingData);
			console.log("Have file "+jsonData.type+". Will write to file:"+jsonData.target);
			if(jsonData.type != "delete"){
				var fileContent = jsonData.content;
				if(fileContent && fileContent.type=="Buffer"){
					fileContent = new Buffer(fileContent.data);
				}
				fs.outputFileSync(jsonData.target, fileContent);
			}else{

			}
			allData = "";
		}
		
	});
}
var ip = config.get("remote.ip");
var port = config.get("remote.port");
if(ip == null || ip == ""){
	ip = "127.0.0.1";
}
var client = new SyncClient();
client.connect(ip, port);
//module.exports = SyncClient;