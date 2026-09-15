// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'character.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Character _$CharacterFromJson(Map<String, dynamic> json) => Character(
  id: (json['id'] as num).toInt(),
  name: json['name'] as String,
  status: CharacterStatus.fromJson(json['status'] as String),
  species: json['species'] as String,
  gender: json['gender'] as String,
  origin: json['origin'] as String,
  location: json['location'] as String,
  imageUrl: json['imageUrl'] as String,
);

Map<String, dynamic> _$CharacterToJson(Character instance) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'status': instance.status,
  'species': instance.species,
  'gender': instance.gender,
  'origin': instance.origin,
  'location': instance.location,
  'imageUrl': instance.imageUrl,
};
