import 'package:flutter/material.dart';

class StageIndicator extends StatefulWidget {
  final String currentStage;

  const StageIndicator({super.key, required this.currentStage});

  @override
  State<StageIndicator> createState() => _StageIndicatorState();
}

class _StageIndicatorState extends State<StageIndicator> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  final List<String> stages = ['Uploading', 'Validating', 'Processing', 'Optimizing', 'Verifying', 'Preparing'];

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(seconds: 1))..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    int currentIndex = stages.indexOf(widget.currentStage);
    if (currentIndex == -1) currentIndex = 0;

    return Column(
      children: stages.asMap().entries.map((entry) {
        int idx = entry.key;
        String stage = entry.value;

        bool isActive = idx == currentIndex;
        bool isComplete = idx < currentIndex;

        return ListTile(
          leading: isComplete
              ? const Icon(Icons.check_circle, color: Colors.green)
              : isActive
                  ? AnimatedBuilder(
                      animation: _controller,
                      builder: (context, child) {
                        return Transform.scale(
                          scale: 0.8 + (_controller.value * 0.4),
                          child: const Icon(Icons.circle, color: Colors.indigo),
                        );
                      },
                    )
                  : const Icon(Icons.circle, color: Colors.grey),
          title: Text(
            stage,
            style: TextStyle(
              fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
              color: isActive ? Colors.indigo : (isComplete ? Colors.green : Colors.grey),
            ),
          ),
        );
      }).toList(),
    );
  }
}
