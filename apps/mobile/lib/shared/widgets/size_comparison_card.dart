import 'package:flutter/material.dart';

class SizeComparisonCard extends StatelessWidget {
  final double inputSizeBytes;
  final double outputSizeBytes;
  final double savingsPct;

  const SizeComparisonCard({
    super.key,
    required this.inputSizeBytes,
    required this.outputSizeBytes,
    required this.savingsPct,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TweenAnimationBuilder<double>(
              tween: Tween<double>(begin: 0, end: inputSizeBytes / 1000000),
              duration: const Duration(milliseconds: 500),
              builder: (context, value, child) {
                return Text('Before: ${value.toStringAsFixed(1)} MB');
              },
            ),
            const Icon(Icons.arrow_downward),
            TweenAnimationBuilder<double>(
              tween: Tween<double>(begin: 0, end: outputSizeBytes / 1000000),
              duration: const Duration(milliseconds: 500),
              builder: (context, value, child) {
                return Text('After: ${value.toStringAsFixed(1)} MB', style: const TextStyle(color: Colors.green));
              },
            ),
            Chip(
              label: Text('Saved ${savingsPct.toStringAsFixed(1)}%'),
              backgroundColor: Colors.green.withOpacity(0.1),
            ),
          ],
        ),
      ),
    );
  }
}
