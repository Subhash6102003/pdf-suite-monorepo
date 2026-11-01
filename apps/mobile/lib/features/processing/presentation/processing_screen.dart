import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pdf_suite/shared/widgets/stage_indicator.dart';
import 'package:pdf_suite/features/processing/application/job_poller_provider.dart';

class ProcessingScreen extends ConsumerWidget {
  final String jobId;

  const ProcessingScreen({super.key, required this.jobId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stageStream = ref.watch(jobPollerNotifierProvider(jobId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Processing'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () {
            // Confirm cancel logic here
            context.pop();
          },
        ),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: stageStream.when(
            data: (stage) => StageIndicator(currentStage: stage),
            loading: () => const StageIndicator(currentStage: 'Uploading'),
            error: (err, stack) => Text('Error: $err'),
          ),
        ),
      ),
    );
  }
}
