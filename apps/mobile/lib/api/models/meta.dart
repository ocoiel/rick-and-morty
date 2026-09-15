// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'source.dart';

part 'meta.g.dart';

@JsonSerializable()
class Meta {
  const Meta({
    required this.total,
    required this.source,
  });
  
  factory Meta.fromJson(Map<String, Object?> json) => _$MetaFromJson(json);
  
  final int total;
  final Source source;

  Map<String, Object?> toJson() => _$MetaToJson(this);
}
