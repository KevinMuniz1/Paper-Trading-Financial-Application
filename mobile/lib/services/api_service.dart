import 'dart:convert';
import 'package:http/http.dart' as http;
import '../api_host.dart';

class ApiService {
  static final String baseUrl = ApiHost.getBaseUrl();

  // Get buying power for user
  static Future<Map<String, dynamic>> getBuyingPower(int userId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/portfolio/buying-power'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'userId': userId}),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        return {'buyingPower': 0.0, 'error': 'Failed to fetch buying power'};
      }
    } catch (e) {
      print('Error fetching buying power: $e');
      return {'buyingPower': 0.0, 'error': e.toString()};
    }
  }

  // Add funds to buying power
  static Future<Map<String, dynamic>> addFunds(int userId, double amount) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/portfolio/add-funds'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'userId': userId, 'amount': amount}),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        return {'success': false, 'error': 'Failed to add funds'};
      }
    } catch (e) {
      print('Error adding funds: $e');
      return {'success': false, 'error': e.toString()};
    }
  }

  // Decrease funds from buying power
  static Future<Map<String, dynamic>> decreaseFunds(int userId, double amount) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/portfolio/add-funds'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'userId': userId, 'amount': -amount}), // Negative amount to decrease
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        return {'success': false, 'error': 'Failed to decrease funds'};
      }
    } catch (e) {
      print('Error decreasing funds: $e');
      return {'success': false, 'error': e.toString()};
    }
  }

  // Get portfolio summary
  static Future<Map<String, dynamic>> getPortfolioSummary(int userId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/portfolio/summary'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'userId': userId}),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        return {
          'portfolio': null,
          'holdings': [],
          'error': 'Failed to fetch portfolio'
        };
      }
    } catch (e) {
      print('Error fetching portfolio summary: $e');
      return {
        'portfolio': null,
        'holdings': [],
        'error': e.toString()
      };
    }
  }

  // Search/get user's trades (holdings)
  static Future<Map<String, dynamic>> searchTrades(int userId, {String search = ''}) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/searchcards'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'userId': userId, 'search': search}),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        return {'results': [], 'error': 'Failed to fetch trades'};
      }
    } catch (e) {
      print('Error searching trades: $e');
      return {'results': [], 'error': e.toString()};
    }
  }

  // Buy stock
  static Future<Map<String, dynamic>> buyStock(int userId, String symbol, String name, int quantity) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/addstock'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'userId': userId,
          'tickerSymbol': symbol,
          'cardName': name,
          'quantity': quantity,
        }),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        return {'error': 'Failed to buy stock'};
      }
    } catch (e) {
      print('Error buying stock: $e');
      return {'error': e.toString()};
    }
  }

  // Sell stock
  static Future<Map<String, dynamic>> sellStock(int userId, String tradeId, int quantity) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/sell'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'userId': userId,
          'tradeId': tradeId,
          'quantity': quantity,
        }),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        return {'success': false, 'error': 'Failed to sell stock'};
      }
    } catch (e) {
      print('Error selling stock: $e');
      return {'success': false, 'error': e.toString()};
    }
  }

  // Sell all shares of a symbol
  static Future<Map<String, dynamic>> sellAllStock(int userId, String symbol) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/sell-all'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'userId': userId,
          'symbol': symbol,
        }),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        return {'success': false, 'error': 'Failed to sell all stock'};
      }
    } catch (e) {
      print('Error selling all stock: $e');
      return {'success': false, 'error': e.toString()};
    }
  }

  // Get current stock prices from Yahoo Finance API
  static Future<Map<String, dynamic>> getStockPrices(List<String> symbols) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/stock/prices'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'symbols': symbols}),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        return {'prices': {}, 'error': 'Failed to fetch stock prices'};
      }
    } catch (e) {
      print('Error fetching stock prices: $e');
      return {'prices': {}, 'error': e.toString()};
    }
  }

  // Get portfolio value history
  static Future<Map<String, dynamic>> getPortfolioHistory(int userId, {int days = 30}) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/portfolio/history'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'userId': userId, 'days': days}),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        return {'history': [], 'error': 'Failed to fetch portfolio history'};
      }
    } catch (e) {
      print('Error fetching portfolio history: $e');
      return {'history': [], 'error': e.toString()};
    }
  }
}
