// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'episode.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Episode _$EpisodeFromJson(Map<String, dynamic> json) => Episode(
  number: (json['number'] as num).toInt(),
  name: json['name'] as String,
  code: json['code'] as String,
  airDate: json['airDate'] as String,
);

Map<String, dynamic> _$EpisodeToJson(Episode instance) => <String, dynamic>{
  'number': instance.number,
  'name': instance.name,
  'code': instance.code,
  'airDate': instance.airDate,
};
