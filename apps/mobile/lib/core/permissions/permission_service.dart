import 'package:permission_handler/permission_handler.dart';

class PermissionService {
  Future<bool> requestFilePermission() async {
    return await Permission.storage.request().isGranted;
  }
  
  Future<bool> requestCameraPermission() async {
    return await Permission.camera.request().isGranted;
  }
}
