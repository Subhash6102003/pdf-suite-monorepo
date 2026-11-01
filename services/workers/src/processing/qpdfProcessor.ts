import { spawn } from 'child_process';

export class QpdfProcessor {
  public static async compress(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = [
        '--compress-streams=y',
        '--object-streams=generate',
        '--remove-unreferenced-resources=yes',
        inputPath,
        outputPath
      ];
      
      const qpdf = spawn('qpdf', args);
      
      qpdf.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`qpdf failed with code ${code}`));
      });
      
      qpdf.on('error', (err) => reject(err));
    });
  }
}
