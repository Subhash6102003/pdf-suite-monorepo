import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class ToolGridTile extends StatefulWidget {
  final String title;
  final String description;
  final IconData icon;
  final String route;

  const ToolGridTile({
    super.key,
    required this.title,
    required this.description,
    required this.icon,
    required this.route,
  });

  @override
  State<ToolGridTile> createState() => _ToolGridTileState();
}

class _ToolGridTileState extends State<ToolGridTile> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => context.go(widget.route),
      onHover: (hovering) {
        setState(() => _isHovered = hovering);
      },
      child: AnimatedScale(
        scale: _isHovered ? 0.97 : 1.0,
        duration: const Duration(milliseconds: 200),
        child: Card(
          elevation: _isHovered ? 8 : 2,
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(colors: [Colors.indigo, Colors.violet]),
                    shape: BoxShape.circle,
                  ),
                  padding: const EdgeInsets.all(12),
                  child: Icon(widget.icon, color: Colors.white, size: 32),
                ),
                const SizedBox(height: 16),
                Text(widget.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text(widget.description, style: Theme.of(context).textTheme.bodySmall, textAlign: TextAlign.center),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
