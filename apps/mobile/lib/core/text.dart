/// Normaliza para busca insensível a acento e caixa, como lib/text.ts na web:
/// digitar "abradolf" precisa encontrar "Ábradolf".
String foldForSearch(String input) {
  const withAccents = 'áàâãäéèêëíìîïóòôõöúùûüçñ';
  const withoutAccents = 'aaaaaeeeeiiiiooooouuuucn';

  final lower = input.toLowerCase();
  final buffer = StringBuffer();

  for (final rune in lower.runes) {
    final char = String.fromCharCode(rune);
    final index = withAccents.indexOf(char);
    buffer.write(index == -1 ? char : withoutAccents[index]);
  }

  return buffer.toString();
}
