class ApiHost {
  /// Returns the base API URL for web builds.
  /// All builds use the hosted server by default.
  /// You can override with --dart-define API_HOST for local development.
  static String getBaseUrl([int? overridePort]) {
    // Check for custom host override (for local development)
    const defineHost = String.fromEnvironment('API_HOST');
    
    // If API_HOST is defined, use it (typically for local development)
    if (defineHost.isNotEmpty) {
      final definePort = const String.fromEnvironment('API_PORT');
      final parsed = int.tryParse(definePort);
      final port = overridePort ?? parsed ?? 80;
      return port == 80 ? 'http://$defineHost/api' : 'http://$defineHost:$port/api';
    }

    // Default: use production server for all builds
    return 'http://paper-trade-app.com/api';
  }
}
