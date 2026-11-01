import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:share_plus/share_plus.dart';
import 'package:pdf_suite/shared/widgets/size_comparison_card.dart';
import 'package:pdf_suite/features/result/application/result_provider.dart';

class ResultScreen extends ConsumerWidget {
  final String jobId;

  const ResultScreen({super.key, required this.jobId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final resultAsync = ref.watch(resultNotifierProvider(jobId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Result'),
        leading: IconButton(
          icon: const Icon(Icons.home),
          onPressed: () => context.go('/'),
        ),
      ),
      body: resultAsync.when(
        data: (result) {
          if (result == null) return const Center(child: Text('Result not found'));
          return Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                const TweenAnimationBuilder<double>(
                  tween: Tween<double>(begin: 0, end: 1),
                  duration: Duration(milliseconds: 500),
                  builder: (context, value, child) {
                    return Transform.scale(
                      scale: value,
                      child: const Icon(Icons.check_circle, color: Colors.green, size: 64),
                    );
                  },
                ),
                const SizedBox(height: 16),
                const Text('Success!', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                const SizedBox(height: 24),
                SizeComparisonCard(
                  inputSizeBytes: result.inputSizeBytes.toDouble(),
                  outputSizeBytes: result.outputSizeBytes.toDouble(),
                  savingsPct: result.savingsPct,
                ),
                const Spacer(),
                ElevatedButton.icon(
                  onPressed: () {
                    Share.shareXFiles([XFile(result.outputPath)]);
                  },
                  icon: const Icon(Icons.share),
                  label: const Text('Share'),
                  style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 50)),
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: () => context.pop(),
                  child: const Text('Process another file'),
                )
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
    );
  }
}
