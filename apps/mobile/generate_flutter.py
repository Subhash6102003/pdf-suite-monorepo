import os
import pathlib

base_dir = r"d:\money\apps\mobile"

files = {
    "pubspec.yaml": """name: pdf_suite
description: "PDF Suite Mobile App"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.2.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  flutter_riverpod: ^2.5.0
  riverpod_annotation: ^2.3.0
  go_router: ^14.0.0
  go_router_builder: ^4.0.0
  dio: ^5.4.0
  flutter_secure_storage: ^9.0.0
  sqflite: ^2.3.0
  path_provider: ^2.1.0
  file_picker: ^8.0.0
  image_picker: ^1.1.0
  share_plus: ^7.0.0
  permission_handler: ^11.0.0
  connectivity_plus: ^6.0.0
  google_fonts: ^6.0.0
  pdfrx: ^1.0.0
  pdf: ^3.10.0
  image: ^4.1.0
  sentry_flutter: ^8.0.0
  freezed_annotation: ^2.4.0
  json_annotation: ^4.8.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  build_runner: ^2.4.0
  riverpod_generator: ^2.3.0
  freezed: ^2.4.0
  json_serializable: ^6.7.0

flutter:
  uses-material-design: true
""",
    "lib/main.dart": """import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'app.dart';
import 'core/storage/job_queue_db.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await JobQueueDb.init();

  await SentryFlutter.init(
    (options) {
      options.dsn = const String.fromEnvironment('SENTRY_DSN', defaultValue: '');
      options.tracesSampleRate = 1.0;
    },
    appRunner: () => runApp(const ProviderScope(child: PdfSuiteApp())),
  );
}
""",
    "lib/app.dart": """import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';

class PdfSuiteApp extends ConsumerWidget {
  const PdfSuiteApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    return MaterialApp.router(
      title: 'PDF Suite',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      routerConfig: router,
    );
  }
}
""",
    "lib/core/router/app_router.dart": """import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
// import screens...

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
""",
    "lib/core/theme/app_theme.dart": """import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static final lightTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF6366F1), brightness: Brightness.light),
    textTheme: GoogleFonts.outfitTextTheme(),
  );
  
  static final darkTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF6366F1), brightness: Brightness.dark),
    textTheme: GoogleFonts.outfitTextTheme(ThemeData.dark().textTheme),
  );
}
""",
    "lib/core/theme/colors.dart": """import 'package:flutter/material.dart';

class AppColors {
  static const Color primary = Color(0xFF6366F1);
}
""",
    "lib/core/network/api_client.dart": """import 'package:dio/dio.dart';

class ApiClient {
  final Dio dio;

  ApiClient() : dio = Dio(BaseOptions(
    baseUrl: const String.fromEnvironment('API_URL', defaultValue: 'https://api.example.com'),
    connectTimeout: const Duration(seconds: 30),
    receiveTimeout: const Duration(seconds: 120),
  )) {
    // dio.interceptors.add(AuthInterceptor());
    // dio.interceptors.add(RetryInterceptor());
  }
}
""",
    "lib/core/network/auth_interceptor.dart": """import 'package:dio/dio.dart';

class AuthInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    // Add auth token
    super.onRequest(options, handler);
  }
}
""",
    "lib/core/network/retry_interceptor.dart": """import 'package:dio/dio.dart';

class RetryInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    // Retry logic
    super.onError(err, handler);
  }
}
""",
    "lib/core/network/connectivity_service.dart": """import 'package:connectivity_plus/connectivity_plus.dart';

class ConnectivityService {
  Future<bool> get isConnected async {
    var connectivityResult = await (Connectivity().checkConnectivity());
    return connectivityResult != ConnectivityResult.none;
  }
}
""",
    "lib/core/storage/secure_storage.dart": """import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorage {
  final _storage = const FlutterSecureStorage();

  Future<void> saveAuthToken(String token) async => await _storage.write(key: 'token', value: token);
  Future<String?> getAuthToken() async => await _storage.read(key: 'token');
  Future<void> clearAuthToken() async => await _storage.delete(key: 'token');
}
""",
    "lib/core/storage/job_queue_db.dart": """import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class JobQueueDb {
  static late Database db;

  static Future<void> init() async {
    String path = join(await getDatabasesPath(), 'job_queue.db');
    db = await openDatabase(
      path,
      version: 1,
      onCreate: (Database db, int version) async {
        await db.execute(
          'CREATE TABLE offline_jobs (id TEXT PRIMARY KEY, tool_name TEXT, input_file_path TEXT, params TEXT, status TEXT, created_at INTEGER)'
        );
      },
    );
  }
}
""",
    "lib/core/errors/error_translator.dart": """class ErrorTranslator {
  static String translate(String code) {
    switch (code) {
      case 'FILE_TOO_LARGE': return 'File is too large.';
      default: return 'An error occurred.';
    }
  }
}
""",
    "lib/core/permissions/permission_service.dart": """import 'package:permission_handler/permission_handler.dart';

class PermissionService {
  Future<bool> requestFilePermission() async {
    return await Permission.storage.request().isGranted;
  }
  
  Future<bool> requestCameraPermission() async {
    return await Permission.camera.request().isGranted;
  }
}
""",
    "lib/features/home/presentation/home_screen.dart": """// Placeholder""",
    "lib/features/home/presentation/widgets/tool_grid_tile.dart": """// Placeholder""",
    "lib/features/home/presentation/widgets/recent_jobs_section.dart": """// Placeholder""",
    "lib/features/home/application/home_provider.dart": """// Placeholder""",
    "lib/features/compress/presentation/compress_screen.dart": """// Placeholder""",
    "lib/features/compress/presentation/widgets/compression_level_selector.dart": """// Placeholder""",
    "lib/features/compress/application/compress_provider.dart": """// Placeholder""",
    "lib/features/compress/domain/compress_job.dart": """// Placeholder""",
    "lib/features/merge/presentation/merge_screen.dart": """// Placeholder""",
    "lib/features/merge/application/merge_provider.dart": """// Placeholder""",
    "lib/features/split/presentation/split_screen.dart": """// Placeholder""",
    "lib/features/split/application/split_provider.dart": """// Placeholder""",
    "lib/features/pdf_to_word/presentation/pdf_to_word_screen.dart": """// Placeholder""",
    "lib/features/pdf_to_word/application/pdf_to_word_provider.dart": """// Placeholder""",
    "lib/features/jpg_to_pdf/presentation/jpg_to_pdf_screen.dart": """// Placeholder""",
    "lib/features/jpg_to_pdf/application/jpg_to_pdf_provider.dart": """// Placeholder""",
    "lib/features/processing/presentation/processing_screen.dart": """// Placeholder""",
    "lib/features/processing/application/job_poller_provider.dart": """// Placeholder""",
    "lib/features/result/presentation/result_screen.dart": """// Placeholder""",
    "lib/features/result/application/result_provider.dart": """// Placeholder""",
    "lib/features/offline_queue/application/offline_queue_provider.dart": """// Placeholder""",
    "lib/features/offline_queue/infrastructure/job_queue_repository.dart": """// Placeholder""",
    "lib/shared/pdf/pdf_processor.dart": """// Placeholder""",
    "lib/shared/pdf/isolates/merge_isolate.dart": """// Placeholder""",
    "lib/shared/pdf/isolates/split_isolate.dart": """// Placeholder""",
    "lib/shared/pdf/isolates/jpg_to_pdf_isolate.dart": """// Placeholder""",
    "lib/shared/pdf/verification/pdf_verifier.dart": """// Placeholder""",
    "lib/shared/widgets/app_file_picker.dart": """// Placeholder""",
    "lib/shared/widgets/stage_indicator.dart": """// Placeholder""",
    "lib/shared/widgets/size_comparison_card.dart": """// Placeholder""",
    "android/app/src/main/AndroidManifest.xml": """<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application android:label="PDF Suite" android:name="\${applicationName}" android:icon="@mipmap/ic_launcher">
        <activity android:name=".MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
            <intent-filter>
                <action android:name="android.intent.action.SEND"/>
                <category android:name="android.intent.category.DEFAULT"/>
                <data android:mimeType="application/pdf"/>
            </intent-filter>
            <intent-filter>
                <action android:name="android.intent.action.SEND_MULTIPLE"/>
                <category android:name="android.intent.category.DEFAULT"/>
                <data android:mimeType="image/*"/>
            </intent-filter>
            <intent-filter>
                <action android:name="android.intent.action.VIEW"/>
                <category android:name="android.intent.category.DEFAULT"/>
                <data android:mimeType="application/pdf"/>
            </intent-filter>
        </activity>
    </application>
</manifest>""",
    "android/app/src/main/kotlin/com/example/pdf_suite/MainActivity.kt": """package com.example.pdf_suite

import io.flutter.embedding.android.FlutterActivity

class MainActivity: FlutterActivity() {
}""",
    "ios/Runner/Info.plist": """<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>$(DEVELOPMENT_LANGUAGE)</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>pdf_suite</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>$(FLUTTER_BUILD_NAME)</string>
    <key>CFBundleSignature</key>
    <string>????</string>
    <key>CFBundleVersion</key>
    <string>$(FLUTTER_BUILD_NUMBER)</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    <key>UILaunchStoryboardName</key>
    <string>LaunchScreen</string>
    <key>UIMainStoryboardFile</key>
    <string>Main</string>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
    </array>
    <key>UIViewControllerBasedStatusBarAppearance</key>
    <false/>
</dict>
</plist>""",
    "fastlane/Fastfile": """default_platform(:ios)

platform :ios do
  lane :test do
    sh("flutter test")
  end

  lane :build_ios do
    match(type: "appstore")
    sh("flutter build ipa --release")
  end

  lane :release_ios do
    build_ios
    upload_to_testflight
  end
end

platform :android do
  lane :build_android do
    sh("flutter build appbundle --release")
  end

  lane :release_android do
    build_android
    upload_to_play_store(track: "internal")
  end
end""",
    "fastlane/Appfile": """app_identifier(ENV["APP_IDENTIFIER"])
apple_id(ENV["APPLE_ID"])
team_id(ENV["TEAM_ID"])""",
    "fastlane/Matchfile": """git_url(ENV["MATCH_GIT_URL"])
type("appstore")
app_identifier(ENV["APP_IDENTIFIER"])"""
}

for rel_path, content in files.items():
    full_path = os.path.join(base_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)
