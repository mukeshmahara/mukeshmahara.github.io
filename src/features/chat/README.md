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

Audio calls use WebRTC for live audio and the `audio-call` Socket.IO event for
offer, answer, ICE candidate, and hang-up signaling. Both participants must stay
in the same chat room. Microphone access and a secure context (HTTPS or localhost)
are required. For connections across restrictive NATs/firewalls, configure a TURN
server in `components/AudioCall.jsx`; the default STUN server alone may not connect
every network. Incoming audio calls show a centered answer/reject prompt; ending
or rejecting a call returns to the chat. Incoming audio and video calls play a
soft repeating ringtone and animate the call icon; browser autoplay settings may
require prior user interaction before sound can play.

Video calls are started from the video icon in the room header. The caller sends a
room-scoped `video-call-request`; the other participant's chat client shows an
incoming-call prompt. Answering opens the video interface and joins the call;
rejecting sends a room-scoped `call-rejected` signal without enabling the
camera or microphone. Both participants must grant camera/microphone access to
join. The existing WebRTC video UI and media controls use the room ID entered
for chat. Ending a video call closes the call interface and returns to the chat.
The Socket.IO host being available over HTTPS (including
`signaling.mukeshmahara.com.np`) does not provide a WebRTC media relay. Video
currently uses public STUN servers; networks that block direct peer connections
need a TURN server. Configure `REACT_APP_TURN_SERVER_URL` (one or more
comma-separated `turn:`/`turns:` URLs), `REACT_APP_TURN_SERVER_USERNAME`, and
`REACT_APP_TURN_SERVER_CREDENTIAL`, then rebuild/redeploy the frontend. Create
React App embeds these values in public browser code, so use short-lived,
restricted TURN credentials; do not put a permanent TURN secret in frontend
environment variables. Production deployments should obtain temporary TURN
credentials from a server-side endpoint.

Messages (sent and received) are stored in browser local storage under a key scoped
to the room ID, so history is available again on that browser. This is local
browser storage, not server-side history or encrypted storage.

Room IDs only group clients; the chat UI does not authenticate participants or
enforce a two-person room limit. The Socket.IO backend must enforce those rules if
the room is intended to be private and strictly one-to-one.

## Structure

- `Chat.jsx`: selects between text chat and video call.
- `components/ChatInterface.jsx`: room join, Socket.IO messaging, and local history.
- `components/AudioCall.jsx`: room-scoped WebRTC audio calls.
- `components/videoChat/VideoChat.jsx`: video-call interface.
- `hooks/useWebRTC.js`: camera/microphone, peer connection, and call lifecycle.
- `services/signaling.js`: Socket.IO transport shared by chat and video signaling.

The signaling server URL defaults to `https://signaling.mukeshmahara.com.np/` and
can be overridden in this Create React App project with
`REACT_APP_SIGNALING_SERVER_URL`. For a local server, set it to
`http://localhost:3001` in `.env.local` and restart the development server.
