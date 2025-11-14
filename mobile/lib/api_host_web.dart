class ApiHost {
  /// Web build should use localhost and allow --dart-define override.
  /// Default: 5050 for mac-dev parity; override with --dart-define API_PORT
  static String getBaseUrl([int? overridePort]) {
    final definePort = const String.fromEnvironment('API_PORT');
    final parsed = int.tryParse(definePort);
    final port = overridePort ?? parsed ?? 5050;
    return 'http://localhost:$port/api';
  }
}
