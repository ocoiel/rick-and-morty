// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'episode_list.g.dart';

@JsonSerializable()
class EpisodeList {
  const EpisodeList({
    required this.episodes,
  });
  
  factory EpisodeList.fromJson(Map<String, Object?> json) => _$EpisodeListFromJson(json);
  
  final List<int> episodes;

  Map<String, Object?> toJson() => _$EpisodeListToJson(this);
}
