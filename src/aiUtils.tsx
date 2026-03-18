import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import Groq from "groq-sdk";
import { HfInference } from "@huggingface/inference";

export interface Message {
    role: 'user' | 'ai' | 'system';
    content: string;
}

export const looksLikeHtml = (content: string) => {
    const trimmed = content.trim();
    return (
        (trimmed.startsWith('<') && trimmed.endsWith('>')) ||
        (trimmed.includes('<div') && trimmed.includes('</div>')) ||
        (trimmed.includes('<table') && trimmed.includes('</table>')) ||
        (trimmed.includes('<details') && trimmed.includes('</details>'))
    );
};

export const SmartContent = ({ content, markdownComponents }: { content: string, markdownComponents: any }) => {
    if (looksLikeHtml(content)) {
        return <div dangerouslySetInnerHTML={{ __html: content }} />;
    }
    return (
        <ReactMarkdown
            components={markdownComponents}
            remarkPlugins={[remarkGfm]}
        >
            {content}
        </ReactMarkdown>
    );
};

export async function* generateAIResponseStream(
    prompt: string,
    history: Message[],
    config: {
        provider: string,
        model: string,
        apiKey: string,
        openAiApiKey: string,
        anthropicApiKey: string,
        groqApiKey: string,
        huggingFaceApiKey: string,
        temperature?: number
    }
) {
    const { provider, model, apiKey, openAiApiKey, anthropicApiKey, groqApiKey, huggingFaceApiKey } = config;

    try {
        if (provider === 'gemini') {
            const genAI = new GoogleGenerativeAI(apiKey);
            const geminiModel = genAI.getGenerativeModel({ model: model || "gemini-1.5-flash" });
            const chat = geminiModel.startChat({
                history: history.filter(m => m.role !== 'system').map(m => ({
                    role: m.role === 'ai' ? 'model' : 'user',
                    parts: [{ text: m.content }],
                })),
            });
            const result = await chat.sendMessageStream(prompt);
            for await (const chunk of result.stream) {
                yield chunk.text();
            }
        } else if (provider === 'openai') {
            const openai = new OpenAI({ apiKey: openAiApiKey, dangerouslyAllowBrowser: true });
            const stream = await openai.chat.completions.create({
                model: model || "gpt-4o",
                messages: [
                    ...history.map(m => ({ role: (m.role === 'ai' ? 'assistant' : m.role) as any, content: m.content })),
                    { role: 'user', content: prompt }
                ],
                stream: true,
            });
            for await (const chunk of stream) {
                yield chunk.choices[0]?.delta?.content || "";
            }
        } else if (provider === 'anthropic') {
            const anthropic = new Anthropic({ apiKey: anthropicApiKey, dangerouslyAllowBrowser: true });
            const stream = anthropic.messages.stream({
                model: model || "claude-3-5-sonnet-20241022",
                max_tokens: 4096,
                messages: [
                    ...history.filter(m => m.role !== 'system').map(m => ({ role: (m.role === 'ai' ? 'assistant' : 'user') as any, content: m.content })),
                    { role: 'user' as any, content: prompt }
                ],
            });
            for await (const chunk of stream) {
                if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                    yield chunk.delta.text;
                }
            }
        } else if (provider === 'groq') {
            const groq = new Groq({ apiKey: groqApiKey, dangerouslyAllowBrowser: true });
            const stream = await groq.chat.completions.create({
                model: model || "llama-3.3-70b-versatile",
                messages: [
                    ...history.map(m => ({ role: (m.role === 'ai' ? 'assistant' : m.role) as any, content: m.content })),
                    { role: 'user', content: prompt }
                ],
                stream: true,
            });
            for await (const chunk of stream) {
                yield chunk.choices[0]?.delta?.content || "";
            }
        } else if (provider === 'huggingface') {
            const hf = new HfInference(huggingFaceApiKey);
            const stream = hf.chatCompletionStream({
                model: model || "meta-llama/Llama-3.1-8B-Instruct",
                messages: [
                    ...history.map(m => ({ role: (m.role === 'ai' ? 'assistant' : m.role) as any, content: m.content })),
                    { role: 'user', content: prompt }
                ],
                max_tokens: 2048,
            });
            for await (const chunk of stream) {
                yield chunk.choices[0]?.delta?.content || "";
            }
        }
    } catch (error: any) {
        yield `Error: ${error.message || 'Failed to generate response'}`;
    }
}
