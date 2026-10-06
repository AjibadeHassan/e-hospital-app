import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'
import { getUserIdFromRequest } from '@/lib/auth'

interface TriageResult {
  urgency: 'routine' | 'soon' | 'urgent' | 'emergency'
  suggestedDepartment: string
  reasoning: string
  recommendedDoctors: { id: string; name: string; specialization: string }[]
  disclaimer: string
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json(
        { error: 'Please log in to use the triage assistant.' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { symptoms } = body

    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length < 5) {
      return NextResponse.json(
        { error: 'Please describe your symptoms (at least a few words).' },
        { status: 400 }
      )
    }

    // Fetch all departments and doctors to give the LLM real options to recommend
    const [departments, doctors] = await Promise.all([
      db.department.findMany({ orderBy: { name: 'asc' } }),
      db.user.findMany({
        where: { role: 'doctor', isActive: true },
        orderBy: { firstName: 'asc' },
        select: { id: true, firstName: true, lastName: true, specialization: true },
      }),
    ])

    const deptList = departments.map((d) => `- ${d.name}: ${d.description}`).join('\n')
    const doctorList = doctors
      .map((d) => `- Dr. ${d.firstName} ${d.lastName} (ID: ${d.id}) — Specialization: ${d.specialization || 'General'}`)
      .join('\n')

    const systemPrompt = `You are a medical triage assistant for the E-Hospital app. A patient has described their symptoms. Your job is to suggest which hospital department and doctor they should book an appointment with, and how urgent their situation is.

AVAILABLE DEPARTMENTS:
${deptList}

AVAILABLE DOCTORS:
${doctorList}

INSTRUCTIONS:
1. Analyze the symptoms the patient describes.
2. Determine the urgency level using these strict criteria:
   - "emergency": Life-threatening symptoms (chest pain, difficulty breathing, severe bleeding, loss of consciousness, stroke symptoms like facial drooping/slurred speech, severe allergic reaction, suicidal thoughts). Patient needs immediate emergency care.
   - "urgent": Symptoms that need prompt attention within 24-48 hours but are not immediately life-threatening (high fever, severe pain, signs of infection, persistent vomiting, etc.).
   - "soon": Symptoms that should be seen within a week (moderate pain, persistent cough, minor infections, etc.).
   - "routine": General checkups, mild symptoms, or non-urgent concerns.
3. Suggest the most appropriate department from the list above.
4. Recommend 1-3 doctors whose specialization matches the symptoms.
5. Provide brief reasoning for your suggestion.

CRITICAL SAFETY RULES:
- You are NOT diagnosing. You are only suggesting where to seek care.
- If symptoms sound like an emergency, set urgency to "emergency" and tell them to seek immediate care or call emergency services — do NOT suggest they just book an appointment.
- Never tell the patient what condition they have or what medication to take.
- Always include the disclaimer.

Respond with ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "urgency": "routine" | "soon" | "urgent" | "emergency",
  "suggestedDepartment": "Department Name (from the list above)",
  "reasoning": "1-2 sentences explaining the suggestion (not a diagnosis)",
  "recommendedDoctors": [{"id": "doctor_id", "name": "Dr. First Last", "specialization": "their specialization"}],
  "disclaimer": "This is not a medical diagnosis. Please consult a doctor for proper evaluation. If this is an emergency, call emergency services immediately."
}`

    const userMessage = `Patient symptoms: "${symptoms.trim()}"\n\nPlease analyze and respond with the JSON triage recommendation.`

    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      thinking: { type: 'disabled' },
    })

    const rawResponse = completion.choices?.[0]?.message?.content || ''

    // Parse the JSON response (handle potential markdown wrapping)
    let jsonStr = rawResponse.trim()
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
    }

    let result: TriageResult
    try {
      result = JSON.parse(jsonStr)
    } catch {
      // If JSON parsing fails, return the raw text as reasoning
      result = {
        urgency: 'soon',
        suggestedDepartment: departments[0]?.name || 'General',
        reasoning: rawResponse.slice(0, 300),
        recommendedDoctors: [],
        disclaimer:
          'This is not a medical diagnosis. Please consult a doctor for proper evaluation. If this is an emergency, call emergency services immediately.',
      }
    }

    // Safety override: if emergency keywords detected, force emergency urgency
    const emergencyKeywords = [
      'chest pain', 'difficulty breathing', 'can\'t breathe', 'unconscious',
      'severe bleeding', 'stroke', 'suicidal', 'overdose', 'not breathing',
      'seizure', 'choking',
    ]
    const lowerSymptoms = symptoms.toLowerCase()
    if (emergencyKeywords.some((kw) => lowerSymptoms.includes(kw))) {
      result.urgency = 'emergency'
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Triage error:', error)
    return NextResponse.json(
      {
        error:
          'The triage assistant is having trouble right now. If this is urgent, please call emergency services or contact the hospital directly.',
      },
      { status: 500 }
    )
  }
}
