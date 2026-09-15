// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'episodes.g.dart';

@JsonSerializable()
class Episodes {
  const Episodes({
    required this.number,
    required this.code,
    required this.name,
  });
  
  factory Episodes.fromJson(Map<String, Object?> json) => _$EpisodesFromJson(json);
  
  final int number;
  final String code;
  final String name;

  Map<String, Object?> toJson() => _$EpisodesToJson(this);
}
