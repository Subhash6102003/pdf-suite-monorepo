import 'dart:io';
import 'dart:typed_data';

class ProcessingException implements Exception {
  final String message;
  ProcessingException(this.message);
  @override
  String toString() => message;
}

class PdfVerifier {
  static void verifyPdfBytes(Uint8List bytes, int expectedPages) {
    if (bytes.length < 4) throw ProcessingException('INVALID_PDF');
    
    final header = String.fromCharCodes(bytes.sublist(0, 4));
    if (!header.startsWith('%PDF')) {
      throw ProcessingException('INVALID_PDF');
    }
    // Check page count...
  }

  static Future<int> getFileSizeExact(String path) async {
    return await File(path).length();
  }
}
