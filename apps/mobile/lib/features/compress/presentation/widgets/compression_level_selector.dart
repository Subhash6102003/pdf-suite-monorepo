import 'package:flutter/material.dart';
import 'package:pdf_suite/features/compress/domain/compress_job.dart';

class CompressionLevelSelector extends StatelessWidget {
  final CompressionLevel selectedLevel;
  final Function(CompressionLevel) onSelectionChanged;

  const CompressionLevelSelector({
    super.key,
    required this.selectedLevel,
    required this.onSelectionChanged,
  });

  @override
  Widget build(BuildContext context) {
    return SegmentedButton<CompressionLevel>(
      segments: const [
        ButtonSegment<CompressionLevel>(
          value: CompressionLevel.recommended,
          label: Text('Recommended'),
        ),
        ButtonSegment<CompressionLevel>(
          value: CompressionLevel.balanced,
          label: Text('Balanced'),
        ),
        ButtonSegment<CompressionLevel>(
          value: CompressionLevel.maximum,
          label: Text('Maximum'),
        ),
      ],
      selected: <CompressionLevel>{selectedLevel},
      onSelectionChanged: (Set<CompressionLevel> newSelection) {
        onSelectionChanged(newSelection.first);
      },
    );
  }
}
