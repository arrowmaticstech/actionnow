const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('bridge, {
  sendGesture: (data) => ipcRenderer.send('gesture', data),
  onTranscriptionResult: (cb) => ipcRenderer.on('transcription_result', cb),
});