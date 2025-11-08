class ApiHost {
  /// Web build should use localhost by default.
  static String getBaseUrl([int port = 5050]) => 'http://localhost:$port/api';
}
