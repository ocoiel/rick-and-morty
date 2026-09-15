import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/export.dart';
import '../../core/api.dart';
import '../../core/text.dart';
import '../../core/theme.dart';
import '../../core/tokens.dart';
import '../character/character_sheet.dart';
import 'character_card.dart';

/// Espelha episode/[id]/page.tsx e cast-explorer.tsx: cabeçalho do episódio,
/// filtro por nome e a grade do elenco.
class CastPage extends ConsumerStatefulWidget {
  const CastPage({required this.episodeNumber, super.key});

  final int episodeNumber;

  @override
  ConsumerState<CastPage> createState() => _CastPageState();
}

class _CastPageState extends ConsumerState<CastPage> {
  String _filter = '';

  List<Character> _visible(List<Character> characters) {
    final needle = foldForSearch(_filter.trim());
    if (needle.isEmpty) return characters;

    return characters
        .where((character) => foldForSearch(character.name).contains(needle))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    final cast = ref.watch(episodeCastProvider(widget.episodeNumber));

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.voidColor,
        title: Text('Episódio ${widget.episodeNumber}'),
      ),
      body: switch (cast) {
        AsyncData(:final value) => _Cast(
            cast: value,
            filter: _filter,
            visible: _visible(value.characters),
            onFilterChanged: (value) => setState(() => _filter = value),
          ),
        AsyncError(:final error) => _Failure(
            error: error,
            onRetry: () =>
                ref.invalidate(episodeCastProvider(widget.episodeNumber)),
          ),
        _ => const Center(child: CircularProgressIndicator()),
      },
    );
  }
}

class _Cast extends StatelessWidget {
  const _Cast({
    required this.cast,
    required this.filter,
    required this.visible,
    required this.onFilterChanged,
  });

  final EpisodeCast cast;
  final String filter;
  final List<Character> visible;
  final ValueChanged<String> onFilterChanged;

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    final columns = switch (width) {
      >= 1280 => 5,
      >= 1024 => 4,
      >= 640 => 3,
      _ => 2,
    };

    return CustomScrollView(
      slivers: [
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.lg,
            0,
            AppSpacing.lg,
            AppSpacing.lg,
          ),
          sliver: SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  cast.episode.code,
                  style: const TextStyle(
                    fontSize: 13,
                    letterSpacing: 2,
                    fontWeight: FontWeight.w500,
                    color: AppColors.portal,
                  ),
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  cast.episode.name,
                  style: const TextStyle(
                    fontSize: 28,
                    height: 1.15,
                    fontWeight: FontWeight.bold,
                    color: AppColors.ink,
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  'Exibido em ${cast.episode.airDate}',
                  style: const TextStyle(color: AppColors.inkMuted),
                ),
                const SizedBox(height: AppSpacing.xl),
                TextField(
                  onChanged: onFilterChanged,
                  style: const TextStyle(color: AppColors.ink),
                  decoration: InputDecoration(
                    hintText: 'Buscar por nome…',
                    prefixIcon: const Icon(Icons.search, color: AppColors.inkFaint),
                    enabledBorder: appInputBorder(AppSpacing.sm),
                    focusedBorder: appInputBorder(AppSpacing.sm, focused: true),
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                Text(
                  visible.length == cast.characters.length
                      ? '${cast.characters.length} ${cast.characters.length == 1 ? 'personagem' : 'personagens'}'
                      : '${visible.length} de ${cast.characters.length}',
                  style: const TextStyle(color: AppColors.inkMuted),
                ),
              ],
            ),
          ),
        ),
        if (visible.isEmpty)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.xxl),
              child: Center(
                child: Text(
                  'Nenhum personagem corresponde a “$filter”.',
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: AppColors.inkMuted),
                ),
              ),
            ),
          )
        else
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.lg,
              0,
              AppSpacing.lg,
              AppSpacing.xxl,
            ),
            sliver: SliverGrid.builder(
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: columns,
                mainAxisSpacing: AppSpacing.md,
                crossAxisSpacing: AppSpacing.md,
                childAspectRatio: 0.74,
              ),
              itemCount: visible.length,
              itemBuilder: (context, index) => CharacterCard(
                character: visible[index],
                onTap: () => CharacterSheet.show(context, visible[index]),
              ),
            ),
          ),
      ],
    );
  }
}

class _Failure extends StatelessWidget {
  const _Failure({required this.error, required this.onRetry});

  final Object error;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Não foi possível carregar o elenco.',
              style: TextStyle(fontSize: 16, color: AppColors.ink),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              '$error',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 12, color: AppColors.inkFaint),
            ),
            const SizedBox(height: AppSpacing.lg),
            FilledButton(onPressed: onRetry, child: const Text('Tentar de novo')),
          ],
        ),
      ),
    );
  }
}
