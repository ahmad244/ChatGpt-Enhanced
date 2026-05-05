import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import openai from '../config/openaiConfig.js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface VoiceChatRequest extends Request {
  body: {
    audioData: string;
    conversationId?: string;
    model?: string;
  }
}

/**
 * @desc    Process audio and get AI response as audio
 * @route   POST /api/voice/chat
 * @access  Private
 */
const processVoiceChat = asyncHandler(async (req: VoiceChatRequest, res: Response) => {
  try {
    const { audioData, conversationId, model = 'tts-1' } = req.body;
    
    if (!audioData) {
      res.status(400);
      throw new Error('Audio data is required');
    }

    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    // Save incoming audio to file
    const inputAudioPath = path.join(tempDir, `${uuidv4()}.webm`);
    const base64Data = audioData.replace(/^data:audio\/webm;base64,/, '');
    fs.writeFileSync(inputAudioPath, Buffer.from(base64Data, 'base64'));

    // Transcribe audio to text
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(inputAudioPath),
      model: 'whisper-1',
    });

    // Get AI response to transcribed text
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: transcription.text }
      ],
      max_tokens: 500,
    });

    const responseText = completion.choices[0].message.content;

    // Convert text response to speech
    const speechResponse = await openai.audio.speech.create({
      model: model,
      voice: 'alloy',
      input: responseText || '', // Ensure non-null string
    });

    // Convert speech response to base64
    const audioBuffer = Buffer.from(await speechResponse.arrayBuffer());
    const outputAudioBase64 = `data:audio/mp3;base64,${audioBuffer.toString('base64')}`;

    // Clean up temp files
    fs.unlinkSync(inputAudioPath);

    res.status(200).json({
      success: true,
      transcribedText: transcription.text,
      responseText: responseText,
      audioResponse: outputAudioBase64,
      conversationId
    });

  } catch (error: unknown) {
    console.error("Voice chat error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process voice chat'
    });
  }
});

export { processVoiceChat };
