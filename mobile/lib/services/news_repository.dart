import '../models/news_article.dart';

/// Simple repository for providing curated news articles.
/// For now it returns a static list but can later be swapped with a network/data source.
class NewsRepository {
  const NewsRepository();

  Future<List<NewsArticle>> fetchFeaturedArticles() async {
    // The user requested exactly two Apple articles in a compact layout.
    const url = 'https://finance.yahoo.com/news/apple-could-make-133-billion-a-year-on-humanoid-robots-by-2040-morgan-stanley-194419260.html';

  final now = DateTime.now();
    final articles = [
      // Apple articles
      NewsArticle(
        id: 'apple-robots-1',
        title: 'Apple could make \$133B/year on humanoid robots by 2040 - Morgan Stanley',
        url: url,
        source: 'Yahoo Finance',
        publishedAt: DateTime(2025, 11, 7),
        summary: 'Morgan Stanley projects a massive new future revenue stream for Apple from humanoid robotics by 2040.',
        tags: const ['Apple', 'Robotics', 'Forecast'],
      ),
      NewsArticle(
        id: 'apple-robots-2',
        title: 'Morgan Stanley: Apple\'s long-term bet on humanoid robots could reach \$133B revenue',
        url: url,
        source: 'Yahoo Finance',
        publishedAt: DateTime(now.year, now.month, now.day).subtract(const Duration(days: 1)),
        summary: 'Analysts see robots as a significant future category in Apple\'s ecosystem and services flywheel.',
        tags: const ['Apple', 'AI', 'Robotics'],
      ),
      // Tesla articles
      NewsArticle(
        id: 'tesla-board-comp',
        title: 'Here\'s what Elon Musk needs to do to earn his Tesla trillion',
        url: 'https://finance.yahoo.com/news/heres-what-elon-musk-needs-to-do-to-earn-his-tesla-trillion-164739829.html',
        source: 'Yahoo Finance',
        publishedAt: DateTime(2025, 11, 5, 16, 47),
        summary: 'Breakdown of performance milestones and strategic moves required for Musk to secure a massive Tesla compensation package.',
        tags: const ['Tesla', 'Elon Musk', 'Compensation'],
      ),
      NewsArticle(
        id: 'tesla-robot-rival',
        title: 'Tesla robot rival makes major statement',
        url: 'https://www.thestreet.com/technology/tesla-robot-rival-makes-major-statement',
        source: 'TheStreet',
        publishedAt: DateTime(2025, 11, 6, 9, 30),
        summary: 'Competitive robotics company issues bold progress update, signaling intensifying race with Tesla\'s Optimus ambitions.',
        tags: const ['Tesla', 'Robotics', 'Competition'],
      ),
      // Amazon articles
      NewsArticle(
        id: 'amazon-buy-hold-2025',
        title: 'Is Amazon a Buy, Sell, or Hold in 2025?',
        url: 'https://www.fool.com/investing/2025/11/07/is-amazon-a-buy-sell-or-hold-in-2025/',
        source: 'The Motley Fool',
        publishedAt: DateTime(2025, 11, 7, 8, 0),
        summary: 'A fresh look at Amazon’s valuation, growth drivers, and competitive positioning heading into 2026.',
        tags: const ['Amazon', 'Analysis'],
      ),
      NewsArticle(
        id: 'amazon-job-cuts',
        title: 'Amazon job cuts—but one division escapes',
        url: 'https://www.thestreet.com/crypto/jobs/amazon-job-cuts-but-one-division-escapes',
        source: 'TheStreet',
        publishedAt: DateTime(2025, 11, 6, 13, 15),
        summary: 'Staff reductions continue at Amazon while a strategic division remains untouched, signaling shifting priorities.',
        tags: const ['Amazon', 'Jobs', 'Strategy'],
      ),
      // Nvidia articles
      NewsArticle(
        id: 'nvidia-week-drop',
        title: 'Nvidia stock on track to end week down more than 10% amid investor concerns over AI valuations',
        url: 'https://finance.yahoo.com/news/nvidia-stock-on-track-to-end-week-down-more-than-10-amid-investor-concerns-over-ai-valuations-205754686.html',
        source: 'Yahoo Finance',
        publishedAt: DateTime(2025, 11, 7, 20, 57),
        summary: 'Share price pressure reflects growing scrutiny of AI-related multiples as investors reassess long-term growth assumptions.',
        tags: const ['Nvidia', 'AI', 'Valuation'],
      ),
      NewsArticle(
        id: 'nvidia-quantum-news',
        title: 'Nvidia just announced huge quantum computing news',
        url: 'https://www.fool.com/investing/2025/11/07/nvidia-just-announced-huge-quantum-computing-news/',
        source: 'The Motley Fool',
        publishedAt: DateTime(2025, 11, 7, 9, 5),
        summary: 'New quantum acceleration initiatives highlight Nvidia’s expanding platform strategy beyond classical GPUs.',
        tags: const ['Nvidia', 'Quantum Computing', 'Strategy'],
      ),
    ];

    // Ensure newest first
    articles.sort((a, b) => b.publishedAt.compareTo(a.publishedAt));
    return articles;
  }
}
