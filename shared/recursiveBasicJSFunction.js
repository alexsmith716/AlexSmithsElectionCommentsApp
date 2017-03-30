    
module.exports = function (obj) {

	var recursiveBasicJSFunction = function (obj) {
	  for (var k in obj){
	    if (typeof obj[k] === 'object' && obj[k] !== null) {
	      recursiveBasicJSFunction(obj[k]);
	    }else{
	    	//console.log('++++1: ', k, ' : ', obj[k], ' : ', Object.keys(obj[k]));
	    	//console.log('++++11: ', Object.getOwnPropertyNames(k), ' : ', Object.getOwnPropertyNames(obj[k]));
	     	//return obj[k];
	     	if(obj[k] === 'error'){
	     		console.log('===== ++++');
	     	}
	    }
	  }
	  //console.log('++++2');
	}

	//console.log('++++3', Object.keys(obj));

	recursiveBasicJSFunction(obj);

}

    Object.keys(response).forEach(function(prop) {
      console.log('------: ', prop, ' | ', response[prop])
    });


    function recursiveBasicJSFunction(obj){
      for (var k in obj){
        if (typeof obj[k] === 'object' && obj[k] !== null) {
          recursiveBasicJSFunction(obj[k]);
        }else{
          console.log('++++1: ', k, ' : ', obj[k], ' : ', Object.keys(obj));
        }
      }
    }
    recursiveBasicJSFunction(response);


    /*
    function iterate(obj, stack) {
      for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
          if (typeof obj[property] == "object") {
            iterate(obj[property], stack + '.' + property);
          } else {
            console.log(property + "   " + obj[property]);
            $('#output').append($("<div/>").text(stack + '.' + property))
          }
        }
      }
    }
    iterate(object, '')
    */
/*
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
*/



