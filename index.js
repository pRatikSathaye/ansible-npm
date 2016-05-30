var Q = require('q'),
  SSHClient = require('ssh2').Client,
  transformer = require('./transformer');

module.exports = (function() {
  
  var Ansible = function(connection) {
    this.connection = connection;
  }
  
  Ansible.prototype.execute = function(query) {
    var deferred = Q.defer();
    this.connection.exec(query, function(err, stream) {
      stream.setEncoding('utf8');
      stream.on('error', function(err) {
        deferred.reject(err);
      })
      .on('data', function(data) {
        deferred.resolve(data);  
      });   
    });
    
    return deferred.promise;
  }

  var _authenticate = function(options, callback) {
    var connection = new SSHClient();
    connection
    .on('ready', function() {
      console.log('Sending connectin obj');
      return callback(null, new Ansible(connection));
    })
    .on('error', function(error) {
      return callback(error);
    })
    .connect(options);
  }

  return {
    authenticate: _authenticate,
    transformQueryToCommand: transformer.transform
  };
}());