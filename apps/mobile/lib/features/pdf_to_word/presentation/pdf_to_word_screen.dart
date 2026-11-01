import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pdf_suite/shared/widgets/app_file_picker.dart';
import 'package:pdf_suite/features/pdf_to_word/application/pdf_to_word_provider.dart';

class PdfToWordScreen extends ConsumerStatefulWidget {
  const PdfToWordScreen({super.key});

  @override
  ConsumerState<PdfToWordScreen> createState() => _PdfToWordScreenState();
}

class _PdfToWordScreenState extends ConsumerState<PdfToWordScreen> {
  File? _file;

  @override
  Widget build(BuildContext context) {
    final progress = ref.watch(pdfToWordNotifierProvider).valueOrNull ?? 0.0;

    return Scaffold(
      appBar: AppBar(title: const Text('PDF to Word')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            if (_file == null)
              AppFilePicker(onFilesSelected: (files) {
                if (files.isNotEmpty) {
                  setState(() => _file = files.first);
                  ref.read(pdfToWordNotifierProvider.notifier).startConversion(files.first);
                }
              }),
            if (_file != null) ...[
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Text('Your file will be securely uploaded for conversion (deleted within 1 hour).'),
                ),
              ),
              const SizedBox(height: 16),
              LinearProgressIndicator(value: progress),
              const SizedBox(height: 8),
              Text('${(progress * 100).toStringAsFixed(0)}%'),
            ]
          ],
        ),
      ),
    );
  }
}
