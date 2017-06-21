var SyncUtils = {}
SyncUtils.getRelationPath = function(configItem, sourcePath){
	var rules = configItem.replaceRules;
	var relativeStartIndex = configItem.relativeStartIndex;
	var isRequireReplace = configItem.replaceRules && configItem.replaceRules.length>0;
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
module.exports = SyncUtils;