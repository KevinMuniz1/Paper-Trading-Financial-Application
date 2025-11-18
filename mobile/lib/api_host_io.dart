import 'dart:io' show Platform;

class ApiHost {
  /// Returns the base API URL appropriate for the current platform.
  /// Production builds (release mode) use the hosted server.
  /// Development builds use localhost/emulator addresses.
  /// You can override with --dart-define API_HOST for custom servers.
  static String getBaseUrl([int? overridePort]) {
    // Check for custom host override
    const defineHost = String.fromEnvironment('API_HOST');
    
    // If API_HOST is defined, use it
    if (defineHost.isNotEmpty) {
      final definePort = const String.fromEnvironment('API_PORT');
      final parsed = int.tryParse(definePort);
      final port = overridePort ?? parsed ?? 80;
      return port == 80 ? 'http://$defineHost/api' : 'http://$defineHost:$port/api';
    }

    // In release mode, use production server
    const isRelease = bool.fromEnvironment('dart.vm.product');
    if (isRelease) {
      return 'http://paper-trade-app.com/api';
    }

    // Development mode: use localhost/emulator addresses
    final definePort = const String.fromEnvironment('API_PORT');
    final parsed = int.tryParse(definePort);
    final port = overridePort ?? parsed ?? _platformDefaultPort();

    try {
      if (Platform.isAndroid) {
        // Android emulator: host machine is 10.0.2.2
        return 'http://10.0.2.2:$port/api';
      }
    } catch (_) {
      // If Platform is not available or another error occurs, fall back to localhost.
    }
    // iOS simulator, desktop, or other native platforms: use localhost
    return 'http://localhost:$port/api';
  }

  static int _platformDefaultPort() {
    try {
      if (Platform.isMacOS || Platform.isIOS) return 5050;
    } catch (_) {}
    return 5000;
  }
}
