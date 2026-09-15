import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:rick_and_morty/core/api.dart';
import 'package:rick_and_morty/features/cast/cast_page.dart';
import 'package:rick_and_morty/features/cast/character_card.dart';

import 'fixtures.dart';

Future<void> pumpCastPage(WidgetTester tester) async {
  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        episodeCastProvider.overrideWith((ref, number) async => makeEpisodeCast()),
      ],
      child: const MaterialApp(home: CastPage(episodeNumber: 1)),
    ),
  );
  await tester.pumpAndSettle();
}

void main() {
  setUpAll(() => GoogleFonts.config.allowRuntimeFetching = false);

  testWidgets('mostra o cabeçalho do episódio', (tester) async {
    await pumpCastPage(tester);

    expect(find.text('S01E01'), findsOneWidget);
    expect(find.text('Pilot'), findsOneWidget);
    expect(find.text('Exibido em December 2, 2013'), findsOneWidget);
  });

  testWidgets('lista o elenco inteiro e conta os personagens', (tester) async {
    await pumpCastPage(tester);

    expect(find.byType(CharacterCard), findsNWidgets(3));
    expect(find.text('3 personagens'), findsOneWidget);
  });

  testWidgets('filtra por nome ignorando acento', (tester) async {
    await pumpCastPage(tester);

    await tester.enterText(find.byType(TextField), 'abra');
    await tester.pumpAndSettle();

    expect(find.byType(CharacterCard), findsOneWidget);
    expect(find.text('Ábradolf Lincler'), findsOneWidget);
    expect(find.text('1 de 3'), findsOneWidget);
  });

  testWidgets('avisa quando o filtro não casa com ninguém', (tester) async {
    await pumpCastPage(tester);

    await tester.enterText(find.byType(TextField), 'zzz');
    await tester.pumpAndSettle();

    expect(find.byType(CharacterCard), findsNothing);
    expect(find.textContaining('Nenhum personagem corresponde'), findsOneWidget);
  });
}
