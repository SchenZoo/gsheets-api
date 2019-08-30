const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve('.env') });

/**
 * Module dependencies.
 */

const app = require('./src/app');
const http = require('http');
const stoppable = require('stoppable');

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

server = stoppable(http.createServer(app));
SIGTERMHandler(server);
uncaughtExceptionHandler();

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}

function SIGTERMHandler(server) {
  process.on('SIGTERM', () => {
    console.time('Server turning off.');
    try {
      server.stop(() => {
        console.timeEnd('Server turning off.');
        console.log('Http server closed.');
        process.exit(0);
      });
      setTimeout(() => {
        console.log('Force close.');
        process.exit(1);
      }, 5000);
    } catch (exception) {
      console.error('Error closing server');
      console.error(exception);
      process.exit(1);
    }
  });
}

function uncaughtExceptionHandler() {
  process.on('uncaughtException', error => {
    console.error('Error not cought');
    console.error(error);
  });
}
