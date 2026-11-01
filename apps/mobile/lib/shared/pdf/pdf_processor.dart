import 'dart:io';
import 'dart:isolate';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:path_provider/path_provider.dart';
import 'package:uuid/uuid.dart';

import 'package:pdf_suite/features/compress/domain/compress_job.dart';
import 'package:pdf_suite/shared/pdf/isolates/merge_isolate.dart';
import 'package:pdf_suite/shared/pdf/isolates/split_isolate.dart';
import 'package:pdf_suite/shared/pdf/isolates/jpg_to_pdf_isolate.dart';

part 'pdf_processor.g.dart';

class ProcessingResult {
  final String outputPath;
  final int outputSizeBytes;

  ProcessingResult(this.outputPath, this.outputSizeBytes);
}

@riverpod
PdfProcessor pdfProcessor(PdfProcessorRef ref) => PdfProcessor();

class PdfProcessor {
  Future<ProcessingResult> processCompress(String inputPath, CompressionLevel level) async {
    // Compress logic via Isolate
    final dir = await getApplicationDocumentsDirectory();
    final outputPath = '${dir.path}/${const Uuid().v4()}.pdf';
    return await Isolate.run(() => _compressIsolate(inputPath, outputPath, level));
  }

  Future<ProcessingResult> processMerge(List<String> paths) async {
    final dir = await getApplicationDocumentsDirectory();
    final outputPath = '${dir.path}/${const Uuid().v4()}.pdf';
    return await Isolate.run(() => mergeIsolate(paths, outputPath));
  }

  Future<ProcessingResult> processSplit(String inputPath, List<int> ranges) async {
    final dir = await getApplicationDocumentsDirectory();
    final outputDir = '${dir.path}/${const Uuid().v4()}';
    Directory(outputDir).createSync();
    return await Isolate.run(() => splitIsolate(inputPath, outputDir, ranges));
  }

  Future<ProcessingResult> processJpgToPdf(List<String> imagePaths) async {
    final dir = await getApplicationDocumentsDirectory();
    final outputPath = '${dir.path}/${const Uuid().v4()}.pdf';
    return await Isolate.run(() => jpgToPdfIsolate(imagePaths, outputPath));
  }
}

ProcessingResult _compressIsolate(String inputPath, String outputPath, CompressionLevel level) {
  // Simplified logic
  final file = File(inputPath);
  file.copySync(outputPath);
  return ProcessingResult(outputPath, File(outputPath).lengthSync());
}
