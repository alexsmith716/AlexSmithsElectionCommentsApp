
// strip out keys starting with '$'
// protect MongoDB from overwriting query selectors

module.exports = function(m) {
  	if (m instanceof Object) {
    	for (var key in m) {
      		if (/^\$/.test(key)) {
        		delete m[key];
      		}
    	}
  	}
  	return m;
};