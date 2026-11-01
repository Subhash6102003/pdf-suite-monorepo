import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class JobQueueDb {
  static late Database db;

  static Future<void> init() async {
    String path = join(await getDatabasesPath(), 'job_queue.db');
    db = await openDatabase(
      path,
      version: 1,
      onCreate: (Database db, int version) async {
        await db.execute(
          'CREATE TABLE offline_jobs (id TEXT PRIMARY KEY, tool_name TEXT, input_file_path TEXT, params TEXT, status TEXT, created_at INTEGER)'
        );
      },
    );
  }
}
