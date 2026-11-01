import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:pdf_suite/core/storage/job_queue_db.dart';

part 'home_provider.g.dart';

class RecentJob {
  final String id;
  final String toolName;
  final String status;
  final int inputSizeBytes;
  final int outputSizeBytes;
  final int createdAt;

  RecentJob({
    required this.id,
    required this.toolName,
    required this.status,
    required this.inputSizeBytes,
    required this.outputSizeBytes,
    required this.createdAt,
  });
}

@riverpod
class HomeNotifier extends _$HomeNotifier {
  @override
  FutureOr<List<RecentJob>> build() async {
    final res = await JobQueueDb.db.query('offline_jobs', orderBy: 'created_at DESC', limit: 5);
    return res.map((e) => RecentJob(
      id: e['id'] as String,
      toolName: e['tool_name'] as String,
      status: e['status'] as String,
      inputSizeBytes: 0, // In reality fetched from db or API
      outputSizeBytes: 0,
      createdAt: e['created_at'] as int,
    )).toList();
  }
}
