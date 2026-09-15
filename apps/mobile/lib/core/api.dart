import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/export.dart';

/// Em Chrome o BFF local responde em 3333. Num device físico, aponte para o IP
/// da máquina: flutter run --dart-define=API_BASE_URL=http://192.168.0.10:3333
const apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://localhost:3333',
);

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(
    BaseOptions(
      baseUrl: apiBaseUrl,
      connectTimeout: const Duration(seconds: 5),
      receiveTimeout: const Duration(seconds: 10),
    ),
  );

  ref.onDispose(dio.close);

  return dio;
});

final episodesClientProvider = Provider<EpisodesClient>(
  (ref) => EpisodesClient(ref.watch(dioProvider)),
);

final charactersClientProvider = Provider<CharactersClient>(
  (ref) => CharactersClient(ref.watch(dioProvider)),
);

final episodeListProvider = FutureProvider<EpisodeList>(
  (ref) => ref.watch(episodesClientProvider).listEpisodes(),
);

final episodeCastProvider = FutureProvider.family<EpisodeCast, int>(
  (ref, number) =>
      ref.watch(episodesClientProvider).getEpisodeCast(id: '$number'),
);

final characterAppearancesProvider =
    FutureProvider.family<CharacterAppearances, int>(
  (ref, characterId) => ref
      .watch(charactersClientProvider)
      .getCharacterAppearances(id: '$characterId'),
);
