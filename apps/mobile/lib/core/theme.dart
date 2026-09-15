import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'tokens.dart';

/// Monta o tema a partir dos tokens compartilhados com a web.
/// As cores vivem em tokens.dart, que é gerado: alterá-las aqui as faria
/// divergir do Tailwind.
/// Borda do campo de texto. A web usa raios diferentes na busca e no filtro,
/// então o raio é parâmetro em vez de constante.
InputBorder appInputBorder(double radius, {bool focused = false}) {
  return OutlineInputBorder(
    borderRadius: BorderRadius.circular(radius),
    borderSide: BorderSide(
      color: focused ? AppColors.portal : AppColors.border,
    ),
  );
}

ThemeData buildAppTheme() {
  final base = ThemeData(brightness: Brightness.dark);

  return base.copyWith(
    scaffoldBackgroundColor: AppColors.voidColor,
    colorScheme: const ColorScheme.dark(
      primary: AppColors.portal,
      onPrimary: AppColors.voidColor,
      secondary: AppColors.cosmic,
      surface: AppColors.surface,
      onSurface: AppColors.ink,
      error: AppColors.plumbus,
      outline: AppColors.border,
    ),
    textTheme: GoogleFonts.spaceGroteskTextTheme(base.textTheme).apply(
      bodyColor: AppColors.ink,
      displayColor: AppColors.ink,
    ),
    dividerColor: AppColors.border,
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.surface,
      hintStyle: const TextStyle(color: AppColors.inkFaint),
      labelStyle: const TextStyle(color: AppColors.inkMuted),
      errorStyle: const TextStyle(color: AppColors.plumbus),
      enabledBorder: appInputBorder(AppSpacing.md),
      focusedBorder: appInputBorder(AppSpacing.md, focused: true),
    ),
  );
}

/// Espaçamentos em múltiplos de 4, como as utilitárias do Tailwind.
abstract final class AppSpacing {
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 24;
  static const double xxl = 40;
}
