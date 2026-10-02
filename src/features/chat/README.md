# Modular Chat

The original 940-line chat component is split into focused modules.

## Structure

```text
chat/
├── Chat.jsx
├── components/
│   ├── ChatInterface.jsx
│   ├── QuickActions.jsx
│   └── VideoChat.jsx
├── hooks/
│   └── useWebRTC.js
└── services/
    └── signalingServer.js
```

## Responsibilities

- `Chat.jsx`: tab/navigation composition.
- `VideoChat.jsx`: video-call UI only.
- `ChatInterface.jsx`: text-chat UI and demo bot.
- `QuickActions.jsx`: quick-action UI.
- `useWebRTC.js`: camera/microphone, peer connection, call lifecycle and signaling handling.
- `signalingServer.js`: WebSocket/mock signaling transport.

## Install

Copy the files into your existing React source tree. Keep your existing `Chat.css`.

For example:

```text
src/
├── Chat.jsx
├── Chat.css
├── components/
├── hooks/
└── services/
```

If your existing `Chat.jsx` lives in a different directory, adjust the relative imports.

## Important

The current signaling URL is still the demo endpoint:

`wss://ws.postman-echo.com/raw`

This is not a production WebRTC signaling server. For real calls between two users, replace `signalingServer.js` with your own signaling backend (WebSocket/WebSocket-compatible service) and keep the `useWebRTC` API unchanged.
