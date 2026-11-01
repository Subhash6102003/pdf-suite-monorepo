import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'app.dart';
import 'core/storage/job_queue_db.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await JobQueueDb.init();

  await SentryFlutter.init(
    (options) {
      options.dsn = const String.fromEnvironment('SENTRY_DSN', defaultValue: '');
      options.tracesSampleRate = 1.0;
    },
    appRunner: () => runApp(const ProviderScope(child: PdfSuiteApp())),
  );
}
