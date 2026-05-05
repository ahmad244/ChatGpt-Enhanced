import openai from '../config/openaiConfig';
import { Server, Socket } from 'socket.io';
import { File } from '@web-std/file';
import { ChatCompletion } from 'openai/resources/chat/completions';

/**
 * Handle voice chat socket communications
 * @param {Server} io - Socket.io instance
 */
const setupVoiceChatHandlers = (io: Server) => {
  const voiceChatNamespace = io.of('/voice-chat');
  
  voiceChatNamespace.on('connection', (socket: Socket) => {
    console.log(`Voice chat client connected: ${socket.id}`);
    
    // Handle when client starts recording
    socket.on('stream-start', (data: { userId: string; conversationId: string }) => {
      const { userId, conversationId } = data;
      socket.join(`voice-${conversationId}`);
      console.log(`User ${userId} started streaming in conversation ${conversationId}`);
    });
    
    // Handle audio chunks
    socket.on('audio-chunk', async (data: { audioChunk: string; userId: string; conversationId: string; isLastChunk: boolean }) => {
      try {
        const { audioChunk, userId, conversationId, isLastChunk } = data;
        
        // Process the audio chunk directly
        const base64Data = audioChunk.replace(/^data:audio\/webm;base64,/, '');
        const audioBuffer = Buffer.from(base64Data, 'base64');
        
        // Create File object directly from buffer
        const audioFile = new File([audioBuffer], 'audio.webm', { type: 'audio/webm' });
        
        // Start transcription immediately without waiting for last chunk
        const transcriptionPromise = openai.audio.transcriptions.create({
          file: audioFile,
          model: 'whisper-1',
        });

        // If this is the last chunk, wait for transcription and process response
        if (isLastChunk) {
          const transcription = await transcriptionPromise;
          
          // First get the AI completion response
          const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are a helpful assistant.' },
              { role: 'user', content: transcription.text }
            ],
          });

          // Then generate speech from the completion response
          const speechResponse = await openai.audio.speech.create({
            model: 'tts-1',
            voice: 'alloy',
            input: completion.choices[0].message.content || '',
          });

          const outputAudioBase64 = `data:audio/mp3;base64,${Buffer.from(await speechResponse.arrayBuffer()).toString('base64')}`;
          
          socket.emit('voice-response', {
            success: true,
            transcribedText: transcription.text,
            responseText: completion.choices[0].message.content,
            audioResponse: outputAudioBase64,
            conversationId,
          });
        }
      } catch (error: unknown) {
        console.error('Error processing voice chat:', (error as Error).message);
        socket.emit('voice-error', {
          message: 'Failed to process voice input',
          error: (error as Error).message,
        });
      }
    });
    
    // Handle client disconnection
    socket.on('disconnect', () => {
      console.log(`Voice chat client disconnected: ${socket.id}`);
    });
  });
};

export default setupVoiceChatHandlers;
