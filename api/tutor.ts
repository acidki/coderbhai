/// <reference types="node" />
import { groq } from '@ai-sdk/groq';
import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages, UIMessage } from 'ai';
import { TutorContext } from '../src/utils/tutorContext';

export const config = { runtime: 'edge' };

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: UIMessage[] = body.messages || [];
    const tutorContext: TutorContext =
      body.tutorContext || body.lessonContext || { mode: 'mistake', contextId: 'default' };

    const groqKey = process.env.GROQ_API_KEY;
    const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!groqKey && !googleKey) {
      return new Response(
        JSON.stringify({
          error:
            'ByteBot is offline: Neither GROQ_API_KEY nor GOOGLE_GENERATIVE_AI_API_KEY is configured on Vercel.',
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const {
      mode = 'mistake',
      courseId,
      language = 'en',
      questionType,
      prompt,
      codeContext,
      userAnswer,
      mentorTip,
      slideTitle,
      speech,
      codeSnippet,
      code,
      stderr,
    } = tutorContext;

    const isBengali = language === 'bn';

    let modeInstructions = '';
    if (mode === 'mistake') {
      modeInstructions = `MODE: EXPLAIN QUIZ MISTAKE (Socratic Guidance)
- Question Type: ${questionType || 'Quiz'}
- Problem Prompt: ${prompt || 'N/A'}
- Code / Snippet Context:
${codeContext || 'None'}
- Student's Failed Attempt:
${userAnswer || 'Unknown attempt'}
- Mentor Hint:
${mentorTip || 'None'}

RULES FOR THIS MODE:
1. Explain conceptually WHY the student's specific attempt fails or what misconception it reveals.
2. NEVER reveal the exact missing code token, direct line number, or complete correct answer.
3. Keep explanation under 3 short sentences.
4. Conclude with exactly 1 guiding Socratic question that helps them discover the solution.`;
    } else if (mode === 'slide_why') {
      modeInstructions = `MODE: FIRST-PRINCIPLES "WHY DOES THIS WORK?" (Conceptual Deep-Dive)
- Slide Title: ${slideTitle || 'Concept'}
- Lesson Speech / Explanation:
${speech || 'N/A'}
- Code Snippet:
${codeSnippet || 'None'}

RULES FOR THIS MODE:
1. Explain the underlying mental model and WHY languages or computers are designed this way from first principles.
2. Use an intuitive, punchy analogy or mental model.
3. Keep explanation under 3 short sentences.
4. Conclude with exactly 1 thought-provoking question to test their intuition.`;
    } else if (mode === 'code_error') {
      modeInstructions = `MODE: LIVE CODE COMPILER / RUNTIME ERROR DIAGNOSTIC
- Language: ${courseId || 'Programming'}
- Code Written:
${code || 'None'}
- Error / stderr Output:
${stderr || 'Unknown runtime error'}

RULES FOR THIS MODE:
1. Translate this compiler or runtime error into plain, intuitive words.
2. Help the student pinpoint the root cause without writing the finished fixed code for them.
3. Keep explanation under 3 short sentences.
4. Conclude with exactly 1 diagnostic question to guide their fix.`;
    }

    const systemPrompt = `You are ByteBot, an encouraging cat coding mentor for CoderBhai (ByteSized-Edu).
Your mission is to guide students with clear, dopamine-rich, Socratic intuition without ever spoiling answers.

GLOBAL CONSTRAINTS:
1. Be ultra-concise: reply in fewer than 3 short sentences.
2. Tone: Cheerful, friendly cat engineer (occasional subtle "Meow" or purr is welcome).
3. Always end your message with exactly 1 guiding question.
4. ${
      isBengali
        ? 'Reply in natural, encouraging Bengali (বাংলা). Keep all programming keywords, variables, types, and code syntax strictly in English.'
        : 'Reply in clear, beginner-friendly English.'
    }

${modeInstructions}`;

    const modelMessages = await convertToModelMessages(
      Array.isArray(messages) ? messages.slice(-4) : []
    );

    // Primary: Groq (llama-3.3-70b-versatile); Fallback: Google AI Studio (gemini-2.5-flash)
    let selectedModel;
    if (groqKey && googleKey) {
      const primary = groq('llama-3.3-70b-versatile');
      const fallback = google('gemini-2.5-flash');
      selectedModel = {
        ...primary,
        async doStream(options: any) {
          try {
            return await primary.doStream(options);
          } catch (err) {
            console.warn(
              '[ByteBot] Primary Groq stream failed; failing over to Google Gemini 2.5 Flash:',
              err
            );
            return await fallback.doStream(options);
          }
        },
      };
    } else if (groqKey) {
      selectedModel = groq('llama-3.3-70b-versatile');
    } else {
      selectedModel = google('gemini-2.5-flash');
    }

    const result = streamText({
      model: selectedModel as any,
      system: systemPrompt,
      messages: modelMessages,
      maxOutputTokens: 160,
    });

    return result.toUIMessageStreamResponse();
  } catch (error: unknown) {
    console.error('[ByteBot] Edge API handler error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
