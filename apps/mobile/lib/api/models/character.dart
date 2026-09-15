// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'character_status.dart';

part 'character.g.dart';

@JsonSerializable()
class Character {
  const Character({
    required this.id,
    required this.name,
    required this.status,
    required this.species,
    required this.gender,
    required this.origin,
    required this.location,
    required this.imageUrl,
  });
  
  factory Character.fromJson(Map<String, Object?> json) => _$CharacterFromJson(json);
  
  final int id;
  final String name;
  final CharacterStatus status;
  final String species;
  final String gender;
  final String origin;
  final String location;
  final String imageUrl;

  Map<String, Object?> toJson() => _$CharacterToJson(this);
}
