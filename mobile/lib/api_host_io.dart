import 'dart:io' show Platform;

class ApiHost {
  /// Returns the base API URL appropriate for the current platform.
  ///
  /// Defaults to port 5050 (matches backend `config.js` default on macOS).
  static String getBaseUrl([int port = 5050]) {
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
}
