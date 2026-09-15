// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'episode_list.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

EpisodeList _$EpisodeListFromJson(Map<String, dynamic> json) => EpisodeList(
  episodes: (json['episodes'] as List<dynamic>)
      .map((e) => (e as num).toInt())
      .toList(),
);

Map<String, dynamic> _$EpisodeListToJson(EpisodeList instance) =>
    <String, dynamic>{'episodes': instance.episodes};
