const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [],
  resolver: {
    blockList: [
      // Ignora arquivos temporários do CMake
      /.*\.cxx\/.*/,
      /.*CMakeFiles\/.*/,
      /.*CMakeTmp\/.*/,
      // Ignora outros arquivos temporários comuns
      /.*\.gradle\/.*/,
      /.*\.idea\/.*/,
      /.*\.vscode\/.*/,
      /.*__pycache__\/.*/,
    ],
  },
  watcher: {
    // Configurações específicas para o watcher
    additionalExts: ['cxx', 'cc', 'cpp', 'h', 'hpp'],
    ignored: [
      // Ignora diretórios que podem causar problemas
      /.*\.cxx\/.*/,
      /.*CMakeFiles\/.*/,
      /.*CMakeTmp\/.*/,
      /.*\.gradle\/.*/,
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);