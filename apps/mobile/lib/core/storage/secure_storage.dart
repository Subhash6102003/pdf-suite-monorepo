import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorage {
  final _storage = const FlutterSecureStorage();

  Future<void> saveAuthToken(String token) async => await _storage.write(key: 'token', value: token);
  Future<String?> getAuthToken() async => await _storage.read(key: 'token');
  Future<void> clearAuthToken() async => await _storage.delete(key: 'token');
}
