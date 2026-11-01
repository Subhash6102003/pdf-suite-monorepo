import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:pdf_suite/features/home/application/home_provider.dart';

class RecentJobsSection extends StatelessWidget {
  final List<RecentJob> jobs;

  const RecentJobsSection({super.key, required this.jobs});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.all(16.0),
          child: Text('Recent', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        ),
        SizedBox(
          height: 120,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: jobs.length,
            itemBuilder: (context, index) {
              final job = jobs[index];
              return InkWell(
                onTap: () {
                  if (job.status == 'COMPLETED') {
                    context.go('/result/${job.id}');
                  }
                },
                child: Card(
                  margin: const EdgeInsets.only(left: 16.0, bottom: 16.0),
                  child: Padding(
                    padding: const EdgeInsets.all(12.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(job.toolName, style: const TextStyle(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Chip(
                          label: Text(job.status, style: const TextStyle(fontSize: 10)),
                          backgroundColor: job.status == 'COMPLETED' ? Colors.green.withOpacity(0.2) : Colors.orange.withOpacity(0.2),
                        ),
                        const SizedBox(height: 8),
                        Text('${(job.inputSizeBytes / 1000000).toStringAsFixed(1)} MB -> ${(job.outputSizeBytes / 1000000).toStringAsFixed(1)} MB', style: const TextStyle(fontSize: 12)),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
