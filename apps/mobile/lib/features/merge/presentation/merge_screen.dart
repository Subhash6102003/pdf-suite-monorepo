import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pdf_suite/shared/widgets/app_file_picker.dart';
import 'package:pdf_suite/features/merge/application/merge_provider.dart';

class MergeScreen extends ConsumerStatefulWidget {
  const MergeScreen({super.key});

  @override
  ConsumerState<MergeScreen> createState() => _MergeScreenState();
}

class _MergeScreenState extends ConsumerState<MergeScreen> {
  final List<File> _files = [];
  int _totalSize = 0;

  void _onFilesSelected(List<File> files) async {
    for (final f in files) {
      _totalSize += await f.length();
    }
    setState(() {
      _files.addAll(files);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Merge PDF')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: AppFilePicker(onFilesSelected: _onFilesSelected, allowMultiple: true),
          ),
          if (_files.isNotEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Text('Total Size: ${(_totalSize / 1000000).toStringAsFixed(1)} MB'),
            ),
          Expanded(
            child: ReorderableListView(
              onReorder: (oldIndex, newIndex) {
                setState(() {
                  if (oldIndex < newIndex) {
                    newIndex -= 1;
                  }
                  final item = _files.removeAt(oldIndex);
                  _files.insert(newIndex, item);
                });
              },
              children: _files.map((f) => ListTile(
                key: ValueKey(f.path),
                title: Text(f.path.split(Platform.pathSeparator).last),
                trailing: const Icon(Icons.drag_handle),
              )).toList(),
            ),
          ),
          if (_files.length > 1)
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: ElevatedButton(
                onPressed: () {
                  ref.read(mergeNotifierProvider.notifier).startMerge(_files);
                },
                style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 50)),
                child: const Text('Merge'),
              ),
            )
        ],
      ),
    );
  }
}
