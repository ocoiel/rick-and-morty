import 'package:flutter/material.dart';

import '../../api/export.dart';
import '../../core/theme.dart';
import '../../core/tokens.dart';

/// Espelha status-badge.tsx: um ponto colorido e o rótulo em português.
class StatusBadge extends StatelessWidget {
  const StatusBadge({required this.status, super.key});

  final CharacterStatus status;

  static const _labels = {
    CharacterStatus.alive: ('Vivo', AppColors.portal),
    CharacterStatus.dead: ('Morto', AppColors.plumbus),
    CharacterStatus.unknown: ('Desconhecido', AppColors.inkFaint),
  };

  @override
  Widget build(BuildContext context) {
    final (label, color) = _labels[status] ?? _labels[CharacterStatus.unknown]!;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 6,
          height: 6,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: AppSpacing.xs + 2),
        Flexible(
          child: Text(
            label,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 12, color: AppColors.inkMuted),
          ),
        ),
      ],
    );
  }
}
