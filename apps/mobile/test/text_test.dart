import 'package:flutter_test/flutter_test.dart';
import 'package:rick_and_morty/core/text.dart';

void main() {
  group('foldForSearch', () {
    test('ignora acento, como a busca da web', () {
      expect(foldForSearch('Ábradolf Lincler'), 'abradolf lincler');
    });

    test('ignora caixa', () {
      expect(foldForSearch('RICK Sanchez'), 'rick sanchez');
    });

    test('permite achar nome acentuado digitando sem acento', () {
      expect(foldForSearch('Ábradolf').contains(foldForSearch('abra')), isTrue);
    });

    test('preserva texto sem acento', () {
      expect(foldForSearch('Morty Smith'), 'morty smith');
    });
  });
}
