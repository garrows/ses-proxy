var program = require('commander');

program
  .version('1.0.0')
  .option('-p, --port <port>', 'Server port. Defaults to 25')
  .option('-c, --config <path>', 'set config path. defaults to ./ses-credentials.conf')
  .parse(process.argv);

var server = require('../index.js');
server(program.port, program.config);