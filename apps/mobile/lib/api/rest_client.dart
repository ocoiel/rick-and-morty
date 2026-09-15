// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';

import 'clients/health_client.dart';
import 'clients/episodes_client.dart';
import 'clients/characters_client.dart';

/// Rick and Morty — elenco por episódio `v1.0.0`.
///
/// Contrato consumido pelo app Flutter e por qualquer outro cliente.
class RestClient {
  RestClient(
    Dio dio, {
    String? baseUrl,
  })  : _dio = dio,
        _baseUrl = baseUrl;

  final Dio _dio;
  final String? _baseUrl;

  static String get version => '1.0.0';

  HealthClient? _health;
  EpisodesClient? _episodes;
  CharactersClient? _characters;

  HealthClient get health => _health ??= HealthClient(_dio, baseUrl: _baseUrl);

  EpisodesClient get episodes => _episodes ??= EpisodesClient(_dio, baseUrl: _baseUrl);

  CharactersClient get characters => _characters ??= CharactersClient(_dio, baseUrl: _baseUrl);
}
