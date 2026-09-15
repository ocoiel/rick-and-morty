import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/export.dart';
import '../../core/api.dart';
import '../../core/theme.dart';
import '../../core/tokens.dart';
import '../cast/status_badge.dart';

/// Espelha character-detail-sheet.tsx: ficha do personagem e em que outros
/// episódios ele aparece, buscados sob demanda.
class CharacterSheet extends ConsumerWidget {
  const CharacterSheet({required this.character, super.key});

  final Character character;

  static Future<void> show(BuildContext context, Character character) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      showDragHandle: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.card)),
      ),
      builder: (_) => CharacterSheet(character: character),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final appearances = ref.watch(characterAppearancesProvider(character.id));

    return SafeArea(
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.sizeOf(context).height * 0.85,
        ),
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.xl,
            0,
            AppSpacing.xl,
            AppSpacing.xl,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(AppRadius.card),
                    child: Image.network(
                      character.imageUrl,
                      width: 88,
                      height: 88,
                      fit: BoxFit.cover,
                      errorBuilder: (_, _, _) => const SizedBox(
                        width: 88,
                        height: 88,
                        child: ColoredBox(color: AppColors.surfaceRaised),
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.lg),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          character.name,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: AppColors.ink,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        StatusBadge(status: character.status),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.xl),
              _DetailRow(label: 'Espécie', value: character.species),
              _DetailRow(label: 'Gênero', value: character.gender),
              _DetailRow(label: 'Origem', value: character.origin),
              _DetailRow(label: 'Localização', value: character.location),
              const SizedBox(height: AppSpacing.xl),
              const Text(
                'APARECE EM',
                style: TextStyle(
                  fontSize: 12,
                  letterSpacing: 1.2,
                  color: AppColors.inkFaint,
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              switch (appearances) {
                AsyncData(:final value) => _Appearances(episodes: value.episodes),
                AsyncError() => const Text(
                    'Não foi possível carregar os episódios.',
                    style: TextStyle(color: AppColors.plumbus),
                  ),
                _ => const Padding(
                    padding: EdgeInsets.symmetric(vertical: AppSpacing.lg),
                    child: Center(child: CircularProgressIndicator()),
                  ),
              },
            ],
          ),
        ),
      ),
    );
  }
}

class _Appearances extends StatelessWidget {
  const _Appearances({required this.episodes});

  final List<Episodes> episodes;

  @override
  Widget build(BuildContext context) {
    if (episodes.isEmpty) {
      return const Text(
        'Nenhum episódio registrado.',
        style: TextStyle(color: AppColors.inkMuted),
      );
    }

    return Wrap(
      spacing: AppSpacing.sm,
      runSpacing: AppSpacing.sm,
      children: [
        for (final episode in episodes)
          Tooltip(
            message: episode.name,
            child: Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.sm,
              ),
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.border),
                borderRadius: BorderRadius.circular(AppSpacing.sm),
              ),
              child: Text(
                episode.code,
                style: const TextStyle(fontSize: 12, color: AppColors.inkMuted),
              ),
            ),
          ),
      ],
    );
  }
}

class _DetailRow extends StatelessWidget {
  const _DetailRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: const TextStyle(
              fontSize: 11,
              letterSpacing: 1.1,
              color: AppColors.inkFaint,
            ),
          ),
          const SizedBox(width: AppSpacing.lg),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: const TextStyle(fontSize: 14, color: AppColors.ink),
            ),
          ),
        ],
      ),
    );
  }
}
