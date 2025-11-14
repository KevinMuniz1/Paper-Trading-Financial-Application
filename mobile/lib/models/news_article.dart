import 'package:flutter/foundation.dart';

/// Domain model for a news article used by the mobile app UI.
@immutable
class NewsArticle {
  final String id;
  final String title;
  final String url;
  final String source;
  final DateTime publishedAt;
  final String summary;
  final List<String> tags; // e.g., ['Apple', 'Robotics']

  const NewsArticle({
    required this.id,
    required this.title,
    required this.url,
    required this.source,
    required this.publishedAt,
    this.summary = '',
    this.tags = const [],
  });

  bool get isApple => tags.map((t) => t.toLowerCase()).contains('apple') ||
      title.toLowerCase().contains('apple');

  bool get isTesla => tags.map((t) => t.toLowerCase()).contains('tesla') ||
    title.toLowerCase().contains('tesla');

  bool get isAmazon => tags.map((t) => t.toLowerCase()).contains('amazon') ||
    title.toLowerCase().contains('amazon');

  bool get isNvidia => tags.map((t) => t.toLowerCase()).contains('nvidia') ||
    title.toLowerCase().contains('nvidia');

  factory NewsArticle.fromJson(Map<String, dynamic> json) {
    return NewsArticle(
      id: json['id']?.toString() ?? json['url'] ?? UniqueKey().toString(),
      title: json['title'] ?? '',
      url: json['url'] ?? '',
      source: json['source'] ?? '',
      publishedAt: DateTime.tryParse(json['publishedAt'] ?? '') ?? DateTime.now(),
      summary: json['summary'] ?? '',
      tags: (json['tags'] as List?)?.map((e) => e.toString()).toList() ?? const [],
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'url': url,
        'source': source,
        'publishedAt': publishedAt.toIso8601String(),
        'summary': summary,
        'tags': tags,
      };
}
