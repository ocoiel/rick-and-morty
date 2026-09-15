import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/theme.dart';
import 'features/search/search_page.dart';

void main() {
  runApp(const ProviderScope(child: RickAndMortyApp()));
}

class RickAndMortyApp extends StatelessWidget {
  const RickAndMortyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Elenco por Episódio · Rick and Morty',
      debugShowCheckedModeBanner: false,
      theme: buildAppTheme(),
      home: const SearchPage(),
    );
  }
}
