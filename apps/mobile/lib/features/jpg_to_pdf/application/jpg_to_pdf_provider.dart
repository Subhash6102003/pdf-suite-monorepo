import 'dart:io';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:pdf_suite/shared/pdf/pdf_processor.dart';

part 'jpg_to_pdf_provider.g.dart';

@riverpod
class JpgToPdfNotifier extends _$JpgToPdfNotifier {
  @override
  FutureOr<void> build() {
    return null;
  }

  Future<void> startConversion(List<File> images) async {
    state = const AsyncLoading();
    try {
      int totalSize = 0;
      for (final img in images) {
        totalSize += await img.length();
      }

      if (totalSize < 50000000) {
        final processor = ref.read(pdfProcessorProvider);
        final paths = images.map((img) => img.path).toList();
        final result = await processor.processJpgToPdf(paths);
        state = AsyncData(result);
      } else {
        // Backend
        state = const AsyncData(null);
      }
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
    }
  }
}
