import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import Anthropic from "@anthropic-ai/sdk"
import OpenAI from "openai"
import { GoogleGenerativeAI } from "@google/generative-ai"

const sectionPrompts: Record<string, string> = {
  SUMMARY: "Write an executive summary for the proposal.",
  PROBLEM: "Write a compelling problem statement that identifies the client's pain points.",
  SOLUTION: "Write a detailed proposed solution that addresses the identified problems.",
  TERMS: "Write professional terms and conditions for the proposal.",
  CUSTOM: "Write content for this proposal section.",
  COVER: "Write a brief cover page introduction.",
  TEAM: "Write team member introductions.",
  TIMELINE: "Write a project timeline overview.",
  PRICING: "Write a pricing justification.",
}

const systemPrompt = "You are an expert business proposal writer. You write clear, compelling proposal content. Always return only HTML content without markdown formatting or code blocks."

function buildUserPrompt(sectionType: string, tone: string, context: Record<string, string>, existingContent: string, action: string) {
  const toneInstruction = {
    professional: "Use a professional, corporate tone.",
    friendly: "Use a warm, approachable, and friendly tone.",
    persuasive: "Use a persuasive, compelling tone that drives action.",
    technical: "Use a precise, technical tone with specific details.",
  }[tone] || "Use a professional tone."

  if (action === "generate") {
    return `${sectionPrompts[sectionType] || sectionPrompts.CUSTOM}

Context:
- Company: ${context.companyName || "Our company"}
- Client: ${context.clientName || "The client"}
- Project: ${context.projectBrief || "The project"}
- Industry: ${context.industry || "General"}

${toneInstruction}

Write 2-4 paragraphs. Return only HTML content (use <p>, <h3>, <ul>, <li>, <strong>, <em> tags). Do not include any markdown.`
  } else if (action === "rewrite") {
    return `Rewrite the following content with a ${tone} tone. Keep the same meaning but improve clarity and impact.\n\n${existingContent}\n\nReturn only HTML content.`
  } else if (action === "shorter") {
    return `Make this content more concise — roughly half the length while keeping key points:\n\n${existingContent}\n\nReturn only HTML content.`
  } else {
    return `Expand this content with more detail, examples, and supporting points:\n\n${existingContent}\n\nReturn only HTML content.`
  }
}

async function streamClaude(userPrompt: string): Promise<ReadableStream> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" })
  const stream = client.messages.stream({
    model: "claude-sonnet-4-6-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: userPrompt }],
    system: systemPrompt,
  })

  const encoder = new TextEncoder()
  return new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          controller.enqueue(encoder.encode(event.delta.text))
        }
      }
      controller.close()
    },
  })
}

async function streamGrok(userPrompt: string): Promise<ReadableStream> {
  const client = new OpenAI({
    apiKey: process.env.XAI_API_KEY || "",
    baseURL: "https://api.x.ai/v1",
  })

  const stream = await client.chat.completions.create({
    model: "grok-3-mini-fast",
    max_tokens: 1024,
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  })

  const encoder = new TextEncoder()
  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content
        if (text) {
          controller.enqueue(encoder.encode(text))
        }
      }
      controller.close()
    },
  })
}

async function streamGroq(userPrompt: string): Promise<ReadableStream> {
  const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY || "",
    baseURL: "https://api.groq.com/openai/v1",
  })

  const stream = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 1024,
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  })

  const encoder = new TextEncoder()
  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content
        if (text) {
          controller.enqueue(encoder.encode(text))
        }
      }
      controller.close()
    },
  })
}

async function streamGemini(userPrompt: string): Promise<ReadableStream> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

  const result = await model.generateContentStream(
    `${systemPrompt}\n\n${userPrompt}`
  )

  const encoder = new TextEncoder()
  return new ReadableStream({
    async start(controller) {
      for await (const chunk of result.stream) {
        const text = chunk.text()
        if (text) {
          controller.enqueue(encoder.encode(text))
        }
      }
      controller.close()
    },
  })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { sectionType, tone, context, existingContent, action, provider } = await req.json()

  const userPrompt = buildUserPrompt(sectionType, tone, context, existingContent || "", action)

  const selectedProvider = provider || "groq"

  try {
    let readable: ReadableStream

    if (selectedProvider === "claude") {
      if (!process.env.ANTHROPIC_API_KEY) {
        return new Response("Anthropic API key not configured", { status: 500 })
      }
      readable = await streamClaude(userPrompt)
    } else if (selectedProvider === "grok") {
      if (!process.env.XAI_API_KEY) {
        return new Response("xAI API key not configured", { status: 500 })
      }
      readable = await streamGrok(userPrompt)
    } else if (selectedProvider === "gemini") {
      if (!process.env.GEMINI_API_KEY) {
        return new Response("Gemini API key not configured", { status: 500 })
      }
      readable = await streamGemini(userPrompt)
    } else {
      if (!process.env.GROQ_API_KEY) {
        return new Response("Groq API key not configured", { status: 500 })
      }
      readable = await streamGroq(userPrompt)
    }

    return new Response(readable, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI generation failed"
    return new Response(message, { status: 500 })
  }
}
