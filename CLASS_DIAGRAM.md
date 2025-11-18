# SimpliTrade - Paper Trading Financial Application
## Class Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MOBILE APPLICATION (Flutter)                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                              UI LAYER - SCREENS                               │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────────┐         ┌──────────────────────┐                  │
│  │   MyApp              │         │   LoginScreen        │                  │
│  ├──────────────────────┤         ├──────────────────────┤                  │
│  │ - theme: ThemeData   │◄────────│ - _usernameController│                  │
│  │ - home: Widget       │         │ - _passwordController│                  │
│  ├──────────────────────┤         │ - _message: String   │                  │
│  │ + build()            │         ├──────────────────────┤                  │
│  └──────────────────────┘         │ + _handleLogin()     │                  │
│           │                        │ + build()            │                  │
│           │                        └──────────────────────┘                  │
│           │                                  │                               │
│           ▼                                  │ authenticated                 │
│  ┌──────────────────────┐                   ▼                               │
│  │ RegisterScreen       │         ┌──────────────────────┐                  │
│  ├──────────────────────┤         │  MainAppScreen       │                  │
│  │ - _firstNameController│        ├──────────────────────┤                  │
│  │ - _lastNameController│         │ - userId: int        │                  │
│  │ - _emailController   │         │ - firstName: String  │                  │
│  │ - _usernameController│         │ - lastName: String   │                  │
│  │ - _passwordController│         │ - _currentIndex: int │                  │
│  ├──────────────────────┤         ├──────────────────────┤                  │
│  │ + _handleRegistration()│       │ + build()            │                  │
│  │ + build()            │         │ + _getPage()         │                  │
│  └──────────────────────┘         └──────────────────────┘                  │
│                                            │                                 │
│                          ┌─────────────────┼──────────────------------------------------------────┐                       │
│                          │                                    │                                   │                       │
│                          ▼                                    ▼                                   ▼                       │
│              ┌──────────────────────────────┐ ┌──────────────────────────────┐ ┌──────────────────────────────────┐ │
│              │      HomeScreen              │ │     PortfolioPage            │ │         TradePage                │ │
│              ├──────────────────────────────┤ ├──────────────────────────────┤ ├──────────────────────────────────┤ │
│              │ - firstName: String          │ │ - _portfolio: List           │ │ - _tabController                 │ │
│              │ - lastName: String           │ │ - _buyingPower: double       │ │ - _buyingPower: double           │ │
│              │ - _buyingPower: double       │ │ - _isLoading: bool           │ │ - _portfolio: List               │ │
│              ├──────────────────────────────┤ ├──────────────────────────────┤ │ - _popularStocks: List           │ │
│              │ + _loadBuyingPower()         │ │ + _loadPortfolio()           │ ├──────────────────────────────────┤ │
│              │ + _saveBuyingPower()         │ │ + _buildHoldingCard()        │ │ + _loadData()                    │ │
│              │ + _showAddFundsDialog()      │ │ + build()                    │ │ + _showQuickTradeDialog()        │ │
│              │ + _showDecreaseFundsDialog() │ └──────────────────────────────┘ │ + _showSwapDialog()              │ │
│              │ + build()                    │                                  │ + build()                        │ │
│              └──────────────────────────────┘                                  └──────────────────────────────────┘ │
│                                                                                                                   │
│              ┌──────────────────────────────┐ ┌──────────────────────────────┐ ┌──────────────────────────────┐ │
│              │    AccountScreen             │ │      StocksPage              │ │    StockDetailPage           │ │
│              ├──────────────────────────────┤ ├──────────────────────────────┤ ├──────────────────────────────┤ │
│              │ - firstName: String          │ │ - _stocks: List<Stock>       │ │ - stock: Stock               │ │
│              │ - lastName: String           │ │ - _isLoading: bool           │ ├──────────────────────────────┤ │
│              ├──────────────────────────────┤ ├──────────────────────────────┤ │ + _showBuyDialog()           │ │
│              │ + _buildAccountOption()      │ │ + _loadStocks()              │ │ + _showSellDialog()          │ │
│              │ + _showLogoutDialog()        │ │ + _buildStockCard()          │ │ + build()                    │ │
│              │ + build()                    │ │ + build()                    │ └──────────────────────────────┘ │
│              └──────────────────────────────┘ └──────────────────────────────┘                                  │
│                                                                             │
│              ┌──────────────────┐ ┌──────────────────┐                     │
│              │  NewsPage        │ │  NewsScreen      │                     │
│              ├──────────────────┤ ├──────────────────┤                     │
│              │ - _repo          │ │                  │                     │
│              │ - _articles[]    │ ├──────────────────┤                     │
│              │ - _loading       │ │ + build()        │                     │
│              │ - _error         │ └──────────────────┘                     │
│              ├──────────────────┤                                          │
│              │ + _fetchNews()   │                                          │
│              │ + _buildBody()   │                                          │
│              │ + build()        │                                          │
│              └──────────────────┘                                          │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                         DATA MODELS (Domain Layer)                           │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────────┐         ┌──────────────────────┐                  │
│  │   Stock              │         │  PortfolioHolding    │                  │
│  ├──────────────────────┤         ├──────────────────────┤                  │
│  │ - symbol: String     │◄────────│ - symbol: String     │                  │
│  │ - name: String       │  uses   │ - name: String       │                  │
│  │ - price: double      │         │ - shares: double     │                  │
│  │ - change: double     │         │ - averagePrice       │                  │
│  │ - changePercent      │         │ - currentPrice       │                  │
│  ├──────────────────────┤         ├──────────────────────┤                  │
│  │ (constructor)        │         │ + totalValue: double │                  │
│  └──────────────────────┘         │ + totalCost: double  │                  │
│                                   │ + gainLoss: double   │                  │
│                                   │ + gainLossPercent    │                  │
│  ┌──────────────────────┐         ├──────────────────────┤                  │
│  │ NewsArticle          │         │ + toJson()           │                  │
│  ├──────────────────────┤         │ + fromJson()         │                  │
│  │ - id: String         │         └──────────────────────┘                  │
│  │ - title: String      │                                                   │
│  │ - url: String        │         ┌──────────────────────┐                  │
│  │ - source: String     │         │ PortfolioValuePoint  │                  │
│  │ - publishedAt: DateTime│       ├──────────────────────┤                  │
│  │ - summary: String    │         │ - timestamp: DateTime│                  │
│  │ - tags: List<String> │         │ - totalValue: double │                  │
│  ├──────────────────────┤         │ - buyingPower: double│                  │
│  │ + isApple: bool      │         ├──────────────────────┤                  │
│  │ + isTesla: bool      │         │ + combinedValue      │                  │
│  │ + isAmazon: bool     │         │ + toJson()           │                  │
│  │ + isNvidia: bool     │         │ + fromJson()         │                  │
│  └──────────────────────┘         └──────────────────────┘                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                       BUSINESS LOGIC / MANAGERS                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────┐        │
│  │              PortfolioManager (Static Class)                     │        │
│  ├──────────────────────────────────────────────────────────────────┤        │
│  │ - _portfolioKey: String (const)                                  │        │
│  │ - _buyingPowerKey: String (const)                                │        │
│  │ - _portfolioHistoryKey: String (const)                           │        │
│  ├──────────────────────────────────────────────────────────────────┤        │
│  │ + getPortfolio(): Future<List<PortfolioHolding>>                 │        │
│  │ + savePortfolio(portfolio): Future<void>                         │        │
│  │ + getBuyingPower(): Future<double>                               │        │
│  │ + saveBuyingPower(amount): Future<void>                          │        │
│  │ + buyStock(stock, dollarAmount): Future<bool>                    │        │
│  │ + sellStock(stock, dollarAmount): Future<bool>                   │        │
│  │ + getPortfolioHistory(): Future<List<PortfolioValuePoint>>       │        │
│  │ + updatePortfolioCurrentPrices(stocks): Future<void>             │        │
│  │ - _recordPortfolioValue(): Future<void>                          │        │
│  │ - _savePortfolioHistory(history): Future<void>                   │        │
│  └──────────────────────────────────────────────────────────────────┘        │
│                                  │                                           │
│                                  │ uses                                      │
│                                  ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────┐        │
│  │              SharedPreferences (Flutter Plugin)                  │        │
│  ├──────────────────────────────────────────────────────────────────┤        │
│  │ + getString(key): String?                                        │        │
│  │ + setString(key, value): Future<bool>                            │        │
│  │ + getDouble(key): double?                                        │        │
│  │ + setDouble(key, value): Future<bool>                            │        │
│  │ + getStringList(key): List<String>?                              │        │
│  │ + setStringList(key, value): Future<bool>                        │        │
│  └──────────────────────────────────────────────────────────────────┘        │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────┐        │
│  │              NewsRepository                                      │        │
│  ├──────────────────────────────────────────────────────────────────┤        │
│  │ - _apiHost: String                                               │        │
│  ├──────────────────────────────────────────────────────────────────┤        │
│  │ + fetchFeaturedArticles(): Future<List<NewsArticle>>             │        │
│  │ - _staticArticles(): List<NewsArticle>                           │        │
│  │ - _generateTags(title, source): List<String>                     │        │
│  └──────────────────────────────────────────────────────────────────┘        │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKEND API (Node.js/Express)                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                          API ENDPOINTS (api.js)                               │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────┐        │
│  │                     API Routes                                    │        │
│  ├──────────────────────────────────────────────────────────────────┤        │
│  │ POST /api/login                                                   │        │
│  │   - incoming: {login, password}                                   │        │
│  │   - outgoing: {id, firstName, lastName, error}                    │        │
│  │                                                                    │        │
│  │ POST /api/register                                                │        │
│  │   - incoming: {firstName, lastName, email, login, password}       │        │
│  │   - outgoing: {id, error, message}                                │        │
│  │                                                                    │        │
│  │ POST /api/verify-email                                            │        │
│  │   - incoming: {token}                                             │        │
│  │   - outgoing: {success, error}                                    │        │
│  │                                                                    │        │
│  │ POST /api/request-password-reset                                  │        │
│  │   - incoming: {email}                                             │        │
│  │   - outgoing: {success, error, message}                           │        │
│  │                                                                    │        │
│  │ POST /api/reset-password                                          │        │
│  │   - incoming: {token, newPassword}                                │        │
│  │   - outgoing: {success, error}                                    │        │
│  │                                                                    │        │
│  │ GET /api/news                                                     │        │
│  │   - outgoing: {articles[], error}                                 │        │
│  └──────────────────────────────────────────────────────────────────┘        │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                              SERVICES LAYER                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────┐        │
│  │                    NewsService                                    │        │
│  ├──────────────────────────────────────────────────────────────────┤        │
│  │ - API_KEY: String                                                 │        │
│  │ - EVERYTHING_URL: String                                          │        │
│  │ - TOP_HEADLINES_URL: String                                       │        │
│  │ - MEMORY_TTL: int                                                 │        │
│  │ - DB_TTL: int                                                     │        │
│  │ - cached: Array                                                   │        │
│  │ - cachedAt: timestamp                                             │        │
│  │ - db: MongoDB Database                                            │        │
│  │ - KEYWORDS: Array<String>                                         │        │
│  │ - FINANCE_SOURCES: Array<String>                                 │        │
│  │ - FINANCE_DOMAINS: Array<String>                                 │        │
│  ├──────────────────────────────────────────────────────────────────┤        │
│  │ + setDb(db): void                                                 │        │
│  │ + getMarketNews(options): Promise<Array>                          │        │
│  │ - _memoryFresh(): boolean                                         │        │
│  │ - _fetchEverything(): Promise<Array>                              │        │
│  │ - _fetchHeadlinesFallback(): Promise<Array>                       │        │
│  │ - _isEnglishTitle(title): boolean                                 │        │
│  │ - _isFinanceSource(article): boolean                              │        │
│  │ - _domainFromUrl(url): String                                     │        │
│  └──────────────────────────────────────────────────────────────────┘        │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────┐        │
│  │                  TokenService                                     │        │
│  ├──────────────────────────────────────────────────────────────────┤        │
│  │ + generateEmailVerificationToken(userId, email): String           │        │
│  │ + verifyEmailToken(token): Object                                 │        │
│  │ + generatePasswordResetToken(userId, email): String               │        │
│  │ + verifyPasswordResetToken(token): Object                         │        │
│  └──────────────────────────────────────────────────────────────────┘        │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────┐        │
│  │                  EmailService                                     │        │
│  ├──────────────────────────────────────────────────────────────────┤        │
│  │ + sendVerificationEmail(email, token): Promise<Object>            │        │
│  │ + sendPasswordResetEmail(email, token): Promise<Object>           │        │
│  └──────────────────────────────────────────────────────────────────┘        │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                          DATABASE LAYER (MongoDB)                             │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────┐        │
│  │  Database: Finance-app                                            │        │
│  ├──────────────────────────────────────────────────────────────────┤        │
│  │                                                                    │        │
│  │  ┌────────────────────────────────────────────────────────┐       │        │
│  │  │  Collection: Users                                      │       │        │
│  │  ├────────────────────────────────────────────────────────┤       │        │
│  │  │ - UserID: int (primary key)                            │       │        │
│  │  │ - FirstName: String                                    │       │        │
│  │  │ - LastName: String                                     │       │        │
│  │  │ - Email: String (unique)                               │       │        │
│  │  │ - Login: String (unique)                               │       │        │
│  │  │ - Password: String                                     │       │        │
│  │  │ - isEmailVerified: boolean                             │       │        │
│  │  │ - emailVerificationToken: String                       │       │        │
│  │  │ - verificationTokenExpires: Date                       │       │        │
│  │  │ - passwordResetToken: String                           │       │        │
│  │  │ - passwordResetExpires: Date                           │       │        │
│  │  │ - createdAt: Date                                      │       │        │
│  │  └────────────────────────────────────────────────────────┘       │        │
│  │                                                                    │        │
│  │  ┌────────────────────────────────────────────────────────┐       │        │
│  │  │  Collection: NewsCache                                  │       │        │
│  │  ├────────────────────────────────────────────────────────┤       │        │
│  │  │ - _id: ObjectId                                        │       │        │
│  │  │ - articles: Array<Object>                              │       │        │
│  │  │ - fetchedAt: Date                                      │       │        │
│  │  └────────────────────────────────────────────────────────┘       │        │
│  └──────────────────────────────────────────────────────────────────┘        │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                       UTILITY/HELPER CLASSES                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────┐        │
│  │                    ApiHost (Platform Helper)                      │        │
│  ├──────────────────────────────────────────────────────────────────┤        │
│  │ + getBaseUrl(port): String                                        │        │
│  │   - Returns platform-specific API URL                             │        │
│  │   - Web: uses current host                                        │        │
│  │   - Mobile/Desktop: uses 10.0.2.2 for Android emulator            │        │
│  └──────────────────────────────────────────────────────────────────┘        │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────┐        │
│  │                  PortfolioChart (Custom Widget)                   │        │
│  ├──────────────────────────────────────────────────────────────────┤        │
│  │ - _history: List<PortfolioValuePoint>                            │        │
│  │ - _isLoading: bool                                                │        │
│  ├──────────────────────────────────────────────────────────────────┤        │
│  │ + initState(): void                                               │        │
│  │ + _loadHistory(): Future<void>                                    │        │
│  │ + build(): Widget                                                 │        │
│  └──────────────────────────────────────────────────────────────────┘        │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────┐        │
│  │              ChartPainter (Custom Painter)                        │        │
│  ├──────────────────────────────────────────────────────────────────┤        │
│  │ - history: List<PortfolioValuePoint>                             │        │
│  │ - isPositive: bool                                                │        │
│  ├──────────────────────────────────────────────────────────────────┤        │
│  │ + paint(canvas, size): void                                       │        │
│  │ + shouldRepaint(oldDelegate): bool                                │        │
│  └──────────────────────────────────────────────────────────────────┘        │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────┐        │
│  │              GridPainter (Custom Painter)                         │        │
│  ├──────────────────────────────────────────────────────────────────┤        │
│  │ + paint(canvas, size): void                                       │        │
│  │ + shouldRepaint(oldDelegate): bool                                │        │
│  └──────────────────────────────────────────────────────────────────┘        │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────┐        │
│  │           SimpleChartPainter (Custom Painter)                     │        │
│  ├──────────────────────────────────────────────────────────────────┤        │
│  │ - isPositive: bool                                                │        │
│  ├──────────────────────────────────────────────────────────────────┤        │
│  │ + paint(canvas, size): void                                       │        │
│  │ + shouldRepaint(oldDelegate): bool                                │        │
│  └──────────────────────────────────────────────────────────────────┘        │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL DEPENDENCIES                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  • Flutter Framework                                                          │
│  • http package (API calls)                                                   │
│  • shared_preferences (local storage)                                        │
│  • Express.js (backend server)                                               │
│  • MongoDB (database)                                                         │
│  • Resend API (email service)                                                │
│  • News API (financial news)                                                 │
│  • JWT (authentication tokens)                                               │
│  • dotenv (environment configuration)                                        │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW DIAGRAM                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  User Input (Mobile UI)                                                      │
│         │                                                                     │
│         ▼                                                                     │
│  Screen Components (Login, Home, Portfolio, Trade, Account)                  │
│         │                                                                     │
│         ├─────────► PortfolioManager ◄────► SharedPreferences (Local)       │
│         │                  │                                                 │
│         │                  └─────────► Stock/Portfolio Models                │
│         │                                                                     │
│         ├─────────► http.post() ────────┐                                    │
│         │                                │                                    │
│         └─────────► NewsRepository       │                                    │
│                           │              │                                    │
│                           │              ▼                                    │
│                           │     Backend API (Express.js)                      │
│                           │              │                                    │
│                           │              ├────► TokenService                  │
│                           │              │                                    │
│                           │              ├────► EmailService (Resend)         │
│                           │              │                                    │
│                           │              └────► NewsService                   │
│                           │                     │                             │
│                           │                     ├───► News API                │
│                           │                     │                             │
│                           │                     └───► MongoDB (NewsCache)     │
│                           │                                                   │
│                           └─────► Static News Data                            │
│                                                                               │
│                           MongoDB (Users Collection)                          │
│                                  ▲                                            │
│                                  │                                            │
│                          Backend API Queries                                  │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                         KEY RELATIONSHIPS                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  1. User authenticates via LoginScreen                                       │
│     └─► API /login validates credentials in MongoDB                          │
│         └─► Returns userId, firstName, lastName                              │
│             └─► MainAppScreen displays with user context                     │
│                                                                               │
│  2. User manages portfolio via TradePage/HomeScreen                          │
│     └─► PortfolioManager handles buy/sell operations                         │
│         └─► Stores data locally in SharedPreferences                         │
│             └─► Updates PortfolioHolding and Stock models                    │
│                                                                               │
│  3. User views news via NewsPage                                             │
│     └─► NewsRepository fetches articles                                      │
│         └─► Backend NewsService queries News API                             │
│             └─► Caches results in MongoDB                                    │
│                 └─► Returns NewsArticle models                               │
│                                                                               │
│  4. User registers account                                                   │
│     └─► RegisterScreen sends data to /register                               │
│         └─► Backend creates User in MongoDB                                  │
│             └─► TokenService generates verification token                    │
│                 └─► EmailService sends verification email                    │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Summary

This class diagram represents the **SimpliTrade Paper Trading Financial Application** with:

### **Mobile Application (Flutter)**
- **11 UI Screens**: MyApp, LoginScreen, RegisterScreen, MainAppScreen, HomeScreen, PortfolioPage, TradePage, AccountScreen, StocksPage, StockDetailPage, NewsPage
- **4 Data Models**: Stock, PortfolioHolding, NewsArticle, PortfolioValuePoint
- **2 Managers/Services**: PortfolioManager, NewsRepository
- **4 Custom Painters**: PortfolioChart, ChartPainter, GridPainter, SimpleChartPainter

### **Backend API (Node.js/Express)**
- **6 API Endpoints**: login, register, verify-email, request-password-reset, reset-password, news
- **3 Services**: NewsService, TokenService, EmailService
- **2 MongoDB Collections**: Users, NewsCache

### **Key Features**
- User authentication with email verification
- Paper trading with buy/sell functionality
- Portfolio tracking with historical performance
- Real-time financial news aggregation
- Local data persistence using SharedPreferences
- Responsive UI with custom charts and visualizations
