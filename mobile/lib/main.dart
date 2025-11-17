import 'dart:convert';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'api_host.dart';
import 'pages/news_page.dart';
import 'services/api_service.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SimpliTrade Mobile',
      theme: ThemeData(
        primarySwatch: MaterialColor(0xFF6C5CE7, {
          50: const Color(0xFFEDE8FF),
          100: const Color(0xFFD3C6FF),
          200: const Color(0xFFB69FFF),
          300: const Color(0xFF9876FF),
          400: const Color(0xFF8257FF),
          500: const Color(0xFF6C5CE7),
          600: const Color(0xFF5F4ECC),
          700: const Color(0xFF523EB0),
          800: const Color(0xFF452E95),
          900: const Color(0xFF331B6F),
        }),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6C5CE7),
          primary: const Color(0xFF6C5CE7),
          secondary: const Color(0xFF7ED321),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF6C5CE7),
          foregroundColor: Colors.white,
          centerTitle: true,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF7ED321),
            foregroundColor: Colors.white,
          ),
        ),
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
  // Compute API base URL appropriate for the current platform.
  final String apiBaseUrl = ApiHost.getBaseUrl();
  final String loginEndpoint = '$apiBaseUrl/login';

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

      if (!mounted) return;
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
          if (!mounted) return;
          setState(() {
            _message = 'Invalid username or password';
          });
        }
      } else {
        if (!mounted) return;
        setState(() {
          _message = 'Server error: ${response.statusCode}';
        });
      }
    } catch (e) {
      if (!mounted) return;
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
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFF6C5CE7),
              Color(0xFF9776EC),
            ],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 40),
                // SimpliTrade Logo
                Container(
                  height: 120,
                  width: 120,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 10,
                        offset: const Offset(0, 5),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: Image.asset(
                      'assets/simpli_trade_logo.png',
                      fit: BoxFit.contain,
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                const Text(
                  'Welcome to SimpliTrade',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Sign in to your account',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.white70,
                  ),
                ),
            const SizedBox(height: 40),
            
            // Username Field
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 5,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: TextField(
                controller: _usernameController,
                decoration: const InputDecoration(
                  labelText: 'Username',
                  prefixIcon: Icon(Icons.person, color: Color(0xFF6C5CE7)),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.all(Radius.circular(12)),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  fillColor: Colors.white,
                  filled: true,
                ),
                textInputAction: TextInputAction.next,
              ),
            ),
            const SizedBox(height: 16),
            
            // Password Field
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 5,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: TextField(
                controller: _passwordController,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Password',
                  prefixIcon: Icon(Icons.lock, color: Color(0xFF6C5CE7)),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.all(Radius.circular(12)),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  fillColor: Colors.white,
                  filled: true,
                ),
                textInputAction: TextInputAction.done,
                onSubmitted: (_) => _handleLogin(),
              ),
            ),
            const SizedBox(height: 24),
            
            // Login Button
            ElevatedButton(
              onPressed: _handleLogin,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF7ED321),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 3,
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
                side: const BorderSide(color: Colors.white, width: 2),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text(
                'Create New Account',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
            const SizedBox(height: 20),
              ],
            ),
          ),
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
  final String apiBaseUrl = ApiHost.getBaseUrl();
      final String registerEndpoint = '$apiBaseUrl/register';

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

  if (!mounted) return;
  if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = jsonDecode(response.body);
        
        if (responseData['error'] == null || responseData['error'].isEmpty) {
          // Registration successful - Show email verification message
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (context) => EmailVerificationScreen(
                email: email,
              ),
            ),
          );
        } else {
          // Registration failed
          if (!mounted) return;
          setState(() {
            _message = responseData['error'];
          });
        }
      } else {
        if (!mounted) return;
        setState(() {
          _message = 'Server error: ${response.statusCode}';
        });
      }
    } catch (e) {
      if (!mounted) return;
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
    _emailController.dispose();
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
        backgroundColor: const Color(0xFF6C5CE7),
        foregroundColor: Colors.white,
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
                backgroundColor: const Color(0xFF7ED321),
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
                  color: _message.contains('Creating') ? const Color(0xFF6C5CE7).withOpacity(0.1) : Colors.orange.shade50,
                  border: Border.all(color: _message.contains('Creating') ? const Color(0xFF6C5CE7).withOpacity(0.3) : Colors.orange.shade200),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  _message,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: _message.contains('Creating') ? const Color(0xFF6C5CE7) : Colors.orange.shade800,
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
                  color: Color(0xFF6C5CE7),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Email Verification Screen
class EmailVerificationScreen extends StatelessWidget {
  final String email;

  const EmailVerificationScreen({
    super.key,
    required this.email,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Email Verification'),
        backgroundColor: const Color(0xFF6C5CE7),
        foregroundColor: Colors.white,
        centerTitle: true,
        automaticallyImplyLeading: false,
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFF6C5CE7),
              Color(0xFF9776EC),
            ],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 40),
                // Email Icon
                Container(
                  height: 120,
                  width: 120,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(60),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 10,
                        offset: const Offset(0, 5),
                      ),
                    ],
                  ),
                  child: const Icon(
                    Icons.mark_email_read,
                    size: 60,
                    color: Color(0xFF6C5CE7),
                  ),
                ),
                const SizedBox(height: 32),
                const Text(
                  'Verify Your Email',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.9),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    children: [
                      const Text(
                        'We\'ve sent a verification email to:',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        email,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF6C5CE7),
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Please check your inbox and click the verification link to activate your account.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.black54,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.orange.shade50,
                    border: Border.all(color: Colors.orange.shade200),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    children: [
                      Icon(
                        Icons.info_outline,
                        color: Colors.orange.shade700,
                        size: 32,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Important',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.orange.shade700,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'You can log in now, but some features may require email verification. Don\'t forget to check your spam folder!',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.black87,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 40),
                ElevatedButton(
                  onPressed: () {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (context) => const LoginScreen()),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF7ED321),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 3,
                  ),
                  child: const Text(
                    'Go to Login',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),
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
        selectedItemColor: const Color(0xFF6C5CE7),
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
          userId: widget.userId,
          firstName: widget.firstName,
          lastName: widget.lastName,
        );
      case 1:
        return PortfolioPage(userId: widget.userId);
      case 2:
        return TradePage(userId: widget.userId);
      case 3:
        return const NewsPage();
      case 4:
        return AccountScreen(
          firstName: widget.firstName,
          lastName: widget.lastName,
        );
      default:
        return HomeScreen(
          userId: widget.userId,
          firstName: widget.firstName,
          lastName: widget.lastName,
        );
    }
  }
}

// Home Screen
class HomeScreen extends StatefulWidget {
  final int userId;
  final String firstName;
  final String lastName;

  const HomeScreen({
    super.key,
    required this.userId,
    required this.firstName,
    required this.lastName,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  double _buyingPower = 0.0;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadBuyingPower();
  }

  Future<void> _loadBuyingPower() async {
    try {
      final result = await ApiService.getBuyingPower(widget.userId);
      if (mounted) {
        setState(() {
          _buyingPower = (result['buyingPower'] ?? 0.0).toDouble();
          _isLoading = false;
        });
      }
    } catch (e) {
      print('Error loading buying power: $e');
      if (mounted) {
        setState(() {
          _buyingPower = 0.0;
          _isLoading = false;
        });
      }
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
              onPressed: () async {
                final amount = double.tryParse(amountController.text);
                if (amount != null && amount > 0) {
                  Navigator.of(context).pop();
                  
                  // Show loading
                  if (!mounted) return;
                  showDialog(
                    context: context,
                    barrierDismissible: false,
                    builder: (context) => const Center(child: CircularProgressIndicator()),
                  );
                  
                  final result = await ApiService.addFunds(widget.userId, amount);
                  
                  // Always close loading dialog first, even if widget is unmounted
                  Navigator.of(context).pop(); // Close loading
                  
                  if (!mounted) return;
                  
                  if (result['success'] == true) {
                    setState(() {
                      _buyingPower = (result['newBalance'] ?? _buyingPower).toDouble();
                    });
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(result['message'] ?? 'Funds added successfully!'),
                        backgroundColor: Colors.green,
                      ),
                    );
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(result['error'] ?? 'Failed to add funds'),
                        backgroundColor: Colors.red,
                      ),
                    );
                  }
                }
              },
              child: const Text('Add Funds'),
            ),
          ],
        );
      },
    );
  }

  void _showDecreaseFundsDialog() {
    final TextEditingController amountController = TextEditingController();
    
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Decrease Buying Power'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Current Balance: \$${_buyingPower.toStringAsFixed(2)}'),
              const SizedBox(height: 15),
              TextField(
                controller: amountController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Amount to Decrease',
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
              onPressed: () async {
                final amount = double.tryParse(amountController.text);
                if (amount != null && amount > 0) {
                  if (amount > _buyingPower) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Cannot decrease more than current balance'),
                        backgroundColor: Colors.red,
                      ),
                    );
                    return;
                  }
                  
                  Navigator.of(context).pop();
                  
                  // Show loading
                  if (!mounted) return;
                  showDialog(
                    context: context,
                    barrierDismissible: false,
                    builder: (context) => const Center(child: CircularProgressIndicator()),
                  );
                  
                  final result = await ApiService.decreaseFunds(widget.userId, amount);
                  
                  // Always close loading dialog first, even if widget is unmounted
                  Navigator.of(context).pop(); // Close loading
                  
                  if (!mounted) return;
                  
                  if (result['success'] == true) {
                    setState(() {
                      _buyingPower = (result['newBalance'] ?? _buyingPower).toDouble();
                    });
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Successfully decreased buying power by \$${amount.toStringAsFixed(2)}'),
                        backgroundColor: Colors.green,
                      ),
                    );
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(result['error'] ?? 'Failed to decrease funds'),
                        backgroundColor: Colors.red,
                      ),
                    );
                  }
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
              child: const Text('Decrease', style: TextStyle(color: Colors.white)),
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
        title: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.asset(
                  'assets/simpli_trade_logo.png',
                  fit: BoxFit.contain,
                ),
              ),
            ),
            const SizedBox(width: 10),
            const Text('SimpliTrade'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Welcome Section with Logo
            Row(
              children: [
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: const Color(0xFF6C5CE7).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.asset(
                      'assets/simpli_trade_logo.png',
                      fit: BoxFit.contain,
                    ),
                  ),
                ),
                const SizedBox(width: 15),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Welcome back,',
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.grey[600],
                        ),
                      ),
                      Text(
                        '${widget.firstName} ${widget.lastName}',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF6C5CE7),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 25),
            
            // Buying Power Section
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF7ED321), Color(0xFF5CB815)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(15),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF7ED321).withOpacity(0.3),
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
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: _showAddFundsDialog,
                          icon: const Icon(Icons.add, color: Colors.green),
                          label: const Text(
                            'Increase',
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
                      const SizedBox(width: 10),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: _showDecreaseFundsDialog,
                          icon: const Icon(Icons.remove, color: Colors.red),
                          label: const Text(
                            'Decrease',
                            style: TextStyle(
                              color: Colors.red,
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
                ],
              ),
            ),
            const SizedBox(height: 30),
            
            // Portfolio Chart
            const PortfolioChart(),
            const SizedBox(height: 30),
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
        title: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.asset(
                  'assets/simpli_trade_logo.png',
                  fit: BoxFit.contain,
                ),
              ),
            ),
            const SizedBox(width: 10),
            const Text('Account'),
          ],
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            // Profile Section with SimpliTrade Branding
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(25),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF6C5CE7), Color(0xFF9776EC)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF6C5CE7).withOpacity(0.3),
                    blurRadius: 15,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                children: [
                  // SimpliTrade Logo instead of person icon
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 10,
                          offset: const Offset(0, 5),
                        ),
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(20),
                      child: Image.asset(
                        'assets/simpli_trade_logo.png',
                        fit: BoxFit.contain,
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    '$firstName $lastName',
                    style: const TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'SimpliTrade Member',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.white70,
                      fontWeight: FontWeight.w500,
                    ),
                  ),

                ],
              ),
            ),
            const SizedBox(height: 30),
            
            // Account Options
            _buildAccountOption(context, 'Trading History', Icons.history, false),
            _buildAccountOption(context, 'Log Out', Icons.logout, true),
          ],
        ),
      ),
    );
  }

  Widget _buildAccountOption(BuildContext context, String title, IconData icon, bool isLogout) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ListTile(
        leading: Icon(
          icon, 
          color: isLogout ? Colors.red : const Color(0xFF6C5CE7),
        ),
        title: Text(
          title,
          style: TextStyle(
            color: isLogout ? Colors.red : Colors.black87,
            fontWeight: isLogout ? FontWeight.w600 : FontWeight.w500,
          ),
        ),
        trailing: Icon(
          Icons.arrow_forward_ios, 
          size: 16,
          color: isLogout ? Colors.red : const Color(0xFF6C5CE7),
        ),
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
        backgroundColor: const Color(0xFF6C5CE7),
        foregroundColor: Colors.white,
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
  final int userId;
  
  const TradePage({super.key, required this.userId});

  @override
  State<TradePage> createState() => _TradePageState();
}

class _TradePageState extends State<TradePage> {
  double _buyingPower = 0.0;
  bool _isLoading = true;
  List<Stock> _availableStocks = [];
  Map<String, dynamic> _userHoldings = {};

  @override
  void initState() {
    super.initState();
    _initializeStocks();
    _loadData();
  }

  void _initializeStocks() {
    // Initialize the 8 stocks with placeholder data
    // Real prices will be loaded from Yahoo Finance API
    _availableStocks = [
      Stock(symbol: 'AAPL', name: 'Apple Inc.', price: 0, change: 0, changePercent: 0),
      Stock(symbol: 'AMZN', name: 'Amazon.com Inc.', price: 0, change: 0, changePercent: 0),
      Stock(symbol: 'NFLX', name: 'Netflix Inc.', price: 0, change: 0, changePercent: 0),
      Stock(symbol: 'NVDA', name: 'NVIDIA Corporation', price: 0, change: 0, changePercent: 0),
      Stock(symbol: 'GOOGL', name: 'Alphabet Inc.', price: 0, change: 0, changePercent: 0),
      Stock(symbol: 'MSFT', name: 'Microsoft Corporation', price: 0, change: 0, changePercent: 0),
      Stock(symbol: 'TSLA', name: 'Tesla Inc.', price: 0, change: 0, changePercent: 0),
      Stock(symbol: 'META', name: 'Meta Platforms Inc.', price: 0, change: 0, changePercent: 0),
    ];
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
    });
    
    try {
      // Load buying power
      final buyingPowerResult = await ApiService.getBuyingPower(widget.userId);
      
      // Load user's current holdings to check ownership
      final holdingsResult = await ApiService.searchTrades(widget.userId);
      
      // Create a map of holdings by symbol for quick lookup (just to show "Owned" indicator)
      Map<String, dynamic> holdingsMap = {};
      if (holdingsResult['results'] != null) {
        for (var holding in holdingsResult['results']) {
          holdingsMap[holding['symbol']] = holding;
        }
      }

      // Realistic static percentage changes for each stock
      final Map<String, double> staticChangePercents = {
        'AAPL': 1.25,    // Apple - modest positive
        'AMZN': -0.82,   // Amazon - slight negative
        'NFLX': 2.15,    // Netflix - strong positive
        'NVDA': -1.43,   // NVIDIA - moderate negative
        'GOOGL': 0.67,   // Google - slight positive
        'MSFT': 1.08,    // Microsoft - positive
        'TSLA': -2.34,   // Tesla - volatile negative
        'META': 1.89,    // Meta - solid positive
      };

      // Fetch real stock prices from Yahoo Finance API
      final symbols = _availableStocks.map((stock) => stock.symbol).toList();
      final pricesResult = await ApiService.getStockPrices(symbols);
      
      // Update stocks with real prices and static realistic percent changes
      if (pricesResult['prices'] != null) {
        final prices = pricesResult['prices'] as Map<String, dynamic>;
        
        for (int i = 0; i < _availableStocks.length; i++) {
          final stock = _availableStocks[i];
          final currentPrice = prices[stock.symbol];
          
          if (currentPrice != null) {
            final price = (currentPrice is int) ? currentPrice.toDouble() : currentPrice.toDouble();
            final changePercent = staticChangePercents[stock.symbol] ?? 0.0;
            final change = (price * changePercent) / 100;
            
            _availableStocks[i] = Stock(
              symbol: stock.symbol,
              name: stock.name,
              price: price,
              change: change,
              changePercent: changePercent,
            );
          }
        }
      }
      
      if (mounted) {
        setState(() {
          _buyingPower = (buyingPowerResult['buyingPower'] ?? 0.0).toDouble();
          _userHoldings = holdingsMap;
          _isLoading = false;
        });
      }
    } catch (e) {
      print('Error loading trade page: $e');
      if (mounted) {
        setState(() {
          _buyingPower = 0.0;
          _userHoldings = {};
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Trade Stocks'),
        backgroundColor: const Color(0xFF6C5CE7),
        foregroundColor: Colors.white,
        centerTitle: true,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadData,
              child: Column(
                children: [
                  // Buying Power Display
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          const Color(0xFF6C5CE7).withOpacity(0.1),
                          const Color(0xFF7ED321).withOpacity(0.1)
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                    ),
                    child: Column(
                      children: [
                        const Text(
                          'Available Cash',
                          style: TextStyle(fontSize: 16, color: Color(0xFF6C5CE7)),
                        ),
                        Text(
                          '\$${_buyingPower.toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF6C5CE7),
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Stock List
                  Expanded(
                    child: ListView.builder(
                      itemCount: _availableStocks.length,
                      itemBuilder: (context, index) {
                        final stock = _availableStocks[index];
                        final holding = _userHoldings[stock.symbol];
                        final isPositive = stock.change >= 0;
                        final color = isPositive ? Colors.green : Colors.red;

                        return Card(
                          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: const Color(0xFF6C5CE7).withOpacity(0.1),
                              child: Text(
                                stock.symbol.substring(0, 2),
                                style: const TextStyle(
                                  color: Color(0xFF6C5CE7),
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            title: Text(
                              stock.symbol,
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(stock.name),
                                if (holding != null)
                                  Text(
                                    'Owned: ${holding['quantity'].toStringAsFixed(2)} shares',
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: Color(0xFF7ED321),
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                              ],
                            ),
                            trailing: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  '\$${stock.price.toStringAsFixed(2)}',
                                  style: const TextStyle(
                                    fontSize: 16,
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
                                      '${isPositive ? '+' : ''}${stock.changePercent.toStringAsFixed(2)}%',
                                      style: TextStyle(color: color, fontSize: 12),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            onTap: () => _showTradeDialog(stock, holding),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  void _showTradeDialog(Stock stock, dynamic holding) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (BuildContext context) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
          ),
          child: Container(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  stock.symbol,
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                Text(
                  stock.name,
                  style: const TextStyle(fontSize: 16, color: Colors.grey),
                ),
                const SizedBox(height: 8),
                Text(
                  'Current Price: \$${stock.price.toStringAsFixed(2)}',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w500),
                ),
                if (holding != null) ...[
                  const SizedBox(height: 8),
                  Text(
                    'You own: ${holding['quantity'].toStringAsFixed(2)} shares (\$${holding['currentValue'].toStringAsFixed(2)})',
                    style: const TextStyle(fontSize: 14, color: Color(0xFF7ED321)),
                  ),
                ],
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.pop(context);
                          _showBuyDialog(stock);
                        },
                        icon: const Icon(Icons.add_shopping_cart),
                        label: const Text('Buy'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF7ED321),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: holding != null
                            ? () {
                                Navigator.pop(context);
                                _showSellDialog(stock, holding);
                              }
                            : null,
                        icon: const Icon(Icons.sell),
                        label: const Text('Sell'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          disabledBackgroundColor: Colors.grey,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showBuyDialog(Stock stock) {
    final TextEditingController quantityController = TextEditingController();

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Buy ${stock.symbol}'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Current Price: \$${stock.price.toStringAsFixed(2)}'),
              Text('Available Cash: \$${_buyingPower.toStringAsFixed(2)}'),
              const SizedBox(height: 16),
              TextField(
                controller: quantityController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: const InputDecoration(
                  labelText: 'Number of Shares',
                  border: OutlineInputBorder(),
                  helperText: 'Enter how many shares to buy',
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
                final quantity = int.tryParse(quantityController.text);
                if (quantity != null && quantity > 0) {
                  Navigator.of(context).pop();
                  await _executeBuy(stock, quantity);
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Please enter a valid quantity'),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF7ED321)),
              child: const Text('Buy', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }

  void _showSellDialog(Stock stock, dynamic holding) {
    final TextEditingController quantityController = TextEditingController();
    final maxShares = (holding['quantity'] as num).toDouble();

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Sell ${stock.symbol}'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Current Price: \$${stock.price.toStringAsFixed(2)}'),
              Text('Shares Owned: ${maxShares.toStringAsFixed(2)}'),
              Text('Total Value: \$${holding['currentValue'].toStringAsFixed(2)}'),
              const SizedBox(height: 16),
              TextField(
                controller: quantityController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: InputDecoration(
                  labelText: 'Number of Shares',
                  border: const OutlineInputBorder(),
                  helperText: 'Max: ${maxShares.toStringAsFixed(2)} shares',
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                _executeSellAll(stock, holding);
              },
              child: const Text('Sell All'),
            ),
            ElevatedButton(
              onPressed: () async {
                final quantity = int.tryParse(quantityController.text);
                if (quantity != null && quantity > 0 && quantity <= maxShares) {
                  Navigator.of(context).pop();
                  await _executeSell(stock, holding, quantity);
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Please enter a valid quantity (1-${maxShares.toStringAsFixed(0)})'),
                      backgroundColor: Colors.red,
                    ),
                  );
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

  Future<void> _executeBuy(Stock stock, int quantity) async {
    // Show loading
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );

    try {
      final result = await ApiService.buyStock(
        widget.userId,
        stock.symbol,
        stock.name,
        quantity,
      );

      // Always close loading dialog first, even if widget is unmounted
      Navigator.of(context).pop(); // Close loading
      
      if (!mounted) return;

      if (result['error'] == null || result['error'].toString().isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? 'Successfully bought $quantity shares of ${stock.symbol}'),
            backgroundColor: Colors.green,
          ),
        );
        await _loadData(); // Refresh data
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['error']),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      // Always close loading dialog first, even if widget is unmounted
      Navigator.of(context).pop(); // Close loading
      
      if (!mounted) return;
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _executeSell(Stock stock, dynamic holding, int quantity) async {
    // Show loading
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );

    try {
      final result = await ApiService.sellStock(
        widget.userId,
        holding['id'],
        quantity,
      );

      // Always close loading dialog first, even if widget is unmounted
      Navigator.of(context).pop(); // Close loading
      
      if (!mounted) return;

      if (result['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? 'Successfully sold $quantity shares of ${stock.symbol}'),
            backgroundColor: Colors.green,
          ),
        );
        await _loadData(); // Refresh data
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['error'] ?? 'Failed to sell stock'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      // Always close loading dialog first, even if widget is unmounted
      Navigator.of(context).pop(); // Close loading
      
      if (!mounted) return;
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _executeSellAll(Stock stock, dynamic holding) async {
    // Show loading
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );

    try {
      final result = await ApiService.sellAllStock(
        widget.userId,
        stock.symbol,
      );

      // Always close loading dialog first, even if widget is unmounted
      Navigator.of(context).pop(); // Close loading
      
      if (!mounted) return;

      if (result['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? 'Successfully sold all shares of ${stock.symbol}'),
            backgroundColor: Colors.green,
          ),
        );
        await _loadData(); // Refresh data
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['error'] ?? 'Failed to sell stock'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      // Always close loading dialog first, even if widget is unmounted
      Navigator.of(context).pop(); // Close loading
      
      if (!mounted) return;
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
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
        backgroundColor: const Color(0xFF6C5CE7),
        foregroundColor: Colors.white,
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
        backgroundColor: const Color(0xFF6C5CE7),
        foregroundColor: Colors.white,
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
            color: const Color(0xFF6C5CE7).withOpacity(0.1),
            borderRadius: BorderRadius.circular(25),
          ),
          child: Center(
            child: Text(
              stock.symbol.length >= 2 ? stock.symbol.substring(0, 2) : stock.symbol,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: Color(0xFF6C5CE7),
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
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF7ED321)),
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
        backgroundColor: const Color(0xFF6C5CE7),
        foregroundColor: Colors.white,
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
                      backgroundColor: const Color(0xFF7ED321),
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
  final int userId;
  
  const PortfolioPage({super.key, required this.userId});

  @override
  State<PortfolioPage> createState() => _PortfolioPageState();
}

class _PortfolioPageState extends State<PortfolioPage> {
  List<dynamic> _holdings = [];
  double _buyingPower = 0.0;
  double _totalPortfolioValue = 0.0;
  double _totalGain = 0.0;
  double _totalGainPercent = 0.0;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPortfolio();
  }

  Future<void> _loadPortfolio() async {
    setState(() {
      _isLoading = true;
    });
    
    try {
      final result = await ApiService.getPortfolioSummary(widget.userId);
      
      if (mounted) {
        if (result['error'] == null || result['error'].toString().isEmpty) {
          final portfolio = result['portfolio'];
          setState(() {
            _buyingPower = (portfolio?['buyingPower'] ?? 0.0).toDouble();
            _totalPortfolioValue = (portfolio?['totalPortfolioValue'] ?? 0.0).toDouble();
            _totalGain = (portfolio?['totalGain'] ?? 0.0).toDouble();
            _totalGainPercent = (portfolio?['totalGainPercent'] ?? 0.0).toDouble();
            _holdings = result['holdings'] ?? [];
            _isLoading = false;
          });
        } else {
          throw Exception(result['error']);
        }
      }
    } catch (e) {
      print('Error loading portfolio page: $e');
      if (mounted) {
        setState(() {
          _holdings = [];
          _buyingPower = 0.0;
          _totalPortfolioValue = 0.0;
          _totalGain = 0.0;
          _totalGainPercent = 0.0;
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error loading portfolio: $e'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Portfolio'),
        backgroundColor: const Color(0xFF6C5CE7),
        foregroundColor: Colors.white,
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
                                      '${_totalGain >= 0 ? '+' : ''}\$${_totalGain.toStringAsFixed(2)} (${_totalGainPercent >= 0 ? '+' : ''}${_totalGainPercent.toStringAsFixed(2)}%)',
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: _totalGain >= 0 ? Colors.green : Colors.red,
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
                                    color: Color(0xFF7ED321),
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
                    
                    if (_holdings.isEmpty)
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
                        itemCount: _holdings.length,
                        itemBuilder: (context, index) {
                          final holding = _holdings[index];
                          return _buildHoldingCard(holding);
                        },
                      ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildHoldingCard(dynamic holding) {
    final symbol = holding['symbol'] ?? '';
    final name = holding['name'] ?? '';
    final quantity = (holding['quantity'] ?? 0).toDouble();
    final currentPrice = (holding['currentPrice'] ?? 0).toDouble();
    final currentValue = (holding['currentValue'] ?? 0).toDouble();
    final gain = (holding['gain'] ?? 0).toDouble();
    final gainPercent = (holding['gainPercent'] ?? 0).toDouble();
    final purchasePrice = (holding['purchasePrice'] ?? 0).toDouble();
    
    final isPositive = gain >= 0;
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
                      symbol,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      name,
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
                      '\$${currentValue.toStringAsFixed(2)}',
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
                          '${isPositive ? '+' : ''}\$${gain.toStringAsFixed(2)} (${isPositive ? '+' : ''}${gainPercent.toStringAsFixed(2)}%)',
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
                  'Shares: ${quantity.toStringAsFixed(2)}',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                  ),
                ),
                Text(
                  'Avg Cost: \$${purchasePrice.toStringAsFixed(2)}',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                  ),
                ),
                Text(
                  'Current: \$${currentPrice.toStringAsFixed(2)}',
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
