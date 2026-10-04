# Chat

## Text chat

Both participants enter the same room ID to join a chat. Messages are sent through
the existing Socket.IO connection using the `chat-message` event. The event payload
is `{ roomId, message }`, where text messages contain an `id`, `text`, `sentAt`,
and `senderId`. The server relays this event to other members of the room.

Voice messages can be recorded for up to 20 seconds. The browser sends the audio
data with the same event and stores it in that room's local browser history. A
recording is limited to 500 KB before encoding; microphone permission is required.
The Socket.IO server must relay the payload and acknowledge it. Restart the server
after updating its `chat-message` handler. The client only displays a sent voice
message after the server acknowledges it.

Messages (sent and received) are stored in browser local storage under a key scoped
to the room ID, so history is available again on that browser. This is local
browser storage, not server-side history or encrypted storage.

Room IDs only group clients; the chat UI does not authenticate participants or
enforce a two-person room limit. The Socket.IO backend must enforce those rules if
the room is intended to be private and strictly one-to-one.

## Structure

- `Chat.jsx`: selects between text chat and video call.
- `components/ChatInterface.jsx`: room join, Socket.IO messaging, and local history.
- `components/videoChat/VideoChat.jsx`: video-call interface.
- `hooks/useWebRTC.js`: camera/microphone, peer connection, and call lifecycle.
- `services/signaling.js`: Socket.IO transport shared by chat and video signaling.

The signaling server URL defaults to `https://signaling.mukeshmahara.com.np/` and
can be overridden in this Create React App project with
`REACT_APP_SIGNALING_SERVER_URL`. For a local server, set it to
`http://localhost:3001` in `.env.local` and restart the development server.
