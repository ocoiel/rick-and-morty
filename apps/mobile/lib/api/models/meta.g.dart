// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'meta.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Meta _$MetaFromJson(Map<String, dynamic> json) => Meta(
  total: (json['total'] as num).toInt(),
  source: Source.fromJson(json['source'] as String),
);

Map<String, dynamic> _$MetaToJson(Meta instance) => <String, dynamic>{
  'total': instance.total,
  'source': instance.source,
};
