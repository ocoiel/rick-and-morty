// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/episode_cast.dart';
import '../models/episode_list.dart';

part 'episodes_client.g.dart';

@RestApi()
abstract class EpisodesClient {
  factory EpisodesClient(Dio dio, {String? baseUrl}) = _EpisodesClient;

  /// Lista os números de episódio disponíveis.
  @GET('/api/episodes')
  Future<EpisodeList> listEpisodes();

  /// Elenco do episódio, em ordem alfabética.
  ///
  /// [id] - Identificador numérico do recurso.
  @GET('/api/episodes/{id}/cast')
  Future<EpisodeCast> getEpisodeCast({
    @Path('id') required String id,
  });
}
