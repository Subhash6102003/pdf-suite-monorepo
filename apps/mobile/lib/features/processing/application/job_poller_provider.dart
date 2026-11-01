import 'dart:async';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'job_poller_provider.g.dart';

@riverpod
class JobPollerNotifier extends _$JobPollerNotifier {
  Timer? _timer;

  @override
  Stream<String> build(String jobId) async* {
    final controller = StreamController<String>();
    
    _timer = Timer.periodic(const Duration(milliseconds: 1500), (timer) async {
      // Mock API call to get status
      // final status = await api.getJobStatus(jobId);
      // controller.add(status.stage);
      // if (status.isCompleted) timer.cancel();
    });

    ref.onDispose(() {
      _timer?.cancel();
      controller.close();
    });

    yield* controller.stream;
  }
}
