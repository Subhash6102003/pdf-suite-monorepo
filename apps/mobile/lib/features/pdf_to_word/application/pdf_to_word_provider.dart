import 'dart:io';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'pdf_to_word_provider.g.dart';

@riverpod
class PdfToWordNotifier extends _$PdfToWordNotifier {
  @override
  FutureOr<double> build() {
    return 0.0;
  }

  Future<void> startConversion(File file) async {
    state = const AsyncData(0.0);
    try {
      // ALWAYS backend
      // Upload progress logic goes here
      state = const AsyncData(1.0);
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
    }
  }
}
