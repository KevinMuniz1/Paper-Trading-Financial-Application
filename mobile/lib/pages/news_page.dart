import 'package:flutter/material.dart';
import '../models/news_article.dart';
import '../services/news_repository.dart';
import '../widgets/news_article_tile.dart';

class NewsPage extends StatefulWidget {
	const NewsPage({super.key});
	@override
	State<NewsPage> createState() => _NewsPageState();
}

class _NewsPageState extends State<NewsPage> {
	final _repo = const NewsRepository();
	List<NewsArticle> _articles = [];
	bool _loading = true;
	String? _error;

	@override
	void initState() {
		super.initState();
		_fetchNews();
	}

	Future<void> _fetchNews() async {
		setState(() { _loading = true; _error = null; });
		try {
			final items = await _repo.fetchFeaturedArticles();
			_articles = items; // Already sorted newest-first by repository
		} catch (e) {
			_error = e.toString();
		}
		if (mounted) setState(() { _loading = false; });
	}

	@override
	Widget build(BuildContext context) {
		return Scaffold(
			backgroundColor: const Color(0xFF2D1B69), // Dark purple background
			appBar: AppBar(
				title: const Text('News'),
				backgroundColor: const Color(0xFF6C5CE7),
				foregroundColor: Colors.white,
				centerTitle: true,
				actions: [
					IconButton(
						icon: const Icon(Icons.refresh),
						onPressed: _loading ? null : _fetchNews,
					)
				],
			),
			body: _buildBody(),
		);
	}

	Widget _buildBody() {
		if (_loading) return const Center(child: CircularProgressIndicator());
		if (_error != null) {
			return Center(
				child: Column(
					mainAxisSize: MainAxisSize.min,
					children: [
						const Text('Failed to load news', style: TextStyle(fontWeight: FontWeight.bold)),
						const SizedBox(height: 8),
						Text(_error!, textAlign: TextAlign.center, style: const TextStyle(color: Colors.red)),
						const SizedBox(height: 12),
						ElevatedButton(onPressed: _fetchNews, child: const Text('Retry'))
					],
				),
			);
		}
		if (_articles.isEmpty) return const Center(child: Text('No articles available'));

		return ListView.separated(
			padding: const EdgeInsets.all(12),
			itemCount: _articles.length,
			separatorBuilder: (_, __) => const SizedBox(height: 8),
			itemBuilder: (context, i) => NewsArticleTile(article: _articles[i]),
		);
	}
}
 
