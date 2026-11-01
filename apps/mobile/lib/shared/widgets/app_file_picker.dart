import 'dart:io';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:permission_handler/permission_handler.dart';

class AppFilePicker extends StatelessWidget {
  final Function(List<File>) onFilesSelected;
  final bool allowMultiple;

  const AppFilePicker({super.key, required this.onFilesSelected, this.allowMultiple = false});

  Future<void> _pickFiles(BuildContext context) async {
    if (await Permission.storage.request().isGranted || await Permission.photos.request().isGranted) {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        allowMultiple: allowMultiple,
        type: FileType.custom,
        allowedExtensions: ['pdf'],
      );

      if (result != null) {
        List<File> files = result.paths.map((path) => File(path!)).toList();
        onFilesSelected(files);
      }
    } else {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Storage permission is required.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => _pickFiles(context),
      child: Card(
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: Colors.grey, style: BorderStyle.solid),
          borderRadius: BorderRadius.circular(12),
        ),
        child: const Padding(
          padding: EdgeInsets.all(32.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.upload_file, size: 48, color: Colors.indigo),
              SizedBox(height: 16),
              Text('Tap to select PDF'),
            ],
          ),
        ),
      ),
    );
  }
}
