import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api.dart';
import '../../core/theme.dart';
import '../../core/tokens.dart';
import '../cast/cast_page.dart';

/// Espelha app/page.tsx: pede o número do episódio e valida contra o total
/// que o BFF conhece, antes de navegar.
class SearchPage extends ConsumerStatefulWidget {
  const SearchPage({super.key});

  @override
  ConsumerState<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends ConsumerState<SearchPage> {
  final _controller = TextEditingController();
  String? _error;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _submit(int total) {
    final parsed = int.tryParse(_controller.text.trim());

    if (parsed == null || parsed < 1 || parsed > total) {
      setState(() => _error = 'Informe um número de episódio entre 1 e $total.');
      return;
    }

    setState(() => _error = null);

    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => CastPage(episodeNumber: parsed),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final episodes = ref.watch(episodeListProvider);

    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.xl),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'RICK AND MORTY',
                  style: TextStyle(
                    fontSize: 13,
                    letterSpacing: 3,
                    fontWeight: FontWeight.w500,
                    color: AppColors.portal,
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                const Text(
                  'Quem aparece em cada episódio',
                  style: TextStyle(
                    fontSize: 34,
                    height: 1.1,
                    fontWeight: FontWeight.bold,
                    color: AppColors.ink,
                  ),
                ),
                const SizedBox(height: AppSpacing.lg),
                const Text(
                  'Digite o número de um episódio e veja todo o elenco em ordem alfabética.',
                  style: TextStyle(
                    fontSize: 16,
                    height: 1.5,
                    color: AppColors.inkMuted,
                  ),
                ),
                const SizedBox(height: AppSpacing.xxl),
                switch (episodes) {
                  AsyncData(:final value) => _Form(
                      controller: _controller,
                      total: value.episodes.length,
                      error: _error,
                      onSubmit: () => _submit(value.episodes.length),
                    ),
                  AsyncError() => _Unavailable(
                      onRetry: () => ref.invalidate(episodeListProvider),
                    ),
                  _ => const Center(child: CircularProgressIndicator()),
                },
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _Form extends StatelessWidget {
  const _Form({
    required this.controller,
    required this.total,
    required this.error,
    required this.onSubmit,
  });

  final TextEditingController controller;
  final int total;
  final String? error;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          autofocus: true,
          onSubmitted: (_) => onSubmit(),
          style: const TextStyle(fontSize: 18, color: AppColors.ink),
          decoration: InputDecoration(
            labelText: 'Número do episódio',
            hintText: '1 a $total',
            errorText: error,
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        SizedBox(
          width: double.infinity,
          child: FilledButton(
            onPressed: onSubmit,
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.portal,
              foregroundColor: AppColors.voidColor,
              padding: const EdgeInsets.symmetric(vertical: AppSpacing.lg),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppSpacing.md),
              ),
            ),
            child: const Text(
              'Ver elenco',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
          ),
        ),
      ],
    );
  }
}

class _Unavailable extends StatelessWidget {
  const _Unavailable({required this.onRetry});

  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'O BFF não respondeu. Ele está rodando em $apiBaseUrl?',
          style: TextStyle(color: AppColors.plumbus),
        ),
        const SizedBox(height: AppSpacing.md),
        OutlinedButton(onPressed: onRetry, child: const Text('Tentar de novo')),
      ],
    );
  }
}
