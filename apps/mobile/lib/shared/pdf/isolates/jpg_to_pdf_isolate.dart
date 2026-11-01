import 'dart:io';
import 'package:image/image.dart' as img;
import 'package:pdf/widgets.dart' as pw;
import 'package:pdf_suite/shared/pdf/pdf_processor.dart';

ProcessingResult jpgToPdfIsolate(List<String> imagePaths, String outputPath) {
  final pdf = pw.Document();

  for (final path in imagePaths) {
    final bytes = File(path).readAsBytesSync();
    final image = img.decodeImage(bytes);
    if (image != null) {
      pdf.addPage(
        pw.Page(
          build: (pw.Context context) {
            return pw.Center(
              child: pw.Text('Image Page Mock'),
            );
          },
        ),
      );
    }
  }

  final bytes = pdf.save();
  File(outputPath).writeAsBytesSync(bytes as List<int>);
  
  return ProcessingResult(outputPath, File(outputPath).lengthSync());
}
