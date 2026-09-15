// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'episode_cast.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

EpisodeCast _$EpisodeCastFromJson(Map<String, dynamic> json) => EpisodeCast(
  episode: Episode.fromJson(json['episode'] as Map<String, dynamic>),
  characters: (json['characters'] as List<dynamic>)
      .map((e) => Character.fromJson(e as Map<String, dynamic>))
      .toList(),
  meta: Meta.fromJson(json['meta'] as Map<String, dynamic>),
);

Map<String, dynamic> _$EpisodeCastToJson(EpisodeCast instance) =>
    <String, dynamic>{
      'episode': instance.episode,
      'characters': instance.characters,
      'meta': instance.meta,
    };
