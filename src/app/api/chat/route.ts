import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'
import { getUserIdFromRequest } from '@/lib/auth'

// Build a rich context string from the logged-in patient's data so the LLM
// can answer questions grounded in their actual medical records.
async function buildPatientContext(userId: string): Promise<string> {
  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) return 'Patient record not found.'

  const [appointments, prescriptions, records] = await Promise.all([
    db.appointment.findMany({
      where: { patientId: userId },
      orderBy: { appointmentDate: 'desc' },
      take: 10,
    }),
    db.prescription.findMany({
      where: { patientId: userId },
      orderBy: { prescriptionDate: 'desc' },
      take: 10,
    }),
    db.medicalRecord.findMany({
      where: { patientId: userId },
      orderBy: { recordDate: 'desc' },
      take: 10,
    }),
  ])

  // Resolve related doctor/department names
  const doctorIds = new Set<string>([
    ...appointments.map((a) => a.doctorId),
    ...prescriptions.map((p) => p.doctorId).filter(Boolean) as string[],
    ...records.map((r) => r.doctorId).filter(Boolean) as string[],
  ])
  const doctors = await db.user.findMany({
    where: { id: { in: Array.from(doctorIds) } },
    select: { id: true, firstName: true, lastName: true, specialization: true, email: true },
  })
  const doctorMap = new Map(doctors.map((d) => [d.id, d]))

  const deptIds = new Set(appointments.map((a) => a.departmentId).filter(Boolean) as string[])
  const departments = await db.department.findMany({
    where: { id: { in: Array.from(deptIds) } },
  })
  const deptMap = new Map(departments.map((d) => [d.id, d]))

  const apptLines = appointments
    .map((a) => {
      const doc = doctorMap.get(a.doctorId)
      const dept = a.departmentId ? deptMap.get(a.departmentId) : null
      return `- ${new Date(a.appointmentDate).toLocaleString()} | Dr. ${doc?.firstName || ''} ${doc?.lastName || ''} (${doc?.specialization || 'General'}) | ${dept?.name || 'General'} | Status: ${a.status} | Reason: ${a.reason}${a.notes ? ` | Notes: ${a.notes}` : ''}`
    })
    .join('\n')

  const rxLines = prescriptions
    .map((p) => {
      const doc = p.doctorId ? doctorMap.get(p.doctorId) : null
      return `- ${p.medicineName} (${p.genericName}, ${p.strength}, ${p.form}) | Dosage: ${p.dosage} ${p.frequency} for ${p.duration} | Quantity: ${p.quantity} | Refills left: ${p.refillsRemaining}/${p.refills} | Status: ${p.status} (${p.isActive ? 'active' : 'inactive'}) | Prescribed by: Dr. ${doc?.firstName || ''} ${doc?.lastName || ''} | Instructions: ${p.instructions || 'None'}`
    })
    .join('\n')

  const recordLines = records
    .map((r) => {
      const doc = r.doctorId ? doctorMap.get(r.doctorId) : null
      return `- ${new Date(r.recordDate).toLocaleDateString()} | ${r.recordType.replace('_', ' ')} | ${r.title} | By: Dr. ${doc?.firstName || ''} ${doc?.lastName || ''} | Description: ${r.description}${r.findings ? ` | Findings: ${r.findings}` : ''}${r.recommendations ? ` | Recommendations: ${r.recommendations}` : ''} | Verified: ${r.isVerified ? 'Yes' : 'No'}`
    })
    .join('\n')

  return `PATIENT PROFILE
Name: ${user.firstName} ${user.lastName}
Role: ${user.role}
Email: ${user.email}
${user.phoneNumber ? `Phone: ${user.phoneNumber}` : ''}

UPCOMING & PAST APPOINTMENTS (most recent 10):
${apptLines || 'No appointments on record.'}

PRESCRIPTIONS (most recent 10):
${rxLines || 'No prescriptions on record.'}

MEDICAL RECORDS (most recent 10):
${recordLines || 'No medical records on file.'}`
}

const SYSTEM_PROMPT = `You are a helpful healthcare assistant for the E-Hospital app. You help patients understand their own medical information — appointments, prescriptions, and medical records — which is provided to you in the context below.

CRITICAL SAFETY RULES (never violate these):
1. You are NOT a doctor. You cannot diagnose, prescribe, or give medical advice.
2. NEVER tell a patient what medication to take, what dose to adjust, or whether to stop a medication.
3. NEVER interpret lab results, imaging findings, or diagnoses — only summarize what the record states.
4. If a patient describes symptoms that sound urgent (chest pain, difficulty breathing, severe bleeding, stroke symptoms, suicidal thoughts, etc.), tell them to SEEK IMMEDIATE MEDICAL ATTENTION or call emergency services. Do not attempt to assess the symptoms yourself.
5. Always recommend the patient consult their doctor for medical decisions.

WHAT YOU CAN DO:
- Summarize the patient's upcoming appointments, prescriptions, and medical records.
- Answer questions like "When is my next appointment?", "What medications am I taking?", "What did my last lab result show?" (by summarizing the record, not interpreting it).
- Remind patients of their doctor's instructions as recorded.
- Help them understand what their records say in plain language.

RESPONSE STYLE:
- Be warm, clear, and concise (2-4 sentences unless more detail is requested).
- Use plain language — avoid jargon when possible.
- If asked about something not in their records, say you don't have that information in their records and suggest they contact their doctor or the hospital.
- Always include a brief disclaimer when discussing medications or test results: "This is a summary of your records, not medical advice. Please consult your doctor for any medical decisions."

PATIENT CONTEXT:
__CONTEXT__`

// General mode for unauthenticated visitors (landing page)
const GENERAL_SYSTEM_PROMPT = `You are the E-Hospital virtual assistant. You help visitors learn about the hospital's services and how to use the platform. You are NOT a medical advisor — you cannot diagnose, prescribe, or give medical advice.

WHAT YOU CAN DO:
- Explain the E-Hospital platform features (appointments, medical records, prescriptions, notifications)
- Help visitors understand how to register and log in
- Describe the available departments and services
- Guide visitors on how to book an appointment
- Answer general questions about the hospital

IF ASKED ABOUT MEDICAL SYMPTOMS:
- Do NOT attempt to diagnose or assess symptoms
- Recommend they book an appointment with the appropriate doctor
- If symptoms sound urgent (chest pain, difficulty breathing, severe bleeding, etc.), tell them to seek immediate emergency care

RESPONSE STYLE:
- Be warm, welcoming, and concise (2-4 sentences)
- Encourage visitors to register or log in to access full features
- If asked about something you don't know, suggest they register and use the in-app assistant after logging in, or contact the hospital directly

E-HOSPITAL INFO:
- Platform: A comprehensive healthcare management system
- Features: Appointment booking, medical records, prescriptions, notifications, multi-role dashboards (patient, doctor, nurse, pharmacist)
- Departments: Cardiology, Neurology, Pediatrics (and more)
- Demo accounts: patient@ehospital.com / password123 (patient), drsmith@ehospital.com / password123 (doctor)
- How to use: Register for an account, log in, then book appointments, view records, and manage prescriptions from your dashboard`

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req)
    // No 401 — allow unauthenticated users (general mode)

    const body = await req.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required.' },
        { status: 400 }
      )
    }

    // Cap conversation history to last 12 messages
    const trimmedMessages = messages.slice(-12)

    let systemPrompt: string

    if (userId) {
      // Authenticated: use RAG over patient data
      const patientContext = await buildPatientContext(userId)
      systemPrompt = SYSTEM_PROMPT.replace('__CONTEXT__', patientContext)
    } else {
      // Unauthenticated: general hospital info mode
      systemPrompt = GENERAL_SYSTEM_PROMPT
    }

    const fullMessages = [
      { role: 'assistant', content: systemPrompt },
      ...trimmedMessages,
    ]

    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: fullMessages,
      thinking: { type: 'disabled' },
    })

    const response =
      completion.choices?.[0]?.message?.content ||
      "I'm sorry, I couldn't generate a response. Please try again."

    return NextResponse.json({ response })
  } catch (error: any) {
    console.error('E-Hospital chat error:', error)
    return NextResponse.json(
      {
        error:
          'The assistant is having trouble responding right now. If this is a medical matter, please contact your doctor directly.',
      },
      { status: 500 }
    )
  }
}
