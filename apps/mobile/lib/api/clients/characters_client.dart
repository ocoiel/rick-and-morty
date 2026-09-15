// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/character_appearances.dart';

part 'characters_client.g.dart';

@RestApi()
abstract class CharactersClient {
  factory CharactersClient(Dio dio, {String? baseUrl}) = _CharactersClient;

  /// Episódios em que o personagem aparece.
  ///
  /// [id] - Identificador numérico do recurso.
  @GET('/api/characters/{id}/episodes')
  Future<CharacterAppearances> getCharacterAppearances({
    @Path('id') required String id,
  });
}
