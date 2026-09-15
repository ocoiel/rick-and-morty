// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'episode.g.dart';

@JsonSerializable()
class Episode {
  const Episode({
    required this.number,
    required this.name,
    required this.code,
    required this.airDate,
  });
  
  factory Episode.fromJson(Map<String, Object?> json) => _$EpisodeFromJson(json);
  
  final int number;
  final String name;
  final String code;
  final String airDate;

  Map<String, Object?> toJson() => _$EpisodeToJson(this);
}
