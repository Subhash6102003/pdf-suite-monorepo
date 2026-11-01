import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pdf_suite/shared/widgets/app_file_picker.dart';
import 'package:pdf_suite/features/split/application/split_provider.dart';

class SplitScreen extends ConsumerStatefulWidget {
  const SplitScreen({super.key});

  @override
  ConsumerState<SplitScreen> createState() => _SplitScreenState();
}

class _SplitScreenState extends ConsumerState<SplitScreen> {
  File? _file;
  String _mode = 'All Pages';
  final _rangeController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Split PDF')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            AppFilePicker(onFilesSelected: (files) {
              if (files.isNotEmpty) setState(() => _file = files.first);
            }),
            if (_file != null) ...[
              const SizedBox(height: 16),
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(value: 'All Pages', label: Text('All Pages')),
                  ButtonSegment(value: 'Page Range', label: Text('Page Range')),
                ],
                selected: {_mode},
                onSelectionChanged: (set) => setState(() => _mode = set.first),
              ),
              if (_mode == 'Page Range') ...[
                const SizedBox(height: 16),
                TextField(
                  controller: _rangeController,
                  decoration: const InputDecoration(labelText: 'Range (e.g. 1-5)'),
                ),
              ],
              const Spacer(),
              ElevatedButton(
                onPressed: () {
                  ref.read(splitNotifierProvider.notifier).startSplit(_file!, _mode, []);
                },
                style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 50)),
                child: const Text('Split'),
              )
            ]
          ],
        ),
      ),
    );
  }
}
