import 'dart:convert';

import 'package:http/http.dart' as http;

import '../api_host.dart';
import '../models/news_article.dart';

/// Simple repository for providing curated news articles.
/// For now it returns a static list but can later be swapped with a network/data source.
class NewsRepository {
  const NewsRepository();

  Future<List<NewsArticle>> fetchFeaturedArticles() async {
    // Try live API first
    final apiArticles = await _fetchFromApi();
    // Always include curated static as fallback/enrichment
    final staticArticles = _staticArticles();

    // Merge and dedupe by URL
    final seen = <String>{};
    final merged = <NewsArticle>[
      ...apiArticles,
      ...staticArticles,
    ].where((a) {
      if (a.url.isEmpty || seen.contains(a.url)) return false;
      seen.add(a.url);
      return true;
    }).toList();

    // Sort newest-first
    merged.sort((a, b) => b.publishedAt.compareTo(a.publishedAt));
    return merged;
  }

  Future<List<NewsArticle>> _fetchFromApi() async {
    final base = ApiHost.getBaseUrl();
    final uri = Uri.parse('$base/news');
    try {
      final r = await http.get(uri).timeout(const Duration(seconds: 10));
      if (r.statusCode != 200) {
        print('News API returned status code: ${r.statusCode}');
        return [];
      }
      final data = json.decode(r.body) as Map<String, dynamic>;
      
      // Check for API error
      if (data['error'] != null && data['error'].toString().isNotEmpty) {
        print('News API returned error: ${data['error']}');
        return [];
      }
      
      final list = (data['articles'] as List?) ?? const [];
      return list.map((e) => _fromServerJson(e as Map<String, dynamic>)).toList();
    } catch (e) {
      print('Error fetching news from API: $e');
      return [];
    }
  }

  NewsArticle _fromServerJson(Map<String, dynamic> json) {
    // The API now returns: title, url, summary, source, publishedAt
    // Map these to NewsArticle fields
    final title = json['title']?.toString() ?? '';
    final url = json['url']?.toString() ?? '';
    final summary = json['summary']?.toString() ?? json['description']?.toString() ?? '';
    final source = json['source']?.toString() ?? '';
    final publishedAtStr = json['publishedAt']?.toString() ?? '';
    
    final article = NewsArticle(
      id: url.isNotEmpty ? url : DateTime.now().millisecondsSinceEpoch.toString(),
      title: title,
      url: url,
      source: source,
      publishedAt: DateTime.tryParse(publishedAtStr) ?? DateTime.now(),
      summary: summary,
      tags: const [], // Will be inferred below
    );
    
    final inferred = _inferTags(article.title, article.summary);
    return NewsArticle(
      id: article.id,
      title: article.title,
      url: article.url,
      source: article.source,
      publishedAt: article.publishedAt,
      summary: article.summary,
      tags: inferred,
    );
  }

  List<String> _inferTags(String title, String summary) {
    final t = title.toLowerCase();
    final s = summary.toLowerCase();
    final tags = <String>[];
    if (t.contains('apple') || s.contains('apple')) tags.add('Apple');
    if (t.contains('tesla') || s.contains('tesla')) tags.add('Tesla');
    if (t.contains('amazon') || s.contains('amazon')) tags.add('Amazon');
    if (t.contains('nvidia') || s.contains('nvidia')) tags.add('Nvidia');
    if (t.contains('microsoft') || s.contains('microsoft')) tags.add('Microsoft');
    if (t.contains('google') || s.contains('google') || t.contains('alphabet') || s.contains('alphabet')) tags.add('Google');
    if (t.contains('meta') || s.contains('meta') || t.contains('facebook') || s.contains('facebook')) tags.add('Meta');
    return tags;
  }

  List<NewsArticle> _staticArticles() {
    const url = 'https://finance.yahoo.com/news/apple-could-make-133-billion-a-year-on-humanoid-robots-by-2040-morgan-stanley-194419260.html';
    final now = DateTime.now();
    return [
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
  }
}
