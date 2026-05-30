/**
 * State machine for the voice arc.
 *
 *   idle              pill rendered, no LiveKit room
 *   connecting        token fetch + room.connect in flight
 *   agent-joining     room joined, waiting for agent participant
 *   listening         agent ready, user mic active, no one speaking
 *   user-speaking     local mic level above gate
 *   agent-speaking    agent track audio above gate
 *   thinking          agent received user turn, generating response
 *   booking-confirmed summary card visible, awaiting next user turn
 *   feedback-prompt   agent has asked for a rating, listening for it
 *   thank-you         feedback captured, emoji + quote shown
 *   ended             collapse animation playing back to pill
 *   error             unrecoverable, surface message + retry pill
 */

export type VoiceState =
  | 'idle'
  | 'connecting'
  | 'agent-joining'
  | 'listening'
  | 'user-speaking'
  | 'agent-speaking'
  | 'thinking'
  | 'booking-confirmed'
  | 'feedback-prompt'
  | 'thank-you'
  | 'ended'
  | 'error';

export type FeedbackRating = 'great' | 'good' | 'okay' | 'bad';

export interface CaptionLine {
  id: string;
  from: 'user' | 'agent';
  text: string;
  /** True until the underlying transcription stream marks the line final. */
  partial: boolean;
}

export interface BookingPayload {
  slotIso: string;
  eventTitle: string;
  calEventLink?: string;
  addToCalendarUrl?: string;
  attendeeEmail?: string;
}

export interface FeedbackPayload {
  rating: FeedbackRating;
  quote?: string;
}

export interface VoiceMode {
  /** When true, mic is off; user types into the fallback input. */
  textOnly: boolean;
  captionsVisible: boolean;
  micMuted: boolean;
}
