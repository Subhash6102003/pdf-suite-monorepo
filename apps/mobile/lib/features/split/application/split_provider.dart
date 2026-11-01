import 'dart:io';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:pdf_suite/shared/pdf/pdf_processor.dart';

part 'split_provider.g.dart';

@riverpod
class SplitNotifier extends _$SplitNotifier {
  @override
  FutureOr<void> build() {
    return null;
  }

  Future<void> startSplit(File file, String mode, List<int> ranges) async {
    state = const AsyncLoading();
    try {
      final size = await file.length();
      if (size < 100000000) {
        final processor = ref.read(pdfProcessorProvider);
        final result = await processor.processSplit(file.path, ranges);
        state = AsyncData(result);
      } else {
        // Backend fallback
        state = const AsyncData(null);
      }
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
    }
  }
}
