import 'dart:io';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:pdf_suite/features/compress/domain/compress_job.dart';
import 'package:pdf_suite/shared/pdf/pdf_processor.dart';
import 'package:pdf_suite/features/offline_queue/application/offline_queue_provider.dart';

part 'compress_provider.g.dart';

@riverpod
class CompressJobNotifier extends _$CompressJobNotifier {
  @override
  FutureOr<CompressState> build() {
    return const CompressState.idle();
  }

  Future<void> startCompression(File file, CompressionLevel level, {int? targetSizeBytes}) async {
    state = const AsyncData(CompressState.processing('Validating'));
    try {
      final inputSize = await file.length();
      
      if (inputSize < 40000000 && level == CompressionLevel.recommended) {
        state = const AsyncData(CompressState.processing('Optimizing'));
        // On-device processing via Isolate
        final processor = ref.read(pdfProcessorProvider);
        final result = await processor.processCompress(file.path, level);
        
        final savingsPct = ((inputSize - result.outputSizeBytes) / inputSize) * 100;
        state = AsyncData(CompressState.complete(CompressResult(
          inputSizeBytes: inputSize,
          outputSizeBytes: result.outputSizeBytes,
          savingsPct: savingsPct,
          outputPath: result.outputPath,
        )));
      } else {
        // Assume online/offline backend processing route handling
        final isOnline = true; // Replace with connectivity check
        if (!isOnline) {
          ref.read(offlineQueueNotifierProvider.notifier).enqueue('compress', file.path, {'level': level.name});
          state = const AsyncData(CompressState.queuedOffline());
          return;
        }
        
        state = const AsyncData(CompressState.processing('Uploading'));
        // Make API call using ApiClient here
        // ...
        
        // Mock API result
        state = AsyncData(CompressState.complete(CompressResult(
          inputSizeBytes: inputSize,
          outputSizeBytes: (inputSize * 0.5).toInt(),
          savingsPct: 50.0,
          outputPath: 'temp_path',
          downloadToken: 'token123',
        )));
      }
    } catch (e) {
      state = AsyncData(CompressState.error(e.toString()));
    }
  }
}
