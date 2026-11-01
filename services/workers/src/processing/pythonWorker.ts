import { spawn } from 'child_process';

export class PythonWorker {
  public static async executeScript(script: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const py = spawn('python3', ['-c', script]);
      py.on('close', code => code === 0 ? resolve() : reject(new Error('Python error')));
    });
  }
}
