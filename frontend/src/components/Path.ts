const app_name = 'paper-trade-app.com';

export function buildPath(route: string): string {
  if (process.env.MODE !== 'development') {
    return 'https://' + app_name + '/api/' + route;
  } else {
    return 'http://localhost:5000/api/' + route;
  }
}
