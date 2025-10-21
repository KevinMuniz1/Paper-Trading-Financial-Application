const app_name = 'paper-trade-app.com';
const { PORT, MONGODB_URL } = require('./config');

export function buildPath(route: string): string {
  if (process.env.MODE !== 'development') {
    return 'https://' + app_name + '/api/' + route;
  } else {
    return 'http://localhost:' + PORT + '/api/' + route;
  }
}
