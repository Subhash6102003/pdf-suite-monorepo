import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pdf_suite/features/home/application/home_provider.dart';
import 'package:pdf_suite/features/home/presentation/widgets/recent_jobs_section.dart';
import 'package:pdf_suite/features/home/presentation/widgets/tool_grid_tile.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final recentJobs = ref.watch(homeNotifierProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('PDF Suite', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {},
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(homeNotifierProvider);
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Padding(
                padding: EdgeInsets.all(16.0),
                child: Text('What would you like to do?', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              ),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16.0),
                child: SearchBar(
                  leading: Icon(Icons.search),
                  hintText: 'Search tools...',
                ),
              ),
              const SizedBox(height: 16),
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 2,
                padding: const EdgeInsets.all(16.0),
                mainAxisSpacing: 16.0,
                crossAxisSpacing: 16.0,
                children: const [
                  ToolGridTile(
                    title: 'Compress PDF',
                    description: 'Reduce file size',
                    icon: Icons.compress,
                    route: '/compress-pdf',
                  ),
                  ToolGridTile(
                    title: 'Merge PDF',
                    description: 'Combine multiple files',
                    icon: Icons.merge_type,
                    route: '/merge-pdf',
                  ),
                  ToolGridTile(
                    title: 'Split PDF',
                    description: 'Extract pages',
                    icon: Icons.splitscreen,
                    route: '/split-pdf',
                  ),
                  ToolGridTile(
                    title: 'PDF to Word',
                    description: 'Convert to DOCX',
                    icon: Icons.description,
                    route: '/pdf-to-word',
                  ),
                  ToolGridTile(
                    title: 'JPG to PDF',
                    description: 'Convert images',
                    icon: Icons.image,
                    route: '/jpg-to-pdf',
                  ),
                ],
              ),
              recentJobs.when(
                data: (jobs) => jobs.isNotEmpty ? RecentJobsSection(jobs: jobs) : const SizedBox(),
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (err, stack) => Center(child: Text('Error: $err')),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
