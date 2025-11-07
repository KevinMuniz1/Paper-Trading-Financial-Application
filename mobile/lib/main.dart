import 'dart:convert';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Paper Trading Mobile',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: const LoginScreen(),
    );
  }
}

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  String _message = '';

  Future<void> _handleLogin() async {
    String username = _usernameController.text.trim(); // Keep original case
    String password = _passwordController.text;

    if (username.isEmpty || password.isEmpty) {
      setState(() {
        _message = 'Please enter both username and password';
      });
      return;
    }

    setState(() {
      _message = 'Logging in...';
    });

    try {
      // API configuration for Android emulator (10.0.2.2 maps to host's localhost)
      const String apiBaseUrl = 'http://10.0.2.2:5000/api';
      const String loginEndpoint = '$apiBaseUrl/login';

      // Prepare request body - matches frontend format
      final Map<String, dynamic> requestBody = {
        'login': username,
        'password': password,
      };

      // Make API call
      final response = await http.post(
        Uri.parse(loginEndpoint),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode(requestBody),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = jsonDecode(response.body);
        
        if (responseData['id'] != null && responseData['id'] > 0) {
          // Login successful - Navigate to main app
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (context) => MainAppScreen(
                userId: responseData['id'],
                firstName: responseData['firstName'] ?? '',
                lastName: responseData['lastName'] ?? '',
              ),
            ),
          );
          
        } else {
          // Invalid credentials
          setState(() {
            _message = 'Invalid username or password';
          });
        }
      } else {
        setState(() {
          _message = 'Server error: ${response.statusCode}';
        });
      }
    } catch (e) {
      setState(() {
        _message = 'Network error: ${e.toString()}';
      });
      print('Login error: $e');
    }
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Paper Trading Financial App'),
        backgroundColor: Colors.blue,
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // App Icon and Welcome
            const Icon(
              Icons.monetization_on,
              size: 80,
              color: Colors.green,
            ),
            const SizedBox(height: 24),
            const Text(
              'Welcome Back',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Sign in to your account',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 40),
            
            // Username Field
            TextField(
              controller: _usernameController,
              decoration: const InputDecoration(
                labelText: 'Username',
                prefixIcon: Icon(Icons.person),
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
              textInputAction: TextInputAction.next,
            ),
            const SizedBox(height: 16),
            
            // Password Field
            TextField(
              controller: _passwordController,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: 'Password',
                prefixIcon: Icon(Icons.lock),
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
              textInputAction: TextInputAction.done,
              onSubmitted: (_) => _handleLogin(),
            ),
            const SizedBox(height: 24),
            
            // Login Button
            ElevatedButton(
              onPressed: _handleLogin,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                elevation: 2,
              ),
              child: const Text(
                'Login',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 16),
            
            // Message Display
            if (_message.isNotEmpty)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.orange.shade50,
                  border: Border.all(color: Colors.orange.shade200),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  _message,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.orange.shade800,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            
            const SizedBox(height: 24),
            
            // Create Account Button
            OutlinedButton(
              onPressed: () {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (context) => const RegistrationScreen()),
                );
              },
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Colors.blue),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text(
                'Create New Account',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.blue,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Registration Screen
class RegistrationScreen extends StatefulWidget {
  const RegistrationScreen({super.key});

  @override
  State<RegistrationScreen> createState() => _RegistrationScreenState();
}

class _RegistrationScreenState extends State<RegistrationScreen> {
  final TextEditingController _firstNameController = TextEditingController();
  final TextEditingController _lastNameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController = TextEditingController();
  String _message = '';

  Future<void> _handleRegistration() async {
    String firstName = _firstNameController.text.trim();
    String lastName = _lastNameController.text.trim();
    String email = _emailController.text.trim();
    String username = _usernameController.text.trim();
    String password = _passwordController.text;
    String confirmPassword = _confirmPasswordController.text;

    if (firstName.isEmpty || lastName.isEmpty || email.isEmpty || username.isEmpty || password.isEmpty) {
      setState(() {
        _message = 'Please fill in all fields';
      });
      return;
    }

    // Basic email validation
    if (!email.contains('@') || !email.contains('.')) {
      setState(() {
        _message = 'Please enter a valid email address';
      });
      return;
    }

    if (password != confirmPassword) {
      setState(() {
        _message = 'Passwords do not match';
      });
      return;
    }

    if (password.length < 6) {
      setState(() {
        _message = 'Password must be at least 6 characters';
      });
      return;
    }

    setState(() {
      _message = 'Creating account...';
    });

    try {
      const String apiBaseUrl = 'http://10.0.2.2:5000/api';
      const String registerEndpoint = '$apiBaseUrl/register';

      final Map<String, dynamic> requestBody = {
        'firstName': firstName,
        'lastName': lastName,
        'email': email,
        'login': username,
        'password': password,
      };

      final response = await http.post(
        Uri.parse(registerEndpoint),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode(requestBody),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = jsonDecode(response.body);
        
        if (responseData['error'] == null || responseData['error'].isEmpty) {
          // Registration successful
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (context) => const LoginScreen(),
            ),
          );
          
          // Show success message on login screen
          Future.delayed(const Duration(milliseconds: 500), () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Account created successfully! Please log in.'),
                backgroundColor: Colors.green,
              ),
            );
          });
        } else {
          // Registration failed
          setState(() {
            _message = responseData['error'];
          });
        }
      } else {
        setState(() {
          _message = 'Server error: ${response.statusCode}';
        });
      }
    } catch (e) {
      setState(() {
        _message = 'Network error: ${e.toString()}';
      });
      print('Registration error: $e');
    }
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _usernameController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Account'),
        backgroundColor: Colors.blue,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (context) => const LoginScreen()),
            );
          },
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // App Icon and Welcome
            const Icon(
              Icons.person_add,
              size: 80,
              color: Colors.blue,
            ),
            const SizedBox(height: 24),
            const Text(
              'Join Paper Trading',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Create your account to start trading',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 40),
            
            // First Name Field
            TextField(
              controller: _firstNameController,
              decoration: const InputDecoration(
                labelText: 'First Name',
                prefixIcon: Icon(Icons.person),
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
              textInputAction: TextInputAction.next,
              textCapitalization: TextCapitalization.words,
            ),
            const SizedBox(height: 16),
            
            // Last Name Field
            TextField(
              controller: _lastNameController,
              decoration: const InputDecoration(
                labelText: 'Last Name',
                prefixIcon: Icon(Icons.person_outline),
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
              textInputAction: TextInputAction.next,
              textCapitalization: TextCapitalization.words,
            ),
            const SizedBox(height: 16),
            
            // Email Field
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(
                labelText: 'Email',
                prefixIcon: Icon(Icons.email),
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                helperText: 'We\'ll use this for account verification',
              ),
              keyboardType: TextInputType.emailAddress,
              textInputAction: TextInputAction.next,
            ),
            const SizedBox(height: 16),
            
            // Username Field
            TextField(
              controller: _usernameController,
              decoration: const InputDecoration(
                labelText: 'Username',
                prefixIcon: Icon(Icons.account_circle),
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                helperText: 'This will be your login username',
              ),
              textInputAction: TextInputAction.next,
            ),
            const SizedBox(height: 16),
            
            // Password Field
            TextField(
              controller: _passwordController,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: 'Password',
                prefixIcon: Icon(Icons.lock),
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                helperText: 'At least 6 characters',
              ),
              textInputAction: TextInputAction.next,
            ),
            const SizedBox(height: 16),
            
            // Confirm Password Field
            TextField(
              controller: _confirmPasswordController,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: 'Confirm Password',
                prefixIcon: Icon(Icons.lock_outline),
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
              textInputAction: TextInputAction.done,
              onSubmitted: (_) => _handleRegistration(),
            ),
            const SizedBox(height: 24),
            
            // Register Button
            ElevatedButton(
              onPressed: _handleRegistration,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                elevation: 2,
              ),
              child: const Text(
                'Create Account',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 16),
            
            // Message Display
            if (_message.isNotEmpty)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: _message.contains('Creating') ? Colors.blue.shade50 : Colors.orange.shade50,
                  border: Border.all(color: _message.contains('Creating') ? Colors.blue.shade200 : Colors.orange.shade200),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  _message,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: _message.contains('Creating') ? Colors.blue.shade800 : Colors.orange.shade800,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            
            const SizedBox(height: 24),
            
            // Back to Login
            TextButton(
              onPressed: () {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (context) => const LoginScreen()),
                );
              },
              child: const Text(
                'Already have an account? Sign In',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.blue,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Main App Screen with Bottom Navigation
class MainAppScreen extends StatefulWidget {
  final int userId;
  final String firstName;
  final String lastName;

  const MainAppScreen({
    super.key,
    required this.userId,
    required this.firstName,
    required this.lastName,
  });

  @override
  State<MainAppScreen> createState() => _MainAppScreenState();
}

class _MainAppScreenState extends State<MainAppScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _getPage(_currentIndex),
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        selectedItemColor: Colors.blue,
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.pie_chart),
            label: 'Portfolio',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.swap_horiz),
            label: 'Trade',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.article),
            label: 'News',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.account_circle),
            label: 'Account',
          ),
        ],
      ),
    );
  }

  Widget _getPage(int index) {
    switch (index) {
      case 0:
        return HomeScreen(
          firstName: widget.firstName,
          lastName: widget.lastName,
        );
      case 1:
        return const PortfolioPage();
      case 2:
        return const TradePage();
      case 3:
        return const NewsScreen();
      case 4:
        return AccountScreen(
          firstName: widget.firstName,
          lastName: widget.lastName,
        );
      default:
        return HomeScreen(
          firstName: widget.firstName,
          lastName: widget.lastName,
        );
    }
  }
}

// Home Screen
class HomeScreen extends StatefulWidget {
  final String firstName;
  final String lastName;

  const HomeScreen({
    super.key,
    required this.firstName,
    required this.lastName,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  double _buyingPower = 10000.0; // Default starting buying power

  @override
  void initState() {
    super.initState();
    _loadBuyingPower();
  }

  Future<void> _loadBuyingPower() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      if (mounted) {
        setState(() {
          _buyingPower = prefs.getDouble('buying_power') ?? 10000.0;
        });
      }
    } catch (e) {
      print('Error loading buying power: $e');
      if (mounted) {
        setState(() {
          _buyingPower = 10000.0;
        });
      }
    }
  }

  Future<void> _saveBuyingPower() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setDouble('buying_power', _buyingPower);
    } catch (e) {
      print('Error saving buying power: $e');
    }
  }

  void _showAddFundsDialog() {
    final TextEditingController amountController = TextEditingController();
    
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Add Buying Power'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Current Balance: \$${_buyingPower.toStringAsFixed(2)}'),
              const SizedBox(height: 15),
              TextField(
                controller: amountController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Amount to Add',
                  prefixText: '\$',
                  border: OutlineInputBorder(),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                final amount = double.tryParse(amountController.text);
                if (amount != null && amount > 0) {
                  setState(() {
                    _buyingPower += amount;
                  });
                  _saveBuyingPower();
                  Navigator.of(context).pop();
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Added \$${amount.toStringAsFixed(2)} to your buying power!'),
                      backgroundColor: Colors.green,
                    ),
                  );
                }
              },
              child: const Text('Add Funds'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Paper Trading'),
        backgroundColor: Colors.blue,
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Smaller Welcome Section
            Text(
              'Welcome ${widget.firstName} ${widget.lastName}',
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 20),
            
            // Buying Power Section
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.green.shade400, Colors.green.shade600],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(15),
                boxShadow: [
                  BoxShadow(
                    color: Colors.green.withOpacity(0.3),
                    blurRadius: 10,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Buying Power',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '\$${_buyingPower.toStringAsFixed(2)}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 15),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _showAddFundsDialog,
                      icon: const Icon(Icons.add, color: Colors.green),
                      label: const Text(
                        'Increase Buying Power',
                        style: TextStyle(
                          color: Colors.green,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 30),
            
            // Portfolio Chart
            const PortfolioChart(),
            const SizedBox(height: 30),
            
            // Quick Actions
            const Text(
              'Quick Actions',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 15),
            
            Row(
              children: [
                Expanded(
                  child: _buildQuickActionCard(
                    'Stocks',
                    Icons.trending_up,
                    Colors.orange,
                    () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const StocksPage()),
                      );
                    },
                  ),
                ),
                const SizedBox(width: 15),
                Expanded(
                  child: _buildQuickActionCard(
                    'Research',
                    Icons.search,
                    Colors.blue,
                    () {},
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActionCard(String title, IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(15),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              size: 40,
              color: color,
            ),
            const SizedBox(height: 10),
            Text(
              title,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Account Screen
class AccountScreen extends StatelessWidget {
  final String firstName;
  final String lastName;

  const AccountScreen({
    super.key,
    required this.firstName,
    required this.lastName,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Account'),
        backgroundColor: Colors.blue,
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            // Profile Section
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(15),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                children: [
                  const CircleAvatar(
                    radius: 50,
                    backgroundColor: Colors.blue,
                    child: Icon(
                      Icons.person,
                      size: 60,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 15),
                  Text(
                    '$firstName $lastName',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 5),
                  const Text(
                    'Paper Trading Account',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 30),
            
            // Account Options
            _buildAccountOption(context, 'Portfolio Balance', Icons.account_balance_wallet, false),
            _buildAccountOption(context, 'Trading History', Icons.history, false),
            _buildAccountOption(context, 'Settings', Icons.settings, false),
            _buildAccountOption(context, 'Help & Support', Icons.help, false),
            _buildAccountOption(context, 'Log Out', Icons.logout, true),
          ],
        ),
      ),
    );
  }

  Widget _buildAccountOption(BuildContext context, String title, IconData icon, bool isLogout) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        leading: Icon(icon, color: isLogout ? Colors.red : Colors.blue),
        title: Text(
          title,
          style: TextStyle(
            color: isLogout ? Colors.red : Colors.black,
            fontWeight: isLogout ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: () {
          if (isLogout) {
            _showLogoutDialog(context);
          } else {
            // Handle other option taps
          }
        },
      ),
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Log Out'),
          content: const Text('Are you sure you want to log out?'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop(); // Close dialog
              },
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop(); // Close dialog
                _logout(context);
              },
              style: TextButton.styleFrom(
                foregroundColor: Colors.red,
              ),
              child: const Text('Log Out'),
            ),
          ],
        );
      },
    );
  }

  void _logout(BuildContext context) {
    // Navigate back to login screen and clear the navigation stack
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (context) => const LoginScreen()),
      (Route<dynamic> route) => false,
    );
  }
}

// Notifications Screen
class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        backgroundColor: Colors.blue,
        centerTitle: true,
      ),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.notifications_off,
              size: 80,
              color: Colors.grey,
            ),
            SizedBox(height: 20),
            Text(
              'No notifications yet',
              style: TextStyle(
                fontSize: 18,
                color: Colors.grey,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Trade Screen
class TradePage extends StatefulWidget {
  const TradePage({super.key});

  @override
  State<TradePage> createState() => _TradePageState();
}

class _TradePageState extends State<TradePage> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  double _buyingPower = 0.0;
  List<PortfolioHolding> _portfolio = [];
  List<Stock> _popularStocks = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    final buyingPower = await PortfolioManager.getBuyingPower();
    final portfolio = await PortfolioManager.getPortfolio();
    
    // Load popular stocks for quick trading
    final popularStocks = [
      Stock(symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, change: 2.15, changePercent: 1.24),
      Stock(symbol: 'MSFT', name: 'Microsoft Corporation', price: 337.89, change: -1.23, changePercent: -0.36),
      Stock(symbol: 'GOOGL', name: 'Alphabet Inc.', price: 125.30, change: 0.85, changePercent: 0.68),
      Stock(symbol: 'AMZN', name: 'Amazon.com Inc.', price: 133.13, change: 1.45, changePercent: 1.10),
      Stock(symbol: 'TSLA', name: 'Tesla Inc.', price: 242.65, change: -3.21, changePercent: -1.31),
      Stock(symbol: 'META', name: 'Meta Platforms Inc.', price: 273.37, change: 2.87, changePercent: 1.06),
      Stock(symbol: 'NVDA', name: 'NVIDIA Corporation', price: 455.72, change: 12.34, changePercent: 2.78),
      Stock(symbol: 'NFLX', name: 'Netflix Inc.', price: 378.96, change: -0.67, changePercent: -0.18),
    ];

    setState(() {
      _buyingPower = buyingPower;
      _portfolio = portfolio;
      _popularStocks = popularStocks;
    });
  }

  void _showQuickTradeDialog(Stock stock, bool isBuy) {
    final TextEditingController amountController = TextEditingController();
    
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('${isBuy ? 'Buy' : 'Sell'} ${stock.symbol}'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Current Price: \$${stock.price.toStringAsFixed(2)}'),
              if (isBuy) Text('Available Cash: \$${_buyingPower.toStringAsFixed(2)}'),
              if (!isBuy) _buildCurrentHoldingInfo(stock),
              const SizedBox(height: 15),
              TextField(
                controller: amountController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  labelText: 'Dollar Amount to ${isBuy ? 'Buy' : 'Sell'}',
                  prefixText: '\$',
                  border: const OutlineInputBorder(),
                  helperText: 'Enter the amount you want to ${isBuy ? 'invest' : 'sell'}',
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () => _executeTrade(stock, amountController.text, isBuy),
              style: ElevatedButton.styleFrom(
                backgroundColor: isBuy ? Colors.green : Colors.red,
              ),
              child: Text(
                isBuy ? 'Buy' : 'Sell',
                style: const TextStyle(color: Colors.white),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildCurrentHoldingInfo(Stock stock) {
    final holding = _portfolio.firstWhere(
      (h) => h.symbol == stock.symbol,
      orElse: () => PortfolioHolding(
        symbol: stock.symbol,
        name: stock.name,
        shares: 0,
        averagePrice: 0,
        currentPrice: stock.price,
      ),
    );
    
    if (holding.shares == 0) {
      return const Text('You don\'t own this stock');
    }
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Shares Owned: ${holding.shares.toStringAsFixed(4)}'),
        Text('Value: \$${(holding.shares * stock.price).toStringAsFixed(2)}'),
      ],
    );
  }

  Future<void> _executeTrade(Stock stock, String amountText, bool isBuy) async {
    final amount = double.tryParse(amountText);
    if (amount == null || amount <= 0) {
      Navigator.of(context).pop();
      _showMessage('Please enter a valid amount', Colors.red);
      return;
    }

    Navigator.of(context).pop();

    bool success;
    if (isBuy) {
      success = await PortfolioManager.buyStock(stock, amount);
    } else {
      success = await PortfolioManager.sellStock(stock, amount);
    }

    if (success) {
      final shares = amount / stock.price;
      _showMessage(
        'Successfully ${isBuy ? 'bought' : 'sold'} ${shares.toStringAsFixed(4)} shares of ${stock.symbol} for \$${amount.toStringAsFixed(2)}',
        Colors.green,
      );
      _loadData(); // Refresh data
    } else {
      _showMessage(
        isBuy ? 'Insufficient buying power' : 'Insufficient shares to sell',
        Colors.red,
      );
    }
  }

  void _showMessage(String message, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: color,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  void _showSwapDialog() {
    Stock? fromStock;
    Stock? toStock;
    final TextEditingController amountController = TextEditingController();

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: const Text('Swap Stocks'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Sell from:', style: TextStyle(fontWeight: FontWeight.bold)),
                    DropdownButton<Stock>(
                      value: fromStock,
                      hint: const Text('Select stock to sell'),
                      isExpanded: true,
                      items: _portfolio.map((holding) {
                        final stock = _popularStocks.firstWhere(
                          (s) => s.symbol == holding.symbol,
                          orElse: () => Stock(
                            symbol: holding.symbol, 
                            name: holding.name, 
                            price: holding.currentPrice, 
                            change: 0, 
                            changePercent: 0
                          ),
                        );
                        return DropdownMenuItem<Stock>(
                          value: stock,
                          child: Text('${stock.symbol} - ${holding.shares.toStringAsFixed(2)} shares'),
                        );
                      }).toList(),
                      onChanged: (Stock? value) {
                        setDialogState(() {
                          fromStock = value;
                        });
                      },
                    ),
                    const SizedBox(height: 16),
                    const Text('Buy into:', style: TextStyle(fontWeight: FontWeight.bold)),
                    DropdownButton<Stock>(
                      value: toStock,
                      hint: const Text('Select stock to buy'),
                      isExpanded: true,
                      items: _popularStocks.map((stock) {
                        return DropdownMenuItem<Stock>(
                          value: stock,
                          child: Text('${stock.symbol} - \$${stock.price.toStringAsFixed(2)}'),
                        );
                      }).toList(),
                      onChanged: (Stock? value) {
                        setDialogState(() {
                          toStock = value;
                        });
                      },
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: amountController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'Dollar Amount to Swap',
                        prefixText: '\$',
                        border: OutlineInputBorder(),
                        helperText: 'Amount to sell from first stock and buy into second',
                      ),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Cancel'),
                ),
                ElevatedButton(
                  onPressed: fromStock != null && toStock != null
                      ? () => _executeSwap(fromStock!, toStock!, amountController.text)
                      : null,
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
                  child: const Text('Swap', style: TextStyle(color: Colors.white)),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Future<void> _executeSwap(Stock fromStock, Stock toStock, String amountText) async {
    final amount = double.tryParse(amountText);
    if (amount == null || amount <= 0) {
      Navigator.of(context).pop();
      _showMessage('Please enter a valid amount', Colors.red);
      return;
    }

    Navigator.of(context).pop();

    // First sell the from stock
    final sellSuccess = await PortfolioManager.sellStock(fromStock, amount);
    if (!sellSuccess) {
      _showMessage('Failed to sell ${fromStock.symbol} - insufficient shares', Colors.red);
      return;
    }

    // Then buy the to stock
    final buySuccess = await PortfolioManager.buyStock(toStock, amount);
    if (!buySuccess) {
      // If buy fails, we need to buy back the original stock
      await PortfolioManager.buyStock(fromStock, amount);
      _showMessage('Failed to complete swap - insufficient funds', Colors.red);
      return;
    }

    _showMessage(
      'Successfully swapped \$${amount.toStringAsFixed(2)} from ${fromStock.symbol} to ${toStock.symbol}',
      Colors.green,
    );
    _loadData(); // Refresh data
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Trade'),
        backgroundColor: Colors.blue,
        centerTitle: true,
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Quick Trade'),
            Tab(text: 'Swap'),
            Tab(text: 'Portfolio'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildQuickTradeTab(),
          _buildSwapTab(),
          _buildPortfolioTab(),
        ],
      ),
    );
  }

  Widget _buildQuickTradeTab() {
    return Column(
      children: [
        // Buying Power Display
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          color: Colors.blue.shade50,
          child: Column(
            children: [
              const Text('Available Cash', style: TextStyle(fontSize: 16)),
              Text(
                '\$${_buyingPower.toStringAsFixed(2)}',
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ),
        // Popular Stocks List
        Expanded(
          child: ListView.builder(
            itemCount: _popularStocks.length,
            itemBuilder: (context, index) {
              final stock = _popularStocks[index];
              final isPositive = stock.change >= 0;
              final color = isPositive ? Colors.green : Colors.red;

              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: color.withOpacity(0.1),
                    child: Text(
                      stock.symbol.substring(0, 2),
                      style: TextStyle(color: color, fontWeight: FontWeight.bold),
                    ),
                  ),
                  title: Text(stock.symbol, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text(stock.name),
                  trailing: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        '\$${stock.price.toStringAsFixed(2)}',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            isPositive ? Icons.arrow_upward : Icons.arrow_downward,
                            color: color,
                            size: 16,
                          ),
                          Text(
                            '${isPositive ? '+' : ''}\$${stock.change.toStringAsFixed(2)}',
                            style: TextStyle(color: color, fontSize: 12),
                          ),
                        ],
                      ),
                    ],
                  ),
                  onTap: () => _showQuickTradeOptions(stock),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  void _showQuickTradeOptions(Stock stock) {
    showModalBottomSheet(
      context: context,
      builder: (BuildContext context) {
        return Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                stock.symbol,
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              Text(stock.name),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.pop(context);
                        _showQuickTradeDialog(stock, true);
                      },
                      icon: const Icon(Icons.trending_up),
                      label: const Text('Buy'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        foregroundColor: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.pop(context);
                        _showQuickTradeDialog(stock, false);
                      },
                      icon: const Icon(Icons.trending_down),
                      label: const Text('Sell'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red,
                        foregroundColor: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSwapTab() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.swap_horiz, size: 80, color: Colors.blue),
          const SizedBox(height: 20),
          const Text(
            'Stock Swapping',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 10),
          const Text(
            'Quickly swap between different stocks',
            style: TextStyle(fontSize: 16, color: Colors.grey),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 30),
          ElevatedButton.icon(
            onPressed: _portfolio.isNotEmpty ? _showSwapDialog : null,
            icon: const Icon(Icons.swap_horiz),
            label: const Text('Start Swap'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.orange,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
            ),
          ),
          if (_portfolio.isEmpty)
            const Padding(
              padding: EdgeInsets.only(top: 16),
              child: Text(
                'You need to own stocks to swap',
                style: TextStyle(color: Colors.grey),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildPortfolioTab() {
    if (_portfolio.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.account_balance_wallet_outlined, size: 80, color: Colors.grey),
            SizedBox(height: 20),
            Text('No holdings yet', style: TextStyle(fontSize: 18, color: Colors.grey)),
            Text('Start trading to build your portfolio', style: TextStyle(color: Colors.grey)),
          ],
        ),
      );
    }

    final totalValue = _portfolio.fold(
      0.0,
      (sum, holding) => sum + (holding.shares * holding.currentPrice),
    );

    return Column(
      children: [
        // Portfolio Summary
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          color: Colors.green.shade50,
          child: Column(
            children: [
              const Text('Portfolio Value', style: TextStyle(fontSize: 16)),
              Text(
                '\$${totalValue.toStringAsFixed(2)}',
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              Text('+ Cash: \$${_buyingPower.toStringAsFixed(2)}'),
              const Divider(),
              Text(
                'Total: \$${(totalValue + _buyingPower).toStringAsFixed(2)}',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ),
        // Holdings List
        Expanded(
          child: ListView.builder(
            itemCount: _portfolio.length,
            itemBuilder: (context, index) {
              final holding = _portfolio[index];
              final currentValue = holding.shares * holding.currentPrice;
              final gainLoss = currentValue - (holding.shares * holding.averagePrice);
              final gainLossPercent = ((holding.currentPrice - holding.averagePrice) / holding.averagePrice) * 100;
              final isPositive = gainLoss >= 0;

              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: isPositive ? Colors.green.shade100 : Colors.red.shade100,
                    child: Text(
                      holding.symbol.substring(0, 2),
                      style: TextStyle(
                        color: isPositive ? Colors.green : Colors.red,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  title: Text(holding.symbol, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('${holding.shares.toStringAsFixed(4)} shares'),
                      Text('Avg: \$${holding.averagePrice.toStringAsFixed(2)}'),
                    ],
                  ),
                  trailing: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        '\$${currentValue.toStringAsFixed(2)}',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        '${isPositive ? '+' : ''}\$${gainLoss.toStringAsFixed(2)}',
                        style: TextStyle(
                          color: isPositive ? Colors.green : Colors.red,
                          fontSize: 12,
                        ),
                      ),
                      Text(
                        '${isPositive ? '+' : ''}${gainLossPercent.toStringAsFixed(1)}%',
                        style: TextStyle(
                          color: isPositive ? Colors.green : Colors.red,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                  onTap: () {
                    final stock = _popularStocks.firstWhere(
                      (s) => s.symbol == holding.symbol,
                      orElse: () => Stock(
                        symbol: holding.symbol, 
                        name: holding.name, 
                        price: holding.currentPrice, 
                        change: 0, 
                        changePercent: 0
                      ),
                    );
                    _showQuickTradeOptions(stock);
                  },
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

// News Screen
class NewsScreen extends StatelessWidget {
  const NewsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Financial News'),
        backgroundColor: Colors.blue,
        centerTitle: true,
      ),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.article_outlined,
              size: 80,
              color: Colors.grey,
            ),
            SizedBox(height: 20),
            Text(
              'News feed coming soon',
              style: TextStyle(
                fontSize: 18,
                color: Colors.grey,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Stock model
class Stock {
  final String symbol;
  final String name;
  final double price;
  final double change;
  final double changePercent;

  Stock({
    required this.symbol,
    required this.name,
    required this.price,
    required this.change,
    required this.changePercent,
  });
}

// Portfolio holding model
class PortfolioHolding {
  final String symbol;
  final String name;
  final double shares;
  final double averagePrice;
  final double currentPrice;

  PortfolioHolding({
    required this.symbol,
    required this.name,
    required this.shares,
    required this.averagePrice,
    required this.currentPrice,
  });

  double get totalValue => shares * currentPrice;
  double get totalCost => shares * averagePrice;
  double get gainLoss => totalValue - totalCost;
  double get gainLossPercent => totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;

  Map<String, dynamic> toJson() {
    return {
      'symbol': symbol,
      'name': name,
      'shares': shares,
      'averagePrice': averagePrice,
      'currentPrice': currentPrice,
    };
  }

  factory PortfolioHolding.fromJson(Map<String, dynamic> json) {
    return PortfolioHolding(
      symbol: json['symbol'],
      name: json['name'],
      shares: json['shares'],
      averagePrice: json['averagePrice'],
      currentPrice: json['currentPrice'],
    );
  }
}

// Portfolio Value History Point
class PortfolioValuePoint {
  final DateTime timestamp;
  final double totalValue;
  final double buyingPower;

  PortfolioValuePoint({
    required this.timestamp,
    required this.totalValue,
    required this.buyingPower,
  });

  double get combinedValue => totalValue + buyingPower;

  Map<String, dynamic> toJson() {
    return {
      'timestamp': timestamp.millisecondsSinceEpoch,
      'totalValue': totalValue,
      'buyingPower': buyingPower,
    };
  }

  factory PortfolioValuePoint.fromJson(Map<String, dynamic> json) {
    return PortfolioValuePoint(
      timestamp: DateTime.fromMillisecondsSinceEpoch(json['timestamp']),
      totalValue: json['totalValue'],
      buyingPower: json['buyingPower'],
    );
  }
}

// Portfolio Chart Painter
class PortfolioChartPainter extends CustomPainter {
  final List<PortfolioValuePoint> points;
  final double maxValue;
  final double minValue;

  PortfolioChartPainter({
    required this.points,
    required this.maxValue,
    required this.minValue,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (points.isEmpty) return;

    final paint = Paint()
      ..color = Colors.blue
      ..strokeWidth = 2.0
      ..style = PaintingStyle.stroke;

    final fillPaint = Paint()
      ..color = Colors.blue.withOpacity(0.1)
      ..style = PaintingStyle.fill;

    final path = Path();
    final fillPath = Path();

    for (int i = 0; i < points.length; i++) {
      final x = (i / (points.length - 1)) * size.width;
      final normalizedValue = (points[i].combinedValue - minValue) / (maxValue - minValue);
      final y = size.height - (normalizedValue * size.height);

      if (i == 0) {
        path.moveTo(x, y);
        fillPath.moveTo(x, size.height);
        fillPath.lineTo(x, y);
      } else {
        path.lineTo(x, y);
        fillPath.lineTo(x, y);
      }
    }

    // Complete the fill path
    fillPath.lineTo(size.width, size.height);
    fillPath.close();

    // Draw the filled area
    canvas.drawPath(fillPath, fillPaint);
    
    // Draw the line
    canvas.drawPath(path, paint);

    // Draw points
    final pointPaint = Paint()
      ..color = Colors.blue
      ..style = PaintingStyle.fill;

    for (int i = 0; i < points.length; i++) {
      final x = (i / (points.length - 1)) * size.width;
      final normalizedValue = (points[i].combinedValue - minValue) / (maxValue - minValue);
      final y = size.height - (normalizedValue * size.height);
      canvas.drawCircle(Offset(x, y), 3, pointPaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

// Portfolio Chart Widget
class PortfolioChart extends StatefulWidget {
  const PortfolioChart({super.key});

  @override
  State<PortfolioChart> createState() => _PortfolioChartState();
}

class _PortfolioChartState extends State<PortfolioChart> {
  List<PortfolioValuePoint> _history = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadChartData();
  }

  Future<void> _loadChartData() async {
    // Update current prices first
    await _updateCurrentPrices();
    
    final history = await PortfolioManager.getPortfolioHistory();
    
    // If no history exists, create initial point
    if (history.isEmpty) {
      final portfolio = await PortfolioManager.getPortfolio();
      final buyingPower = await PortfolioManager.getBuyingPower();
      final totalValue = portfolio.fold(0.0, (sum, holding) => sum + holding.totalValue);
      
      final initialPoint = PortfolioValuePoint(
        timestamp: DateTime.now(),
        totalValue: totalValue,
        buyingPower: buyingPower,
      );
      
      history.add(initialPoint);
      await PortfolioManager._savePortfolioHistory(history);
    }

    setState(() {
      _history = history;
      _isLoading = false;
    });
  }

  Future<void> _updateCurrentPrices() async {
    // Simulate price updates with sample stocks
    final sampleStocks = [
      Stock(symbol: 'AAPL', name: 'Apple Inc.', price: 175.43 + (math.Random().nextDouble() - 0.5) * 10, change: 0, changePercent: 0),
      Stock(symbol: 'MSFT', name: 'Microsoft Corporation', price: 337.89 + (math.Random().nextDouble() - 0.5) * 15, change: 0, changePercent: 0),
      Stock(symbol: 'GOOGL', name: 'Alphabet Inc.', price: 125.30 + (math.Random().nextDouble() - 0.5) * 8, change: 0, changePercent: 0),
      Stock(symbol: 'AMZN', name: 'Amazon.com Inc.', price: 133.13 + (math.Random().nextDouble() - 0.5) * 12, change: 0, changePercent: 0),
      Stock(symbol: 'TSLA', name: 'Tesla Inc.', price: 242.65 + (math.Random().nextDouble() - 0.5) * 20, change: 0, changePercent: 0),
      Stock(symbol: 'META', name: 'Meta Platforms Inc.', price: 273.37 + (math.Random().nextDouble() - 0.5) * 18, change: 0, changePercent: 0),
      Stock(symbol: 'NVDA', name: 'NVIDIA Corporation', price: 455.72 + (math.Random().nextDouble() - 0.5) * 25, change: 0, changePercent: 0),
      Stock(symbol: 'NFLX', name: 'Netflix Inc.', price: 378.96 + (math.Random().nextDouble() - 0.5) * 22, change: 0, changePercent: 0),
    ];
    
    await PortfolioManager.updatePortfolioCurrentPrices(sampleStocks);
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Container(
        height: 200,
        width: double.infinity,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(15),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: const Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (_history.isEmpty) {
      return Container(
        height: 200,
        width: double.infinity,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(15),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.show_chart, size: 50, color: Colors.grey),
              SizedBox(height: 10),
              Text(
                'Start trading to see your portfolio chart',
                style: TextStyle(color: Colors.grey),
              ),
            ],
          ),
        ),
      );
    }

    final maxValue = _history.map((p) => p.combinedValue).reduce(math.max);
    final minValue = _history.map((p) => p.combinedValue).reduce(math.min);
    final currentValue = _history.last.combinedValue;
    final previousValue = _history.length > 1 ? _history[_history.length - 2].combinedValue : currentValue;
    final change = currentValue - previousValue;
    final changePercent = previousValue > 0 ? (change / previousValue) * 100 : 0;
    final isPositive = change >= 0;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Total Portfolio Value',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                      color: Colors.black87,
                    ),
                  ),
                  Text(
                    '\$${currentValue.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Row(
                    children: [
                      Icon(
                        isPositive ? Icons.trending_up : Icons.trending_down,
                        color: isPositive ? Colors.green : Colors.red,
                        size: 20,
                      ),
                      Text(
                        '${isPositive ? '+' : ''}\$${change.abs().toStringAsFixed(2)}',
                        style: TextStyle(
                          color: isPositive ? Colors.green : Colors.red,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  Text(
                    '${isPositive ? '+' : ''}${changePercent.toStringAsFixed(2)}%',
                    style: TextStyle(
                      color: isPositive ? Colors.green : Colors.red,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 20),
          SizedBox(
            height: 120,
            child: CustomPaint(
              size: Size.infinite,
              painter: PortfolioChartPainter(
                points: _history,
                maxValue: maxValue,
                minValue: minValue,
              ),
            ),
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                _history.length > 1 
                    ? _formatDate(_history.first.timestamp)
                    : 'Today',
                style: const TextStyle(
                  fontSize: 12,
                  color: Colors.grey,
                ),
              ),
              Text(
                'Now',
                style: const TextStyle(
                  fontSize: 12,
                  color: Colors.grey,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date).inDays;
    
    if (difference == 0) {
      return 'Today';
    } else if (difference == 1) {
      return 'Yesterday';
    } else if (difference < 7) {
      return '${difference}d ago';
    } else {
      return '${(difference / 7).round()}w ago';
    }
  }
}

// Portfolio Manager class
class PortfolioManager {
  static const String _portfolioKey = 'portfolio_holdings';
  static const String _buyingPowerKey = 'buying_power';

  static Future<List<PortfolioHolding>> getPortfolio() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final portfolioJson = prefs.getStringList(_portfolioKey) ?? [];
      return portfolioJson
          .map((json) => PortfolioHolding.fromJson(Map<String, dynamic>.from(jsonDecode(json))))
          .toList();
    } catch (e) {
      print('Error loading portfolio: $e');
      return [];
    }
  }

  static Future<void> savePortfolio(List<PortfolioHolding> portfolio) async {
    final prefs = await SharedPreferences.getInstance();
    final portfolioJson = portfolio.map((holding) => jsonEncode(holding.toJson())).toList();
    await prefs.setStringList(_portfolioKey, portfolioJson);
  }

  static Future<double> getBuyingPower() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getDouble(_buyingPowerKey) ?? 10000.0;
    } catch (e) {
      print('Error loading buying power: $e');
      return 10000.0;
    }
  }

  static Future<void> saveBuyingPower(double buyingPower) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setDouble(_buyingPowerKey, buyingPower);
  }

  static Future<bool> buyStock(Stock stock, double dollarAmount) async {
    final buyingPower = await getBuyingPower();
    if (dollarAmount > buyingPower) {
      return false; // Insufficient funds
    }

    final shares = dollarAmount / stock.price;
    final portfolio = await getPortfolio();
    
    // Check if we already own this stock
    final existingIndex = portfolio.indexWhere((holding) => holding.symbol == stock.symbol);
    
    if (existingIndex >= 0) {
      // Update existing holding
      final existing = portfolio[existingIndex];
      final totalShares = existing.shares + shares;
      final totalCost = (existing.shares * existing.averagePrice) + dollarAmount;
      final newAveragePrice = totalCost / totalShares;
      
      portfolio[existingIndex] = PortfolioHolding(
        symbol: stock.symbol,
        name: stock.name,
        shares: totalShares,
        averagePrice: newAveragePrice,
        currentPrice: stock.price,
      );
    } else {
      // Add new holding
      portfolio.add(PortfolioHolding(
        symbol: stock.symbol,
        name: stock.name,
        shares: shares,
        averagePrice: stock.price,
        currentPrice: stock.price,
      ));
    }

    await savePortfolio(portfolio);
    await saveBuyingPower(buyingPower - dollarAmount);
    await _recordPortfolioValue(); // Record portfolio value after trade
    return true;
  }

  static Future<bool> sellStock(Stock stock, double dollarAmount) async {
    final portfolio = await getPortfolio();
    final holdingIndex = portfolio.indexWhere((holding) => holding.symbol == stock.symbol);
    
    if (holdingIndex < 0) {
      return false; // Don't own this stock
    }

    final holding = portfolio[holdingIndex];
    final sharesToSell = dollarAmount / stock.price;
    
    if (sharesToSell > holding.shares) {
      return false; // Don't have enough shares
    }

    final buyingPower = await getBuyingPower();
    
    if (sharesToSell >= holding.shares) {
      // Sell all shares
      portfolio.removeAt(holdingIndex);
    } else {
      // Sell partial shares
      portfolio[holdingIndex] = PortfolioHolding(
        symbol: holding.symbol,
        name: holding.name,
        shares: holding.shares - sharesToSell,
        averagePrice: holding.averagePrice,
        currentPrice: stock.price,
      );
    }

    await savePortfolio(portfolio);
    await saveBuyingPower(buyingPower + dollarAmount);
    await _recordPortfolioValue(); // Record portfolio value after trade
    return true;
  }

  // Portfolio Value History Tracking
  static const String _portfolioHistoryKey = 'portfolio_value_history';

  static Future<List<PortfolioValuePoint>> getPortfolioHistory() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final historyJson = prefs.getStringList(_portfolioHistoryKey) ?? [];
      return historyJson
          .map((json) => PortfolioValuePoint.fromJson(Map<String, dynamic>.from(jsonDecode(json))))
          .toList();
    } catch (e) {
      print('Error loading portfolio history: $e');
      return [];
    }
  }

  static Future<void> _savePortfolioHistory(List<PortfolioValuePoint> history) async {
    final prefs = await SharedPreferences.getInstance();
    final historyJson = history.map((point) => jsonEncode(point.toJson())).toList();
    await prefs.setStringList(_portfolioHistoryKey, historyJson);
  }

  static Future<void> _recordPortfolioValue() async {
    final portfolio = await getPortfolio();
    final buyingPower = await getBuyingPower();
    final totalPortfolioValue = portfolio.fold(0.0, (sum, holding) => sum + holding.totalValue);
    
    final history = await getPortfolioHistory();
    final newPoint = PortfolioValuePoint(
      timestamp: DateTime.now(),
      totalValue: totalPortfolioValue,
      buyingPower: buyingPower,
    );

    history.add(newPoint);

    // Keep only the last 100 points to avoid storage bloat
    if (history.length > 100) {
      history.removeRange(0, history.length - 100);
    }

    await _savePortfolioHistory(history);
  }

  static Future<void> updatePortfolioCurrentPrices(List<Stock> currentStocks) async {
    final portfolio = await getPortfolio();
    bool hasChanges = false;

    for (int i = 0; i < portfolio.length; i++) {
      final holding = portfolio[i];
      final stock = currentStocks.firstWhere(
        (s) => s.symbol == holding.symbol,
        orElse: () => Stock(
          symbol: holding.symbol,
          name: holding.name,
          price: holding.currentPrice,
          change: 0,
          changePercent: 0,
        ),
      );

      if (stock.price != holding.currentPrice) {
        portfolio[i] = PortfolioHolding(
          symbol: holding.symbol,
          name: holding.name,
          shares: holding.shares,
          averagePrice: holding.averagePrice,
          currentPrice: stock.price,
        );
        hasChanges = true;
      }
    }

    if (hasChanges) {
      await savePortfolio(portfolio);
      await _recordPortfolioValue(); // Record new portfolio value
    }
  }
}

// Stocks Page
class StocksPage extends StatefulWidget {
  const StocksPage({super.key});

  @override
  State<StocksPage> createState() => _StocksPageState();
}

class _StocksPageState extends State<StocksPage> {
  List<Stock> _stocks = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadStocks();
  }

  void _loadStocks() {
    // Simulated top 20 US stocks with sample data
    _stocks = [
      Stock(symbol: 'AAPL', name: 'Apple Inc.', price: 182.52, change: 2.34, changePercent: 1.30),
      Stock(symbol: 'MSFT', name: 'Microsoft Corporation', price: 378.85, change: -1.22, changePercent: -0.32),
      Stock(symbol: 'GOOGL', name: 'Alphabet Inc.', price: 141.80, change: 3.45, changePercent: 2.49),
      Stock(symbol: 'AMZN', name: 'Amazon.com Inc.', price: 145.86, change: 0.92, changePercent: 0.63),
      Stock(symbol: 'NVDA', name: 'NVIDIA Corporation', price: 875.28, change: 15.67, changePercent: 1.82),
      Stock(symbol: 'TSLA', name: 'Tesla Inc.', price: 248.98, change: -4.32, changePercent: -1.71),
      Stock(symbol: 'META', name: 'Meta Platforms Inc.', price: 325.16, change: 8.21, changePercent: 2.59),
      Stock(symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', price: 442.75, change: 1.85, changePercent: 0.42),
      Stock(symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 154.32, change: -0.98, changePercent: -0.63),
      Stock(symbol: 'JNJ', name: 'Johnson & Johnson', price: 161.47, change: 0.34, changePercent: 0.21),
      Stock(symbol: 'V', name: 'Visa Inc.', price: 267.89, change: 2.12, changePercent: 0.80),
      Stock(symbol: 'PG', name: 'Procter & Gamble Co.', price: 155.23, change: -0.45, changePercent: -0.29),
      Stock(symbol: 'UNH', name: 'UnitedHealth Group Inc.', price: 502.15, change: 6.78, changePercent: 1.37),
      Stock(symbol: 'HD', name: 'Home Depot Inc.', price: 345.67, change: -2.34, changePercent: -0.67),
      Stock(symbol: 'DIS', name: 'Walt Disney Co.', price: 95.32, change: 1.67, changePercent: 1.78),
      Stock(symbol: 'MA', name: 'Mastercard Inc.', price: 412.89, change: 3.45, changePercent: 0.84),
      Stock(symbol: 'BAC', name: 'Bank of America Corp.', price: 37.25, change: -0.12, changePercent: -0.32),
      Stock(symbol: 'XOM', name: 'Exxon Mobil Corporation', price: 108.65, change: 2.87, changePercent: 2.71),
      Stock(symbol: 'NFLX', name: 'Netflix Inc.', price: 445.23, change: -7.89, changePercent: -1.74),
      Stock(symbol: 'CRM', name: 'Salesforce Inc.', price: 287.46, change: 4.23, changePercent: 1.49),
    ];
    
    setState(() {
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Stocks'),
        backgroundColor: Colors.blue,
        centerTitle: true,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _stocks.length,
              itemBuilder: (context, index) {
                final stock = _stocks[index];
                return _buildStockCard(stock);
              },
            ),
    );
  }

  Widget _buildStockCard(Stock stock) {
    final isPositive = stock.change >= 0;
    final color = isPositive ? Colors.green : Colors.red;
    
    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            color: Colors.blue.shade50,
            borderRadius: BorderRadius.circular(25),
          ),
          child: Center(
            child: Text(
              stock.symbol.length >= 2 ? stock.symbol.substring(0, 2) : stock.symbol,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.blue.shade700,
              ),
            ),
          ),
        ),
        title: Text(
          stock.symbol,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
        subtitle: Text(
          stock.name,
          style: TextStyle(
            color: Colors.grey.shade600,
            fontSize: 12,
          ),
        ),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              '\$${stock.price.toStringAsFixed(2)}',
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  isPositive ? Icons.arrow_upward : Icons.arrow_downward,
                  color: color,
                  size: 16,
                ),
                Text(
                  '${isPositive ? '+' : ''}${stock.change.toStringAsFixed(2)} (${isPositive ? '+' : ''}${stock.changePercent.toStringAsFixed(2)}%)',
                  style: TextStyle(
                    color: color,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ],
        ),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => StockDetailPage(stock: stock),
            ),
          );
        },
      ),
    );
  }
}

// Stock Detail Page with Chart
class StockDetailPage extends StatefulWidget {
  final Stock stock;

  const StockDetailPage({super.key, required this.stock});

  @override
  State<StockDetailPage> createState() => _StockDetailPageState();
}

class _StockDetailPageState extends State<StockDetailPage> {
  void _showBuyDialog(BuildContext context) {
    final TextEditingController amountController = TextEditingController();
    
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Buy ${widget.stock.symbol}'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Current Price: \$${widget.stock.price.toStringAsFixed(2)}'),
              const SizedBox(height: 15),
              TextField(
                controller: amountController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Dollar Amount to Invest',
                  prefixText: '\$',
                  border: OutlineInputBorder(),
                  helperText: 'Enter the amount you want to invest',
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                final amount = double.tryParse(amountController.text);
                if (amount != null && amount > 0) {
                  final success = await PortfolioManager.buyStock(widget.stock, amount);
                  Navigator.of(context).pop();
                  
                  if (success) {
                    final shares = amount / widget.stock.price;
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Successfully bought ${shares.toStringAsFixed(4)} shares of ${widget.stock.symbol} for \$${amount.toStringAsFixed(2)}'),
                        backgroundColor: Colors.green,
                      ),
                    );
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Insufficient buying power'),
                        backgroundColor: Colors.red,
                      ),
                    );
                  }
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
              child: const Text('Buy', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }

  void _showSellDialog(BuildContext context) {
    final TextEditingController amountController = TextEditingController();
    
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Sell ${widget.stock.symbol}'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Current Price: \$${widget.stock.price.toStringAsFixed(2)}'),
              const SizedBox(height: 15),
              TextField(
                controller: amountController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Dollar Amount to Sell',
                  prefixText: '\$',
                  border: OutlineInputBorder(),
                  helperText: 'Enter the amount you want to sell',
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                final amount = double.tryParse(amountController.text);
                if (amount != null && amount > 0) {
                  final success = await PortfolioManager.sellStock(widget.stock, amount);
                  Navigator.of(context).pop();
                  
                  if (success) {
                    final shares = amount / widget.stock.price;
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Successfully sold ${shares.toStringAsFixed(4)} shares of ${widget.stock.symbol} for \$${amount.toStringAsFixed(2)}'),
                        backgroundColor: Colors.green,
                      ),
                    );
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Insufficient shares to sell'),
                        backgroundColor: Colors.red,
                      ),
                    );
                  }
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
              child: const Text('Sell', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isPositive = widget.stock.change >= 0;
    final color = isPositive ? Colors.green : Colors.red;

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.stock.symbol),
        backgroundColor: Colors.blue,
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Stock Header
            Card(
              elevation: 4,
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.stock.symbol,
                      style: const TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      widget.stock.name,
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.grey.shade600,
                      ),
                    ),
                    const SizedBox(height: 15),
                    Text(
                      '\$${widget.stock.price.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 36,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Row(
                      children: [
                        Icon(
                          isPositive ? Icons.arrow_upward : Icons.arrow_downward,
                          color: color,
                          size: 20,
                        ),
                        Text(
                          '${isPositive ? '+' : ''}${widget.stock.change.toStringAsFixed(2)} (${isPositive ? '+' : ''}${widget.stock.changePercent.toStringAsFixed(2)}%)',
                          style: TextStyle(
                            color: color,
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            
            // Simulated Chart
            Card(
              elevation: 4,
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Chart (1D)',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 15),
                    Container(
                      height: 200,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade50,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.grey.shade200),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(10),
                        child: Stack(
                          children: [
                            // Chart background grid
                            CustomPaint(
                              size: const Size(double.infinity, 200),
                              painter: GridPainter(),
                            ),
                            // Simulated chart line
                            CustomPaint(
                              size: const Size(double.infinity, 200),
                              painter: SimpleChartPainter(isPositive: isPositive),
                            ),
                            // Chart info overlay
                            Positioned(
                              top: 10,
                              left: 10,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.8),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  '1D Chart',
                                  style: TextStyle(
                                    color: Colors.grey.shade700,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            
            // Action Buttons
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _showBuyDialog(context),
                    icon: const Icon(Icons.add_shopping_cart),
                    label: const Text('Buy'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 15),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _showSellDialog(context),
                    icon: const Icon(Icons.sell),
                    label: const Text('Sell'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 15),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// Simple Chart Painter for visualization
class SimpleChartPainter extends CustomPainter {
  final bool isPositive;

  SimpleChartPainter({required this.isPositive});

  @override
  void paint(Canvas canvas, Size size) {
    if (size.width <= 0 || size.height <= 0) return;
    
    final paint = Paint()
      ..color = isPositive ? Colors.green.withOpacity(0.7) : Colors.red.withOpacity(0.7)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    final path = Path();
    
    // Create a more realistic stock chart pattern
    final points = <Offset>[];
    final numPoints = 20;
    
    for (int i = 0; i < numPoints; i++) {
      final x = (size.width / (numPoints - 1)) * i;
      final baseY = size.height * 0.5;
      
      // Create more realistic price movement
      final noise = (i * 37) % 40 - 20; // Pseudo-random noise
      final trend = isPositive ? -i * 2 : i * 2; // Overall trend
      final y = (baseY + noise + trend).clamp(size.height * 0.1, size.height * 0.9);
      
      points.add(Offset(x, y));
    }

    if (points.length >= 2) {
      path.moveTo(points.first.dx, points.first.dy);
      
      // Create smooth curves between points
      for (int i = 1; i < points.length; i++) {
        if (i == 1) {
          path.lineTo(points[i].dx, points[i].dy);
        } else {
          final previousPoint = points[i - 1];
          final currentPoint = points[i];
          final controlPoint1 = Offset(
            previousPoint.dx + (currentPoint.dx - previousPoint.dx) * 0.3,
            previousPoint.dy,
          );
          final controlPoint2 = Offset(
            previousPoint.dx + (currentPoint.dx - previousPoint.dx) * 0.7,
            currentPoint.dy,
          );
          path.cubicTo(
            controlPoint1.dx, controlPoint1.dy,
            controlPoint2.dx, controlPoint2.dy,
            currentPoint.dx, currentPoint.dy,
          );
        }
      }
      
      canvas.drawPath(path, paint);
      
      // Draw fill area under the line
      final fillPath = Path.from(path);
      fillPath.lineTo(size.width, size.height);
      fillPath.lineTo(0, size.height);
      fillPath.close();
      
      final fillPaint = Paint()
        ..color = (isPositive ? Colors.green : Colors.red).withOpacity(0.1)
        ..style = PaintingStyle.fill;
      
      canvas.drawPath(fillPath, fillPaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// Portfolio Page
class PortfolioPage extends StatefulWidget {
  const PortfolioPage({super.key});

  @override
  State<PortfolioPage> createState() => _PortfolioPageState();
}

class _PortfolioPageState extends State<PortfolioPage> {
  List<PortfolioHolding> _portfolio = [];
  double _buyingPower = 0.0;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPortfolio();
  }

  Future<void> _loadPortfolio() async {
    try {
      final portfolio = await PortfolioManager.getPortfolio();
      final buyingPower = await PortfolioManager.getBuyingPower();
      
      if (mounted) {
        setState(() {
          _portfolio = portfolio;
          _buyingPower = buyingPower;
          _isLoading = false;
        });
      }
    } catch (e) {
      print('Error loading portfolio page: $e');
      if (mounted) {
        setState(() {
          _portfolio = [];
          _buyingPower = 10000.0;
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Error loading portfolio. Using default values.'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    }
  }

  double get _totalPortfolioValue {
    return _portfolio.fold(0.0, (sum, holding) => sum + holding.totalValue);
  }

  double get _totalGainLoss {
    return _portfolio.fold(0.0, (sum, holding) => sum + holding.gainLoss);
  }

  double get _totalGainLossPercent {
    final totalCost = _portfolio.fold(0.0, (sum, holding) => sum + holding.totalCost);
    return totalCost > 0 ? (_totalGainLoss / totalCost) * 100 : 0;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Portfolio'),
        backgroundColor: Colors.blue,
        centerTitle: true,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadPortfolio,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Portfolio Summary
                    Card(
                      elevation: 4,
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Portfolio Summary',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 15),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'Total Value',
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: Colors.grey,
                                      ),
                                    ),
                                    Text(
                                      '\$${_totalPortfolioValue.toStringAsFixed(2)}',
                                      style: const TextStyle(
                                        fontSize: 24,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    const Text(
                                      'Total Gain/Loss',
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: Colors.grey,
                                      ),
                                    ),
                                    Text(
                                      '${_totalGainLoss >= 0 ? '+' : ''}\$${_totalGainLoss.toStringAsFixed(2)} (${_totalGainLossPercent >= 0 ? '+' : ''}${_totalGainLossPercent.toStringAsFixed(2)}%)',
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: _totalGainLoss >= 0 ? Colors.green : Colors.red,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            const SizedBox(height: 15),
                            Row(
                              children: [
                                const Text(
                                  'Buying Power: ',
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: Colors.grey,
                                  ),
                                ),
                                Text(
                                  '\$${_buyingPower.toStringAsFixed(2)}',
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.blue,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    
                    // Holdings
                    const Text(
                      'Your Holdings',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 10),
                    
                    if (_portfolio.isEmpty)
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(40),
                          child: Center(
                            child: Column(
                              children: [
                                Icon(
                                  Icons.pie_chart_outline,
                                  size: 60,
                                  color: Colors.grey.shade400,
                                ),
                                const SizedBox(height: 15),
                                Text(
                                  'No stocks in your portfolio yet',
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: Colors.grey.shade600,
                                  ),
                                ),
                                const SizedBox(height: 10),
                                const Text(
                                  'Start investing by buying stocks!',
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: Colors.grey,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      )
                    else
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _portfolio.length,
                        itemBuilder: (context, index) {
                          final holding = _portfolio[index];
                          return _buildHoldingCard(holding);
                        },
                      ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildHoldingCard(PortfolioHolding holding) {
    final isPositive = holding.gainLoss >= 0;
    final color = isPositive ? Colors.green : Colors.red;
    
    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      holding.symbol,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      holding.name,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '\$${holding.totalValue.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          isPositive ? Icons.arrow_upward : Icons.arrow_downward,
                          color: color,
                          size: 16,
                        ),
                        Text(
                          '${isPositive ? '+' : ''}\$${holding.gainLoss.toStringAsFixed(2)} (${isPositive ? '+' : ''}${holding.gainLossPercent.toStringAsFixed(2)}%)',
                          style: TextStyle(
                            color: color,
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Shares: ${holding.shares.toStringAsFixed(4)}',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                  ),
                ),
                Text(
                  'Avg Cost: \$${holding.averagePrice.toStringAsFixed(2)}',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                  ),
                ),
                Text(
                  'Current: \$${holding.currentPrice.toStringAsFixed(2)}',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// Grid Painter for chart background
class GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    if (size.width <= 0 || size.height <= 0) return;
    
    final paint = Paint()
      ..color = Colors.grey.shade300
      ..strokeWidth = 0.5
      ..style = PaintingStyle.stroke;

    // Draw horizontal grid lines
    for (int i = 1; i < 5; i++) {
      final y = (size.height / 5) * i;
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }

    // Draw vertical grid lines
    for (int i = 1; i < 8; i++) {
      final x = (size.width / 8) * i;
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
