import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const Scaffold(body: Center(child: Text('Home'))),
      ),
      GoRoute(
        path: '/compress-pdf',
        builder: (context, state) => const Scaffold(body: Center(child: Text('Compress'))),
      ),
      GoRoute(
        path: '/merge-pdf',
        builder: (context, state) => const Scaffold(body: Center(child: Text('Merge'))),
      ),
      GoRoute(
        path: '/split-pdf',
        builder: (context, state) => const Scaffold(body: Center(child: Text('Split'))),
      ),
      GoRoute(
        path: '/pdf-to-word',
        builder: (context, state) => const Scaffold(body: Center(child: Text('PdfToWord'))),
      ),
      GoRoute(
        path: '/jpg-to-pdf',
        builder: (context, state) => const Scaffold(body: Center(child: Text('JpgToPdf'))),
      ),
      GoRoute(
        path: '/processing/:jobId',
        builder: (context, state) => const Scaffold(body: Center(child: Text('Processing'))),
      ),
      GoRoute(
        path: '/result/:jobId',
        builder: (context, state) => const Scaffold(body: Center(child: Text('Result'))),
      ),
    ],
  );
});
