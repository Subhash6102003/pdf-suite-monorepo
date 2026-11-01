import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pdf_suite/shared/widgets/app_file_picker.dart';
import 'package:pdf_suite/shared/widgets/stage_indicator.dart';
import 'package:pdf_suite/features/compress/domain/compress_job.dart';
import 'package:pdf_suite/features/compress/application/compress_provider.dart';
import 'package:pdf_suite/features/compress/presentation/widgets/compression_level_selector.dart';

class CompressScreen extends ConsumerStatefulWidget {
  const CompressScreen({super.key});

  @override
  ConsumerState<CompressScreen> createState() => _CompressScreenState();
}

class _CompressScreenState extends ConsumerState<CompressScreen> {
  File? _selectedFile;
  int? _fileSize;
  CompressionLevel _level = CompressionLevel.recommended;
  final TextEditingController _targetSizeController = TextEditingController();

  void _onFilesSelected(List<File> files) async {
    if (files.isNotEmpty) {
      final file = files.first;
      final size = await file.length();
      setState(() {
        _selectedFile = file;
        _fileSize = size;
      });
    }
  }

  void _startCompression() {
    if (_selectedFile != null) {
      int? targetSize;
      if (_targetSizeController.text.isNotEmpty) {
        targetSize = (double.parse(_targetSizeController.text) * 1000000).toInt();
      }
      ref.read(compressJobNotifierProvider.notifier).startCompression(_selectedFile!, _level, targetSizeBytes: targetSize);
    }
  }

  @override
  Widget build(BuildContext context) {
    final compressState = ref.watch(compressJobNotifierProvider);

    // Navigation and side effects
    ref.listen<AsyncValue<CompressState>>(compressJobNotifierProvider, (previous, next) {
      next.whenData((state) {
        state.maybeWhen(
          complete: (result) {
            // Contextually would pop sheet and navigate to result. Simplified here.
            if (context.mounted) {
              context.go('/result/dummy_id');
            }
          },
          orElse: () {},
        );
      });
    });

    return Scaffold(
      appBar: AppBar(
        title: const Text('Compress PDF'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            AppFilePicker(onFilesSelected: _onFilesSelected),
            if (_selectedFile != null) ...[
              const SizedBox(height: 16),
              Text('Selected: ${_selectedFile!.path.split(Platform.pathSeparator).last}'),
              Text('Size: ${(_fileSize! / 1000000).toStringAsFixed(1)} MB', style: const TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              CompressionLevelSelector(
                selectedLevel: _level,
                onSelectionChanged: (level) => setState(() => _level = level),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _targetSizeController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Target Size (optional)',
                  suffixText: 'MB',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 24),
              compressState.when(
                data: (state) => state.maybeWhen(
                  processing: (stage) => StageIndicator(currentStage: stage),
                  queuedOffline: () => const Text('Queued for offline processing.', style: TextStyle(color: Colors.orange)),
                  error: (msg) => Text('Error: $msg', style: const TextStyle(color: Colors.red)),
                  orElse: () => ElevatedButton(
                    onPressed: _startCompression,
                    style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 50)),
                    child: const Text('Compress'),
                  ),
                ),
                loading: () => const CircularProgressIndicator(),
                error: (err, stack) => Text('Error: $err'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
