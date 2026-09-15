// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'episodes.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Episodes _$EpisodesFromJson(Map<String, dynamic> json) => Episodes(
  number: (json['number'] as num).toInt(),
  code: json['code'] as String,
  name: json['name'] as String,
);

Map<String, dynamic> _$EpisodesToJson(Episodes instance) => <String, dynamic>{
  'number': instance.number,
  'code': instance.code,
  'name': instance.name,
};
