    
module.exports = function (returnArray, obj) {

  for (var k in obj){
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      this(obj[k]);
    }else{
      return obj[k];
    }
  }
}

function removeProps(obj,keys){
	if(obj instanceof Array){
		obj.forEach(function(item){
			removeProps(item,keys)
		});
	}else if(typeof obj === 'object'){
		Object.getOwnPropertyNames(obj).forEach(function(key){
			if(keys.indexOf(key) !== -1)delete obj[key];
			else removeProps(obj[key],keys);
		});
	}
}

removeProps(obj,['$meta']);
document.body.innerHTML = '<pre>' + JSON.stringify(obj,null,4) + '</pre>';
var obj = {
"part_one": {
"name": "My Name",
"something": "123",
"$meta": {
"test": "test123"
}
},
"part_two": [
{
"name": "name",
"dob": "dob",
"$meta": {
"something": "else",
"and": "more"
}
},
{
"name": "name",
"dob": "dob"
}
],
"$meta": {
"one": 1,
"two": 2
}
};