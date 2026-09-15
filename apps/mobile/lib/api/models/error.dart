// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'error.g.dart';

@JsonSerializable()
class Error {
  const Error({
    required this.code,
    required this.message,
  });
  
  factory Error.fromJson(Map<String, Object?> json) => _$ErrorFromJson(json);
  
  /// INVALID_EPISODE_NUMBER | EPISODE_NOT_FOUND | UPSTREAM_UNAVAILABLE | ROUTE_NOT_FOUND | INTERNAL_ERROR
  final String code;
  final String message;

  Map<String, Object?> toJson() => _$ErrorToJson(this);
}
