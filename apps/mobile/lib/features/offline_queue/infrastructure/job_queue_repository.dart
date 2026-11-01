import 'dart:convert';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:pdf_suite/core/storage/job_queue_db.dart';
import 'package:uuid/uuid.dart';

part 'job_queue_repository.g.dart';

class OfflineJob {
  final String id;
  final String toolName;
  final String inputFilePath;
  final Map<String, dynamic> params;
  final String status;
  final int createdAt;

  OfflineJob({
    required this.id,
    required this.toolName,
    required this.inputFilePath,
    required this.params,
    required this.status,
    required this.createdAt,
  });
}

@riverpod
JobQueueRepository jobQueueRepository(JobQueueRepositoryRef ref) => JobQueueRepository();

class JobQueueRepository {
  Future<void> insertJob(String toolName, String inputFilePath, Map<String, dynamic> params) async {
    final id = const Uuid().v4();
    await JobQueueDb.db.insert('offline_jobs', {
      'id': id,
      'tool_name': toolName,
      'input_file_path': inputFilePath,
      'params': jsonEncode(params),
      'status': 'QUEUED_OFFLINE',
      'created_at': DateTime.now().millisecondsSinceEpoch,
    });
  }

  Future<List<OfflineJob>> getPendingJobs() async {
    final res = await JobQueueDb.db.query('offline_jobs', where: 'status = ?', whereArgs: ['QUEUED_OFFLINE']);
    return res.map((e) => OfflineJob(
      id: e['id'] as String,
      toolName: e['tool_name'] as String,
      inputFilePath: e['input_file_path'] as String,
      params: jsonDecode(e['params'] as String),
      status: e['status'] as String,
      createdAt: e['created_at'] as int,
    )).toList();
  }

  Future<void> updateStatus(String id, String status) async {
    await JobQueueDb.db.update('offline_jobs', {'status': status}, where: 'id = ?', whereArgs: [id]);
  }

  Future<void> deleteJob(String id) async {
    await JobQueueDb.db.delete('offline_jobs', where: 'id = ?', whereArgs: [id]);
  }
}
