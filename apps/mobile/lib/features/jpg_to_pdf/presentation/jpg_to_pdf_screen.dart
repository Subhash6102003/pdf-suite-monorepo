import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:pdf_suite/features/jpg_to_pdf/application/jpg_to_pdf_provider.dart';

class JpgToPdfScreen extends ConsumerStatefulWidget {
  const JpgToPdfScreen({super.key});

  @override
  ConsumerState<JpgToPdfScreen> createState() => _JpgToPdfScreenState();
}

class _JpgToPdfScreenState extends ConsumerState<JpgToPdfScreen> {
  final List<File> _images = [];
  final ImagePicker _picker = ImagePicker();

  Future<void> _pickImages() async {
    final picked = await _picker.pickMultiImage();
    setState(() {
      _images.addAll(picked.map((x) => File(x.path)));
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('JPG to PDF')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: ElevatedButton.icon(
              onPressed: _pickImages,
              icon: const Icon(Icons.add_photo_alternate),
              label: const Text('Add Images'),
            ),
          ),
          if (_images.isNotEmpty) ...[
            const Chip(
              label: Text('Processed on your device'),
              backgroundColor: Colors.green,
            ),
            Expanded(
              child: ReorderableListView(
                onReorder: (oldIndex, newIndex) {
                  setState(() {
                    if (oldIndex < newIndex) newIndex -= 1;
                    final item = _images.removeAt(oldIndex);
                    _images.insert(newIndex, item);
                  });
                },
                children: _images.map((f) => ListTile(
                  key: ValueKey(f.path),
                  leading: Image.file(f, width: 50, height: 50, fit: BoxFit.cover),
                  title: Text(f.path.split(Platform.pathSeparator).last),
                  trailing: const Icon(Icons.drag_handle),
                )).toList(),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: ElevatedButton(
                onPressed: () {
                  ref.read(jpgToPdfNotifierProvider.notifier).startConversion(_images);
                },
                style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 50)),
                child: const Text('Create PDF'),
              ),
            )
          ]
        ],
      ),
    );
  }
}
