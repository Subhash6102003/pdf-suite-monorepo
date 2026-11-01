import 'dart:io';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:pdf_suite/shared/pdf/pdf_processor.dart';

part 'merge_provider.g.dart';

@riverpod
class MergeNotifier extends _$MergeNotifier {
  @override
  FutureOr<void> build() {
    return null;
  }

  Future<void> startMerge(List<File> files) async {
    state = const AsyncLoading();
    try {
      int totalSize = 0;
      for (final f in files) {
        totalSize += await f.length();
      }

      if (totalSize < 100000000) {
        final processor = ref.read(pdfProcessorProvider);
        final paths = files.map((f) => f.path).toList();
        final result = await processor.processMerge(paths);
        state = AsyncData(result);
      } else {
        // Backend processing
        state = const AsyncData(null);
      }
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
    }
  }
}
