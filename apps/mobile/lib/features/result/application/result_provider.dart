import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:pdf_suite/features/compress/domain/compress_job.dart';

part 'result_provider.g.dart';

@riverpod
class ResultNotifier extends _$ResultNotifier {
  @override
  FutureOr<CompressResult?> build(String jobId) async {
    // Return fetched result for the job ID
    return null;
  }
}
