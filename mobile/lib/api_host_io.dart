import 'dart:io' show Platform;

class ApiHost {
  /// Returns the base API URL appropriate for the current platform.
  /// Priority: --dart-define API_PORT -> platform default.
  /// Platform defaults: macOS/iOS 5050, others 5000.
  static String getBaseUrl([int? overridePort]) {
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
