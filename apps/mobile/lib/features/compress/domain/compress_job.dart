import 'package:freezed_annotation/freezed_annotation.dart';

part 'compress_job.freezed.dart';

@freezed
class CompressState with _$CompressState {
  const factory CompressState.idle() = _Idle;
  const factory CompressState.selecting() = _Selecting;
  const factory CompressState.processing(String stage) = _Processing;
  const factory CompressState.complete(CompressResult result) = _Complete;
  const factory CompressState.error(String message) = _Error;
  const factory CompressState.queuedOffline() = _QueuedOffline;
}

@freezed
class CompressResult with _$CompressResult {
  const factory CompressResult({
    required int inputSizeBytes,
    required int outputSizeBytes,
    required double savingsPct,
    required String outputPath,
    String? downloadToken,
  }) = _CompressResult;
}

enum CompressionLevel {
  recommended,
  balanced,
  maximum,
}
