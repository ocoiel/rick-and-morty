import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:rick_and_morty/api/export.dart';
import 'package:rick_and_morty/core/api.dart';
import 'package:rick_and_morty/features/search/search_page.dart';

Future<void> pumpSearchPage(WidgetTester tester, {int total = 51}) async {
  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        episodeListProvider.overrideWith(
          (ref) async => EpisodeList(
            episodes: List.generate(total, (index) => index + 1),
          ),
        ),
      ],
      child: const MaterialApp(home: SearchPage()),
    ),
  );
  await tester.pumpAndSettle();
}

void main() {
  setUpAll(() => GoogleFonts.config.allowRuntimeFetching = false);

  testWidgets('mostra o intervalo válido vindo do BFF', (tester) async {
    await pumpSearchPage(tester, total: 51);

    expect(find.text('1 a 51'), findsOneWidget);
  });

  testWidgets('recusa episódio acima do total', (tester) async {
    await pumpSearchPage(tester, total: 51);

    await tester.enterText(find.byType(TextField), '999');
    await tester.testTextInput.receiveAction(TextInputAction.done);
    await tester.pump();

    expect(
      find.text('Informe um número de episódio entre 1 e 51.'),
      findsOneWidget,
    );
  });

  testWidgets('recusa entrada não numérica', (tester) async {
    await pumpSearchPage(tester);

    await tester.enterText(find.byType(TextField), 'abc');
    await tester.tap(find.text('Ver elenco'));
    await tester.pump();

    expect(find.textContaining('Informe um número'), findsOneWidget);
  });

  testWidgets('avisa quando o BFF está fora do ar', (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          episodeListProvider.overrideWith(
            (ref) async => throw Exception('conexão recusada'),
          ),
        ],
        child: const MaterialApp(home: SearchPage()),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.textContaining('BFF não respondeu'), findsOneWidget);
  });
}
