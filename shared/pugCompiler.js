var _pug = require('pug');
var fs = require('fs');

exports.compile = function(relativeTemplatePath, data, next){

  var absoluteTemplatePath = process.cwd() + '/theServer/views/' + relativeTemplatePath + '.pug';
  console.log('#### absoluteTemplatePath: ', absoluteTemplatePath)

  _pug.renderFile(absoluteTemplatePath, data, function(err, compiledTemplate){
    if(err){
      console.log('#### _pug.renderFile > ERROR: ' + err);
    }
    console.log('#### pugCompiler > compiledTemplate')
    next(null, compiledTemplate);
  });

};