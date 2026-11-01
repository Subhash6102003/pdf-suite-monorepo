import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:pdf_suite/features/offline_queue/infrastructure/job_queue_repository.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

part 'offline_queue_provider.g.dart';

@riverpod
class OfflineQueueNotifier extends _$OfflineQueueNotifier {
  @override
  FutureOr<void> build() {
    Connectivity().onConnectivityChanged.listen((result) {
      if (result.contains(ConnectivityResult.mobile) || result.contains(ConnectivityResult.wifi)) {
        _submitPendingJobs();
      }
    });
    return null;
  }

  Future<void> enqueue(String toolName, String inputFilePath, Map<String, dynamic> params) async {
    final repo = ref.read(jobQueueRepositoryProvider);
    await repo.insertJob(toolName, inputFilePath, params);
  }

  Future<void> _submitPendingJobs() async {
    final repo = ref.read(jobQueueRepositoryProvider);
    final pending = await repo.getPendingJobs();
    for (final job in pending) {
      // API call to submit job
      await repo.updateStatus(job.id, 'COMPLETED');
    }
  }
}
