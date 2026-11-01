class ErrorTranslator {
  static String translate(String code) {
    switch (code) {
      case 'FILE_TOO_LARGE': return 'File is too large.';
      default: return 'An error occurred.';
    }
  }
}
