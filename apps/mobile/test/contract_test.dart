import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

/// O cliente em lib/api é versionado, então pode envelhecer em silêncio se
/// alguém mexer numa rota do BFF e esquecer de rodar o codegen. Este teste é a
/// rede: compara o contrato publicado com o que foi de fato gerado.
void main() {
  test('o cliente gerado cobre todas as operações do contrato', () {
    final spec = jsonDecode(
      File('../bff/openapi.json').readAsStringSync(),
    ) as Map<String, dynamic>;

    final operationIds = [
      for (final methods in (spec['paths'] as Map<String, dynamic>).values)
        for (final operation in (methods as Map<String, dynamic>).values)
          (operation as Map<String, dynamic>)['operationId'] as String,
    ];

    final generated = Directory('lib/api/clients')
        .listSync()
        .whereType<File>()
        .map((file) => file.readAsStringSync())
        .join('\n');

    expect(operationIds, isNotEmpty);

    for (final operationId in operationIds) {
      expect(
        generated,
        contains('$operationId('),
        reason: 'Rode `pnpm --filter @zrp/mobile codegen` para atualizar o cliente.',
      );
    }
  });
}
